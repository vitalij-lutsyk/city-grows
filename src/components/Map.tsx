import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { Map } from 'leaflet';
import "leaflet/dist/leaflet.css";

import "../styles/legend.css";
import { defaultStartPoint } from "../constants/default-start-point";
import { urls } from "../constants/base-urls";
import { Location } from "../interfaces/map.interface";
import BuildingsComponent from "./Buildings";

const MapEventHandler = () => {
  const [, setSearchParams] = useSearchParams();

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

  return null;
};

const MapWrapper = () => {
  const startLocation = useMemo((): Location => {
    const params = new URL(document.location.href).searchParams;
    const lat = params.get("lat");
    const lng = params.get("lng");
    const zoom = params.get("zoom");

    return {
      lat: lat ? parseFloat(lat.toString()) : defaultStartPoint.lat,
      lng: lng ? parseFloat(lng.toString()) : defaultStartPoint.lng,
      zoom: zoom ? parseInt(zoom.toString()) : defaultStartPoint.zoom,
    };
  }, []);

  return (
    <MapContainer
      center={[startLocation.lat, startLocation.lng]}
      zoom={startLocation.zoom}
      className="map"
      preferCanvas
    >
      <TileLayer attribution={`&copy; <a href="${urls.osmCopyright}">OpenStreetMap</a> contributors`} url={urls.baseMap} />
      <MapEventHandler />
      <BuildingsComponent />
    </MapContainer>
  );
}

export default MapWrapper;
