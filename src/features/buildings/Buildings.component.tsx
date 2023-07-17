import React, { useContext, useEffect, useRef } from "react";
import axios from "axios";
import { useMapEvents } from "react-leaflet";
import { Map, GeoJSON, Layer, LayerGroup, LeafletEvent } from "leaflet";
import { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

import { urls } from "../../core/api/api.constants";
import { Building, Buildings } from "./buildings.interfaces";
import { SpinnerContext } from "../spinner/spinner.context";
import {
  buildPopup,
  checkIsBuildingInRange,
  prepareBuildings,
} from "./buildings.utils";
import { getMapBoundaries } from "../../utils/map";
import { FilterContext } from "../filter/filter";
import { MapLayerGroups } from "../../core/map/map.interface";
import { getYears, getPeriodsWithStylesByYear } from "../../core/utils";

const BuildingsComponent = () => {
  const map: Map = useMapEvents({
    dragend() {
      fetchBuildings();
    },
    zoomend(e: LeafletEvent) {
      if (e.target.getZoom() < prevZoom.current) {
        fetchBuildings();
      }
      prevZoom.current = e.target.getZoom();
    }
  });

  const prevZoom = useRef(map.getZoom());
  const { filter = [0, 0], years, setYears } = useContext(FilterContext);
  const spinner = useContext(SpinnerContext);

  const buildings = useRef<Buildings>([]);
  const mapLayerGroups = useRef<MapLayerGroups>({});
  const layer = useRef<GeoJSON | null>(null);

  // on mount
  useEffect(() => {
    if (map) {
      fetchBuildings();
    }
  }, [map]);

  // watcher
  useEffect(() => {
    if (map) {
      filterBuildings();
    }
  }, [filter]);

  const createLayer = (_buildings: Buildings): GeoJSON => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: _buildings,
    };
    const geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature,
    });
    return geojsonLayer;
  };

  const onEachFeature = (
    feature: Building,
    featureLayer: Layer,
  ): void => {
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups.current[feature.properties?.id];
    if (lg === undefined) {
      lg = new LayerGroup();
      // add the layer to the map
      lg.addTo(map);
      // store layer
      mapLayerGroups.current[feature.properties?.id] = lg;
    }

    // add the feature to the layer
    featureLayer
      .bindPopup(buildPopup)
      .bindTooltip((layer: any) => layer.feature.properties.start_date);

    lg.addLayer(featureLayer);
  };

  const filterBuildings = (): void => {
    buildings.current.forEach((feature) => {
      const lg = mapLayerGroups.current[feature.properties?.id];
      if (checkIsBuildingInRange(feature, filter)) {
        map.addLayer(lg);
      } else {
        map.removeLayer(lg);
      }
    });
  };

  const fetchBuildings = async (): Promise<void> => {
    const mapBoundaries = getMapBoundaries(map);
    spinner.show();
    try {
      const res = await axios.get(urls.overpassApi(mapBoundaries));
      const _buildings = prepareBuildings(res.data);
      const buildingsToAdd = _buildings.filter(
        (b) => !mapLayerGroups.current[b.properties?.id]
      );
      buildings.current = [...buildings.current, ...buildingsToAdd];
      if (!layer?.current) {
        const _geojsonLayer = createLayer(_buildings);
        layer.current = _geojsonLayer;
        map.addLayer(layer.current);
      } else {
        layer?.current?.addData(buildingsToAdd as any);
      }

      spinner.hide();
      const _years = getYears(_buildings, ['start_date']);
      setYears(years.length < 3 ? _years : [...years, ..._years]);
    } catch (e) {
      console.error("e", e);
    } finally {
      spinner.hide();
    }
  };

  return <></>;
};

export default React.memo(BuildingsComponent);
