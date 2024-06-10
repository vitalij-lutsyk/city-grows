import React, { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "../../styles/legend.css";
import { urls } from "../api/api.constants";
import BuildingsComponent from "../../features/buildings/Buildings.component";
// import StreetsComponent from "../../features/streets/Streets.component";

import MapEventHandler from "./MapEventHandler";
import { defaultStartPoint } from "./map.constants";
import { Location } from "./map.interface";

const MapWrapper: React.FC = () => {
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
      {/* <StreetsComponent /> */}
    </MapContainer>
  );
}

export default MapWrapper;
