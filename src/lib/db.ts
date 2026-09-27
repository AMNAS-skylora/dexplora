import { MongoClient, ObjectId } from "mongodb";

const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getClientPromise(): Promise<MongoClient> {
  const rawUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const uri = rawUri?.trim();

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add a valid MongoDB connection string to environment variables."
    );
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "Invalid MONGODB_URI. Connection string must start with mongodb:// or mongodb+srv://"
    );
  }

  if (!global._mongoClientPromise) {
    global._mongoClient = new MongoClient(uri, mongoOptions);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  return global._mongoClientPromise;
}

export function getDb() {
  const rawUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const uri = rawUri?.trim();

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add a valid MongoDB connection string to environment variables."
    );
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "Invalid MONGODB_URI. Connection string must start with mongodb:// or mongodb+srv://"
    );
  }

  const dbName = process.env.MONGODB_DB || undefined;

  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, mongoOptions);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  return global._mongoClient.db(dbName);
}

function toObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id as any;
}

function transformDoc(doc: any): any {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map(transformDoc);
  if (typeof doc !== "object") return doc;

  const transformed: any = { ...doc };
  if (transformed._id) {
    transformed.id = transformed._id.toString();
    delete transformed._id;
  }

  for (const key of Object.keys(transformed)) {
    if (transformed[key] instanceof ObjectId) {
      transformed[key] = transformed[key].toString();
    } else if (transformed[key] && typeof transformed[key] === "object" && !(transformed[key] instanceof Date)) {
      transformed[key] = transformDoc(transformed[key]);
    }
  }

  return transformed;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function transformFieldOperators(condition: any): any {
  if (
    condition === null ||
    typeof condition !== "object" ||
    Array.isArray(condition) ||
    condition instanceof Date ||
    condition instanceof ObjectId
  ) {
    return condition;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(condition)) {
    switch (key) {
      case "equals":
        result.$eq = value;
        break;

      case "not":
        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date) &&
          !(value instanceof ObjectId)
        ) {
          const nested = transformFieldOperators(value);
          if (
            nested !== null &&
            typeof nested === "object" &&
            !Array.isArray(nested)
          ) {
            result.$not = nested;
          } else {
            result.$ne = nested;
          }
        } else {
          result.$ne = value;
        }
        break;

      case "ne":
        result.$ne = value;
        break;

      case "in":
        result.$in = value;
        break;

      case "notIn":
        result.$nin = value;
        break;

      case "lt":
        result.$lt = value;
        break;

      case "lte":
        result.$lte = value;
        break;

      case "gt":
        result.$gt = value;
        break;

      case "gte":
        result.$gte = value;
        break;

      case "contains":
        result.$regex = escapeRegex(String(value));
        break;

      case "startsWith":
        result.$regex = `^${escapeRegex(String(value))}`;
        break;

      case "endsWith":
        result.$regex = `${escapeRegex(String(value))}$`;
        break;

      default:
        result[key.startsWith("$") ? key : `$${key}`] = value;
    }
  }

  return result;
}

export function transformWhere(where: any): any {
  if (!where) return {};
  const filter: any = {};

  const knownOperators = [
    "gte",
    "lte",
    "gt",
    "lt",
    "in",
    "notIn",
    "equals",
    "not",
    "ne",
    "contains",
    "startsWith",
    "endsWith",
  ];

  for (const [key, val] of Object.entries(where)) {
    if (key === "id") {
      if (typeof val === "string") {
        filter._id = toObjectId(val);
      } else if (val && typeof val === "object" && !(val instanceof ObjectId) && !(val instanceof Date)) {
        const cond: any = {};
        for (const [op, opVal] of Object.entries(val as any)) {
          if (op === "in" && Array.isArray(opVal)) {
            cond["$in"] = opVal.map(toObjectId);
          } else if (op === "notIn" && Array.isArray(opVal)) {
            cond["$nin"] = opVal.map(toObjectId);
          } else if (op === "not" || op === "ne") {
            if (opVal !== null && typeof opVal === "object" && !Array.isArray(opVal)) {
              cond["$not"] = opVal;
            } else {
              cond["$ne"] = typeof opVal === "string" ? toObjectId(opVal) : opVal;
            }
          } else if (op === "equals") {
            cond["$eq"] = typeof opVal === "string" ? toObjectId(opVal) : opVal;
          } else {
            cond[op.startsWith("$") ? op : `$${op}`] = opVal;
          }
        }
        filter._id = cond;
      } else {
        filter._id = val;
      }
    } else if (key === "OR" && Array.isArray(val)) {
      filter["$or"] = val.map(transformWhere);
    } else if (key === "AND" && Array.isArray(val)) {
      filter["$and"] = val.map(transformWhere);
    } else if (key === "NOT") {
      if (Array.isArray(val)) {
        filter["$nor"] = val.map(transformWhere);
      } else if (val && typeof val === "object") {
        filter["$nor"] = [transformWhere(val)];
      }
    } else if (typeof val === "object" && val !== null && !(val instanceof Date) && !(val instanceof ObjectId)) {
      const keys = Object.keys(val as any);
      const isOperatorFilter = keys.length > 0 && keys.every((k) => knownOperators.includes(k) || k.startsWith("$"));

      if (isOperatorFilter) {
        filter[key] = transformFieldOperators(val);
      } else {
        for (const [subKey, subVal] of Object.entries(val as any)) {
          if (subVal && typeof subVal === "object" && !(subVal instanceof Date) && !(subVal instanceof ObjectId)) {
            const subFilter = transformWhere({ [subKey]: subVal });
            for (const [fKey, fVal] of Object.entries(subFilter)) {
              filter[`${key}.${fKey}`] = fVal;
            }
          } else {
            filter[`${key}.${subKey}`] = subVal;
          }
        }
      }
    } else {
      filter[key] = val;
    }
  }
  return filter;
}

function transformOrderBy(orderBy: any): any {
  if (!orderBy) return { createdAt: -1 };
  if (Array.isArray(orderBy)) {
    const sort: any = {};
    orderBy.forEach((item) => {
      Object.assign(sort, transformOrderBy(item));
    });
    return sort;
  }
  if (typeof orderBy === "object") {
    const sort: any = {};
    for (const [k, v] of Object.entries(orderBy)) {
      const fieldKey = k === "id" ? "_id" : k;
      sort[fieldKey] = v === "asc" ? 1 : -1;
    }
    return sort;
  }
  return { createdAt: -1 };
}

async function populatePackageRelations(docs: any, include: any) {
  if (!docs) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  if (include?.destination) {
    const destIds = items
      .map((i) => i?.destinationId)
      .filter((id) => Boolean(id) && typeof id === "string" && ObjectId.isValid(id));
    if (destIds.length > 0) {
      const objectIds = destIds.map((id: string) => toObjectId(id));
      const destDocs = await getDb().collection("Destination").find({ _id: { $in: objectIds } }).toArray();
      const destMap = new Map(destDocs.map((d: any) => [d._id.toString(), transformDoc(d)]));
      items.forEach((item: any) => {
        if (item?.destinationId) {
          const matched = destMap.get(item.destinationId.toString());
          if (matched) {
            item.destination = matched;
          }
        }
      });
    }
  }

  if (include?.batches) {
    const pkgIds = items.map((i) => i?.id).filter(Boolean);
    const batchesMap = new Map<string, any[]>();
    if (pkgIds.length > 0) {
      const batchDocs = await getDb().collection("TripBatch").find({ packageId: { $in: pkgIds } }).toArray();
      batchDocs.forEach((b: any) => {
        const transformed = transformDoc(b);
        const pId = b.packageId;
        if (!batchesMap.has(pId)) batchesMap.set(pId, []);
        batchesMap.get(pId)!.push(transformed);
      });
    }
    items.forEach((item: any) => {
      if (item) {
        item.batches = batchesMap.get(item.id) || (Array.isArray(item.batches) ? item.batches : []);
      }
    });
  }

  // Guarantee all array fields on Package objects are arrays
  items.forEach((item: any) => {
    if (!item) return;
    if (!Array.isArray(item.batches)) item.batches = [];
    if (!Array.isArray(item.images)) item.images = Array.isArray(item.gallery) ? item.gallery : [];
    if (!Array.isArray(item.itineraries)) item.itineraries = Array.isArray(item.itinerary) ? item.itinerary : [];
    if (!Array.isArray(item.inclusions)) item.inclusions = [];
    if (!Array.isArray(item.exclusions)) item.exclusions = [];
    if (!Array.isArray(item.faqs)) item.faqs = [];
  });

  return isArray ? items : items[0];
}

async function populateBatchRelations(docs: any, include: any) {
  if (!docs || !include) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  if (include.package) {
    const pkgIds = items
      .map((i) => i.packageId)
      .filter((id) => Boolean(id) && typeof id === "string" && ObjectId.isValid(id));
    if (pkgIds.length > 0) {
      const objectIds = pkgIds.map((id: string) => toObjectId(id));
      const pkgDocs = await getDb().collection("Package").find({ _id: { $in: objectIds } }).toArray();
      const transformedPkgs = transformDoc(pkgDocs);
      const populatedPkgs = await populatePackageRelations(transformedPkgs, { destination: true });
      const pkgMap = new Map(
        (Array.isArray(populatedPkgs) ? populatedPkgs : [populatedPkgs]).map((p: any) => [p.id.toString(), p])
      );
      items.forEach((item: any) => {
        if (item.packageId) {
          const matched = pkgMap.get(item.packageId.toString());
          if (matched) {
            item.package = matched;
          }
        }
      });
    }
  }

  if (include.bookings) {
    const batchIds = items.map((i) => i.id).filter(Boolean);
    if (batchIds.length > 0) {
      const bookingDocs = await getDb().collection("Booking").find({ tripBatchId: { $in: batchIds } }).toArray();
      const bookingsMap = new Map<string, any[]>();
      bookingDocs.forEach((b: any) => {
        const transformed = transformDoc(b);
        const bId = b.tripBatchId;
        if (!bookingsMap.has(bId)) bookingsMap.set(bId, []);
        bookingsMap.get(bId)!.push(transformed);
      });
      items.forEach((item: any) => {
        item.bookings = bookingsMap.get(item.id) || item.bookings || [];
      });
    }
  }

  return isArray ? items : items[0];
}

async function populateDestinationRelations(docs: any) {
  if (!docs) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  const destIds = items.map((i) => i.id).filter(Boolean);
  if (destIds.length > 0) {
    const pkgDocs = await getDb().collection("Package").find({ destinationId: { $in: destIds } }).toArray();
    const countMap = new Map<string, number>();
    pkgDocs.forEach((p: any) => {
      const dId = p.destinationId;
      if (dId) countMap.set(dId, (countMap.get(dId) || 0) + 1);
    });
    items.forEach((item: any) => {
      const pCount = countMap.get(item.id) || 0;
      item.packageCount = pCount;
      item._count = { packages: pCount };
    });
  }

  return isArray ? items : items[0];
}

async function populateHeroSlideRelations(docs: any) {
  if (!docs) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  const eventIds = items.map((i) => i.eventId).filter(Boolean);
  if (eventIds.length > 0) {
    const objectIds = eventIds.map((id: string) => toObjectId(id));
    const batchDocs = await getDb().collection("TripBatch").find({ _id: { $in: objectIds } }).toArray();
    const transformedBatches = transformDoc(batchDocs);
    const populatedBatches = await populateBatchRelations(transformedBatches, { package: true });

    const batchMap = new Map(
      (Array.isArray(populatedBatches) ? populatedBatches : [populatedBatches]).map((b: any) => [b.id, b])
    );

    items.forEach((item: any) => {
      if (item.eventId) {
        const ev = batchMap.get(item.eventId) || null;
        if (ev) {
          const resolvedEvImage =
            ev.coverImage ||
            ev.imageUrl ||
            ev.image ||
            ev.package?.coverImage ||
            ev.package?.imageUrl ||
            ev.package?.image ||
            null;
          item.event = {
            ...ev,
            coverImage: resolvedEvImage,
            image: resolvedEvImage,
          };
        } else {
          item.event = null;
        }
      }
    });
  }

  return isArray ? items : items[0];
}

async function populateGalleryImageRelations(docs: any, include: any) {
  if (!docs) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  if (include?.destination) {
    const destIds = items.map((i) => i.destinationId).filter(Boolean);
    if (destIds.length > 0) {
      const objectIds = destIds.map((id: string) => toObjectId(id));
      const destDocs = await getDb().collection("Destination").find({ _id: { $in: objectIds } }).toArray();
      const destMap = new Map(destDocs.map((d: any) => [d._id.toString(), transformDoc(d)]));
      items.forEach((item: any) => {
        if (item.destinationId) {
          item.destination = destMap.get(item.destinationId.toString()) || item.destination || null;
        }
      });
    }
  }

  if (include?.category) {
    const catIds = items.map((i) => i.categoryId).filter(Boolean);
    if (catIds.length > 0) {
      const objectIds = catIds.map((id: string) => toObjectId(id));
      const catDocs = await getDb().collection("GalleryCategory").find({ _id: { $in: objectIds } }).toArray();
      const catMap = new Map(catDocs.map((c: any) => [c._id.toString(), transformDoc(c)]));
      items.forEach((item: any) => {
        if (item.categoryId) {
          item.categoryObj = catMap.get(item.categoryId.toString()) || null;
        }
      });
    }
  }

  return isArray ? items : items[0];
}

export function isDbAvailable(): boolean {
  const rawUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const uri = rawUri?.trim();
  return Boolean(uri && (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://")));
}

function createCollectionWrapper(collectionName: string) {
  const getCol = () => getDb().collection(collectionName);

  return {
    async findMany(args: any = {}) {
      if (!isDbAvailable()) return [];
      const filter = transformWhere(args.where);
      const sort = transformOrderBy(args.orderBy);
      const skip = args.skip || 0;
      const limit = args.take || args.limit || 0;

      let cursor = getCol().find(filter).sort(sort);
      if (skip > 0) cursor = cursor.skip(skip);
      if (limit > 0) cursor = cursor.limit(limit);

      const docs = await cursor.toArray();
      const transformed = transformDoc(docs);
      if (collectionName === "Package" && args.include) {
        return await populatePackageRelations(transformed, args.include);
      }
      if (collectionName === "TripBatch" && args.include) {
        return await populateBatchRelations(transformed, args.include);
      }
      if (collectionName === "Destination") {
        return await populateDestinationRelations(transformed);
      }
      if (collectionName === "HeroSlide") {
        return await populateHeroSlideRelations(transformed);
      }
      if (collectionName === "GalleryImage" && args.include) {
        return await populateGalleryImageRelations(transformed, args.include);
      }
      return transformed;
    },

    async findFirst(args: any = {}) {
      if (!isDbAvailable()) return null;
      const filter = transformWhere(args.where);
      const sort = transformOrderBy(args.orderBy);
      const docs = await getCol().find(filter).sort(sort).limit(1).toArray();
      if (docs.length === 0) return null;
      const transformed = transformDoc(docs[0]);
      if (collectionName === "Package" && args.include) {
        return await populatePackageRelations(transformed, args.include);
      }
      if (collectionName === "TripBatch" && args.include) {
        return await populateBatchRelations(transformed, args.include);
      }
      if (collectionName === "Destination") {
        return await populateDestinationRelations(transformed);
      }
      if (collectionName === "HeroSlide") {
        return await populateHeroSlideRelations(transformed);
      }
      if (collectionName === "GalleryImage" && args.include) {
        return await populateGalleryImageRelations(transformed, args.include);
      }
      return transformed;
    },

    async findUnique(args: any = {}) {
      if (!isDbAvailable()) return null;
      const filter = transformWhere(args.where);
      const doc = await getCol().findOne(filter);
      if (!doc) return null;
      const transformed = transformDoc(doc);
      if (collectionName === "Package" && args.include) {
        return await populatePackageRelations(transformed, args.include);
      }
      if (collectionName === "TripBatch" && args.include) {
        return await populateBatchRelations(transformed, args.include);
      }
      if (collectionName === "Destination") {
        return await populateDestinationRelations(transformed);
      }
      if (collectionName === "HeroSlide") {
        return await populateHeroSlideRelations(transformed);
      }
      if (collectionName === "GalleryImage" && args.include) {
        return await populateGalleryImageRelations(transformed, args.include);
      }
      return transformed;
    },

    async create(args: any = {}) {
      const data = { ...args.data };
      if (!data.createdAt) data.createdAt = new Date();
      if (!data.updatedAt) data.updatedAt = new Date();

      if (data.id && typeof data.id === "string") {
        data._id = toObjectId(data.id);
        delete data.id;
      }

      const res = await getCol().insertOne(data);
      const inserted = await getCol().findOne({ _id: res.insertedId });
      return transformDoc(inserted);
    },

    async createMany(args: any = {}) {
      const list = Array.isArray(args.data) ? args.data : [args.data];
      const now = new Date();
      const docs = list.map((item: any) => {
        const doc = { ...item };
        if (!doc.createdAt) doc.createdAt = now;
        if (!doc.updatedAt) doc.updatedAt = now;
        if (doc.id && typeof doc.id === "string") {
          doc._id = toObjectId(doc.id);
          delete doc.id;
        }
        return doc;
      });

      const res = await getCol().insertMany(docs);
      return { count: res.insertedCount };
    },

    async update(args: any = {}) {
      const filter = transformWhere(args.where);
      const updateData = { ...args.data };
      delete updateData.id;
      delete updateData._id;
      updateData.updatedAt = new Date();

      const res = await getCol().findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: "after" }
      );
      return transformDoc(res);
    },

    async updateMany(args: any = {}) {
      const filter = transformWhere(args.where);
      const updateData = { ...args.data };
      delete updateData.id;
      delete updateData._id;
      updateData.updatedAt = new Date();

      const res = await getCol().updateMany(filter, { $set: updateData });
      return { count: res.modifiedCount };
    },

    async delete(args: any = {}) {
      const filter = transformWhere(args.where);
      const existing = await getCol().findOne(filter);
      await getCol().deleteOne(filter);
      return transformDoc(existing);
    },

    async deleteMany(args: any = {}) {
      const filter = transformWhere(args.where || {});
      const res = await getCol().deleteMany(filter);
      return { count: res.deletedCount };
    },

    async count(args: any = {}) {
      if (!isDbAvailable()) return 0;
      const filter = transformWhere(args.where);
      return await getCol().countDocuments(filter);
    },

    async upsert(args: any = {}) {
      const filter = transformWhere(args.where);
      const existing = await getCol().findOne(filter);
      if (existing) {
        return this.update({ where: args.where, data: args.update });
      } else {
        return this.create({ data: { ...args.where, ...args.create } });
      }
    },
  };
}

export const db: Record<string, any> = {
  user: createCollectionWrapper("User"),
  heroSlide: createCollectionWrapper("HeroSlide"),
  package: createCollectionWrapper("Package"),
  packageItinerary: createCollectionWrapper("PackageItinerary"),
  packageInclusion: createCollectionWrapper("PackageInclusion"),
  packageExclusion: createCollectionWrapper("PackageExclusion"),
  packageFAQ: createCollectionWrapper("PackageFAQ"),
  packageImage: createCollectionWrapper("PackageImage"),
  destination: createCollectionWrapper("Destination"),
  tripBatch: createCollectionWrapper("TripBatch"),
  galleryAlbum: createCollectionWrapper("GalleryAlbum"),
  galleryCategory: createCollectionWrapper("GalleryCategory"),
  galleryImage: createCollectionWrapper("GalleryImage"),
  testimonial: createCollectionWrapper("Testimonial"),
  customEvent: createCollectionWrapper("CustomEvent"),
  booking: createCollectionWrapper("Booking"),
  bookingEnquiry: createCollectionWrapper("BookingEnquiry"),
  enquiry: createCollectionWrapper("Enquiry"),
  contactEnquiry: createCollectionWrapper("ContactEnquiry"),
  review: createCollectionWrapper("Review"),
  contactMessage: createCollectionWrapper("ContactMessage"),
  calendarEvent: createCollectionWrapper("CalendarEvent"),
  siteSetting: createCollectionWrapper("SiteSetting"),
  aboutContent: createCollectionWrapper("AboutContent"),
  instagramPost: createCollectionWrapper("InstagramPost"),
  archiveAuditLog: createCollectionWrapper("ArchiveAuditLog"),
  expense: createCollectionWrapper("Expense"),
};

export default db;
