import React, { useContext, useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";
import { Map, GeoJSON, Layer, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import {streetsGeojson} from './streets.data.js';

import { MapLayerGroups } from "../../core/map/map.interface";
import { FilterContext } from "../filter/filter";
import { getYears, getPeriodsWithStylesByYear } from "../../core/utils";

import { StreetFeature, Streets, StreetsCollection } from "./streets.interfaces";
import { checkIsStreetInRange, buildPopup } from "./streets.utils";

const StreetsComponent = () => {
  const map: Map = useMapEvents({});

  const { filter = [0, 0], setYears } = useContext(FilterContext);

  const streets = useRef<StreetFeature[]>([]);
  const mapLayerGroups = useRef<MapLayerGroups>({});
  const layer = useRef<GeoJSON | null>(null);

  useEffect(() => {
    setTimeout(() => {
      mountStreets();
    }, 200);
  }, []);

  // watcher
  useEffect(() => {
    if (map) {
      filterStreets();
    }
  }, [filter]);

  const createLayer = (_buildings: Streets): GeoJSON => {
    const geojson: StreetsCollection = {
      type: "FeatureCollection",
      features: _buildings,
    };
    const geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature: (feature, featureLayer) => onEachFeature(feature as StreetFeature, featureLayer),
    });

    return geojsonLayer;
  };

  const onEachFeature = (
    feature: StreetFeature,
    featureLayer: Layer,
  ): void => {
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups.current[feature.properties?.st_streetid];
    if (lg === undefined) {
      lg = new LayerGroup();
      // add the layer to the map
      lg.addTo(map);
      // store layer
      mapLayerGroups.current[feature.properties?.st_streetid] = lg;
    }

    // add the feature to the layer
    featureLayer
      .bindPopup(buildPopup)
      .bindTooltip((layer: any) => layer.feature.properties.date_from_text || '');
    lg.addLayer(featureLayer);
  };

  const filterStreets = (): void => {
    streets.current.forEach((feature) => {
      const lg = mapLayerGroups.current[feature.properties?.st_streetid];
      if (checkIsStreetInRange(feature, filter)) {
        map.addLayer(lg);
      } else {
        map.removeLayer(lg);
      }
    });
  };

  const mountStreets = async (): Promise<void> => {
    try {
      streets.current = (streetsGeojson as StreetsCollection).features;
      const _geojsonLayer = createLayer(streetsGeojson.features);
      layer.current = _geojsonLayer;
      map.addLayer(layer.current);

      const _years = getYears(streetsGeojson.features, ['date_from_text', 'date_to_text']);
      setYears(_years);
    } catch (e) {
      console.error("e", e);
    }
  };

  return <></>;
};

export default React.memo(StreetsComponent);
