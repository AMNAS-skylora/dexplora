import { Bike, BusFront, CarFront, Footprints, Plane, Route, Ship, TrainFront, Van } from "lucide-react";
import type { ItineraryTransportMode } from "@/lib/itinerary-transport";

export const itineraryTransportIcons = {
  none: Route,
  car: CarFront,
  van: Van,
  bus: BusFront,
  train: TrainFront,
  plane: Plane,
  ship: Ship,
  bike: Bike,
  walk: Footprints,
} satisfies Record<ItineraryTransportMode, typeof Route>;
