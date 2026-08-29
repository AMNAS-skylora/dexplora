import { MongoClient, ObjectId } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getDb() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || "";
  if (!uri) {
    throw new Error("MongoDB connection URI is missing from environment variables (MONGODB_URI or DATABASE_URL).");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
      global._mongoClientPromise = global._mongoClient.connect();
    }
    return global._mongoClient.db();
  }

  if (!client) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return client.db();
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

function transformWhere(where: any): any {
  if (!where) return {};
  const filter: any = {};

  const knownOperators = ["gte", "lte", "gt", "lt", "in", "equals", "not", "ne"];

  for (const [key, val] of Object.entries(where)) {
    if (key === "id" && typeof val === "string") {
      filter._id = toObjectId(val);
    } else if (key === "id" && typeof val === "object" && val !== null) {
      const cond: any = {};
      for (const [op, opVal] of Object.entries(val as any)) {
        if (op === "in" && Array.isArray(opVal)) {
          cond["$in"] = opVal.map(toObjectId);
        } else {
          cond[`$${op}`] = opVal;
        }
      }
      filter._id = cond;
    } else if (key === "OR" && Array.isArray(val)) {
      filter["$or"] = val.map(transformWhere);
    } else if (key === "AND" && Array.isArray(val)) {
      filter["$and"] = val.map(transformWhere);
    } else if (typeof val === "object" && val !== null && !(val instanceof Date) && !(val instanceof ObjectId)) {
      const keys = Object.keys(val as any);
      const isOperatorFilter = keys.length > 0 && keys.every((k) => knownOperators.includes(k));

      if (isOperatorFilter) {
        const cond: any = {};
        for (const [op, opVal] of Object.entries(val as any)) {
          if (op === "gte") cond["$gte"] = opVal;
          else if (op === "lte") cond["$lte"] = opVal;
          else if (op === "gt") cond["$gt"] = opVal;
          else if (op === "lt") cond["$lt"] = opVal;
          else if (op === "in" && Array.isArray(opVal)) cond["$in"] = opVal;
          else if (op === "ne" || op === "not") cond["$ne"] = opVal;
          else cond[`$${op}`] = opVal;
        }
        filter[key] = cond;
      } else {
        for (const [subKey, subVal] of Object.entries(val as any)) {
          if (subVal && typeof subVal === "object" && !(subVal instanceof Date)) {
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
  if (!docs || !include) return docs;
  const isArray = Array.isArray(docs);
  const items = isArray ? docs : [docs];

  if (include.destination) {
    const destIds = items
      .map((i) => i.destinationId)
      .filter((id) => Boolean(id) && typeof id === "string" && ObjectId.isValid(id));
    if (destIds.length > 0) {
      const objectIds = destIds.map((id: string) => toObjectId(id));
      const destDocs = await getDb().collection("Destination").find({ _id: { $in: objectIds } }).toArray();
      const destMap = new Map(destDocs.map((d: any) => [d._id.toString(), transformDoc(d)]));
      items.forEach((item: any) => {
        if (item.destinationId) {
          const matched = destMap.get(item.destinationId.toString());
          if (matched) {
            item.destination = matched;
          }
        }
      });
    }
  }

  if (include.batches) {
    const pkgIds = items.map((i) => i.id).filter(Boolean);
    if (pkgIds.length > 0) {
      const batchDocs = await getDb().collection("TripBatch").find({ packageId: { $in: pkgIds } }).toArray();
      const batchesMap = new Map<string, any[]>();
      batchDocs.forEach((b: any) => {
        const transformed = transformDoc(b);
        const pId = b.packageId;
        if (!batchesMap.has(pId)) batchesMap.set(pId, []);
        batchesMap.get(pId)!.push(transformed);
      });
      items.forEach((item: any) => {
        if (batchesMap.has(item.id)) {
          item.batches = batchesMap.get(item.id);
        }
      });
    }
  }

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
      const pkgMap = new Map(pkgDocs.map((p: any) => [p._id.toString(), transformDoc(p)]));
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
        item.event = batchMap.get(item.eventId) || null;
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

function createCollectionWrapper(collectionName: string) {
  const getCol = () => getDb().collection(collectionName);

  return {
    async findMany(args: any = {}) {
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
};

export default db;
