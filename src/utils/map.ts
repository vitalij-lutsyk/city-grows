import { Map } from "leaflet";

export const getMapBoundaries = (map: Map): string => {
  return Object.values(map?.getBounds() || [])
    .map((arr) => Object.values(arr).map((val) => val))
    .flat()
    .join(",");
};