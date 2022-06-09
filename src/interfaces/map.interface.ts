import { Feature, Polygon } from "geojson";
import { LayerGroup } from "leaflet";

export type Buildings = Array<Feature<Polygon>>;

export interface MapLayerGroups {
  [key: number]: LayerGroup;
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}