import { LayerGroup } from "leaflet";

export interface MapLayerGroups {
  [key: string]: LayerGroup;
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}
