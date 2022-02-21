import { Feature, Geometry } from "geojson";
import { LayerGroup } from "leaflet";

export interface Buildings {
  [key: number]: Feature<Geometry>;
}

export interface MapLayerGroups {
  [key: number]: LayerGroup;
}

export interface MapProps {
  setYears: Function;
  filter: [number, number];
}

export interface Location {
  lat: number;
  lng: number;
  zoom: number;
}