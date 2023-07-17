interface Geometry {
  lat: number;
  lon: number;
}

interface Bounds {
  maxlat: number;
  maxlon: number;
  minlat: number;
  minlon: number;
}

export interface OverpassApiRes<T> {
  elements: Array<OverpassApiResItem<T>>;
  generator: string; // Overpass API {version} {id}
  osm3s: Osm3s;
  version: number;
}

interface Osm3s {
  copyright: string;
  timestamp_osm_base: string;
}

export interface OverpassApiResItem<T> {
  bounds: Bounds;
  geometry: Array<Geometry>;
  id: number;
  nodes?: Array<number>;
  members?: Array<RelationMember>
  tags: T;
  type: 'way' | 'relation'; // TODO: enum
}

interface RelationMember {
  geometry: Array<Geometry>;
  ref: number;
  role: 'outer' | 'inner' | 'outline'; // TODO: enum
  type: 'way';
}