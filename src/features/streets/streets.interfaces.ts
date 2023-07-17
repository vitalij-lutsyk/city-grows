import { Feature, FeatureCollection, LineString, MultiLineString } from "geojson";

export interface StreetProperties {
  st_streetid: number;
  name: string; //  "43-07-54--s-Videnska",
  title: string; // "Віденська",
  date_from_text: number | string | null; // 2018,
  date_to_text: number | string | null; // 2018,
  translit: string; // "Videnska",
  currentstate: string; // "modern",
  haschains: number; // 1
}

export type StreetFeature = Feature<MultiLineString | LineString, StreetProperties>;
export type Streets = Array<StreetFeature>;
export type StreetsCollection = FeatureCollection<MultiLineString | LineString, StreetProperties>;
