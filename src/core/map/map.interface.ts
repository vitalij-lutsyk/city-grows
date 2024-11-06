import { LayerGroup } from "leaflet";

export interface Geometry {
  lat: number;
  lon: number;
}

export interface Bounds {
  maxlat: number;
  maxlon: number;
  minlat: number;
  minlon: number;
}

export interface MapLayerGroups {
  [key: string]: LayerGroup;
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}
