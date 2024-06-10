import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Map } from 'leaflet';
import { useMapEvents } from "react-leaflet";

import { useLegend } from "./useLegend";

const MapEventHandler: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const { createLegend } = useLegend();

  const updateUrlCoordinates = (_map: Map): void => {
    const { lat, lng } = _map.getCenter();
    setSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      zoom: _map.getZoom().toString(),
    });
  };

  const map = useMapEvents({
    dragend() {
      updateUrlCoordinates(map);
    },
    zoom() {
      updateUrlCoordinates(map);
    },
  });

  useEffect(() => {
    createLegend(map);
  }, []);

  return null;
};

export default MapEventHandler;
