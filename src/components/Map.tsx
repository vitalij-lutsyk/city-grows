import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";

import "../styles/legend.css";
import { defaultStartPoint } from "../constants/default-start-point";
import { urls } from "../constants/base-urls";
import { debounce } from "../utils/debounce";
import { Location, MapProps } from "../interfaces/map.interface";
import { useLegend, useBuildings } from "./hooks";

function MapComponent(props: MapProps) {
  const { filter = [0, 0], setYears } = props;

  const map = useRef<Map | null>(null);

  const { filterBuildings, getBuildings, getYears } = useBuildings();
  const { toggleLegendVisibility, createLegend } = useLegend();
  const [, setSearchParams] = useSearchParams();
  let debounceFn: Function | null = null;

  useEffect(() => {
    handleFilterChange();
  }, [props.filter]);

  useEffect(() => {
    const _map = createMap();
    createLegend(_map);
    fetchBuildings(_map);
  }, []);

  const startLocation = (): Location => {
    const params = new URL(document.location.href).searchParams;
    const lat = params.get("lat");
    const lng = params.get("lng");
    const zoom = params.get("zoom");

    return {
      lat: lat ? parseFloat(lat.toString()) : defaultStartPoint.lat,
      lng: lng ? parseFloat(lng.toString()) : defaultStartPoint.lng,
      zoom: zoom ? parseInt(zoom.toString()) : defaultStartPoint.zoom,
    };
  };

  const updateUrlCoordinates = (_map: Map): void => {
    if (!_map) return;
    const { lat, lng } = _map.getCenter();
    setSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      zoom: _map.getZoom().toString(),
    });
  };

  const createMap = (): Map => {
    if (map.current) {
      return map.current;
    }
    const { lat, lng, zoom } = startLocation();
    const _map = new Map("map", { renderer: L.canvas() }).setView(
      [lat, lng],
      zoom
    );

    const tileLayer = L.tileLayer(urls.baseMap, {
      attribution: `&copy; <a href="${urls.osmCopyright}">OpenStreetMap</a> contributors`,
    });
    tileLayer.addTo(_map);
    _map.on("dragend", () => handleMapMove(_map));
    _map.on("zoom", () => updateUrlCoordinates(_map));

    updateUrlCoordinates(_map);
    map.current = _map;
    return _map;
  };

  const handleMapMove = async (_map: Map) => {
    updateUrlCoordinates(_map);
    toggleLegendVisibility(_map);
    if (_map.getZoom() <= 13) return;
    await fetchBuildings(_map);
  };

  const getMapBoundaries = (map: L.Map): string => {
    return Object.values(map?.getBounds() || [])
      .map((arr) => Object.values(arr).map((val) => val))
      .flat()
      .join(",");
  };

  const fetchBuildings = async (_map: L.Map): Promise<void> => {
    const mapBoundaries = getMapBoundaries(_map);
    const buildings = await getBuildings(_map, mapBoundaries);
    const _years = getYears(buildings);
    setYears(_years);
  };

  const handleFilterChange = () => {
    if (!debounceFn) {
      debounceFn = debounce(() => {
        if (map.current) {
          filterBuildings(map.current, filter);
        }
      }, 60);
    }
    debounceFn && debounceFn();
  };

  return <div id="map"></div>;
}

export default MapComponent;
