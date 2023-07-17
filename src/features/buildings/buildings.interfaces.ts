import { Feature, FeatureCollection, Polygon } from "geojson";

export interface BuildingTags {
  id: string;
  ["addr:housenumber"]: string,
  ["addr:street"]: string,
  name: string,
  start_date: string,
  wikipedia: string,
}

export type Building = Feature<Polygon, BuildingTags>;
export type Buildings = Array<Building>;
export type BuildingsCollection = FeatureCollection<Polygon, BuildingTags>;
