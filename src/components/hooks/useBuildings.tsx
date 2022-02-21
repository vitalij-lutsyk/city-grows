import { useRef } from "react";
import {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  Geometry,
  Polygon,
} from "geojson";
import { Layer, LayerGroup, Map, GeoJSON } from "leaflet";
import axios from "axios";

import { urls } from "../../constants/base-urls";
import { getPeriodsWithStylesByYear } from "../../data/periods";
import { Buildings, MapLayerGroups } from "../../interfaces/map.interface";
import { useSpinner } from "./useSpinner";
import { OverpassApiRes } from "../../interfaces/api-response";

export const useBuildings = () => {
  const Spinner = useSpinner();
  const buildings = useRef<Buildings>({});
  const mapLayerGroups = useRef<MapLayerGroups>({});
  const layer = useRef<GeoJSON | null>(null);

  const createLayer = (_map: Map, _buildings: Buildings): GeoJSON => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [...Object.values(_buildings)],
    };
    const geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature: (feature: Feature, featureLayer: Layer) =>
        onEachFeature(feature, featureLayer, _map),
    });
    return geojsonLayer;
  };

  const onEachFeature = (
    feature: Feature,
    featureLayer: Layer,
    _map: Map
  ): void => {
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups.current[feature.properties?.id];
    if (lg === undefined) {
      lg = new LayerGroup();
      // add the layer to the map
      if (_map) {
        lg.addTo(_map);
      }
      // store layer
      mapLayerGroups.current[feature.properties?.id] = lg;
    }

    // add the feature to the layer
    featureLayer
      .bindPopup((layer: any) => {
        // TODO: any
        const {
          ["addr:housenumber"]: housenumber,
          ["addr:street"]: street,
          name,
          wikipedia: wikiArticleUrl,
        } = layer.feature.properties;
        return `<div>
            ${name ? `<p>${name}</p>` : ""}
            <p>${street}, ${housenumber}</p>
            ${
              wikiArticleUrl
                ? `<p><a href="${urls.wiki(
                    wikiArticleUrl
                  )}" target="_blank">Wiki</a></p>`
                : ""
            }
          </div>`;
      })
      .bindTooltip((layer: any) => layer.feature.properties.start_date); // TODO: any
    lg.addLayer(featureLayer);
  };

  const addBuildingsToLayer = (_buildings: Buildings): void => {
    const buildingsToAdd: Array<GeoJsonObject> = Object.values(
      _buildings
    ).filter((build) => !mapLayerGroups.current[build.properties?.id]);
    layer?.current?.addData(buildingsToAdd as any); // TODO: any
  };

  const filterBuildings = (_map: Map, filter: [number, number]): void => {
    const [min, max] = filter;
    Object.values(buildings.current).forEach(({ properties }) => {
      const lg = mapLayerGroups.current[properties?.id];
      if (max >= +properties?.start_date && min <= +properties?.start_date) {
        _map.addLayer(lg);
      } else {
        _map.removeLayer(lg);
      }
    });
  };

  const getBuildings = async (_map: Map, mapBoundaries: string) => {
    Spinner.show();
    const res = await axios.get(urls.overpassApi(mapBoundaries));
    const _buildings = prepareBuildings(res.data);
    if (!layer?.current) {
      const _geojsonLayer = createLayer(_map, _buildings);
      layer.current = _geojsonLayer;
    } else {
      addBuildingsToLayer(Object.values(_buildings));
    }
    buildings.current = Object.assign({}, buildings.current, _buildings);
    Spinner.hide();
    return buildings.current;
  };

  const prepareBuildings = (data: OverpassApiRes): Buildings => {
    const { elements: _buildings } = data;
    const preparedBuildings = _buildings
      .map((build) => {
        const geometry: Polygon = {
          type: "Polygon",
          coordinates: [],
        };
        const preparedBuild: Feature<Geometry> = {
          type: "Feature",
          properties: { id: build.id, ...build.tags },
          geometry,
        };
        if (build.type === "way") {
          geometry.coordinates = [
            build.geometry.map((node) => Object.values(node).reverse()),
          ];
        }
        if (build.type === "relation" && build.members?.length) {
          const outerLine = build.members.find((member) =>
            ["outer", "outline"].includes(member.role)
          );
          const mappedCoords =
            outerLine?.geometry.map((node) => Object.values(node).reverse()) ||
            [];
          geometry.coordinates = [mappedCoords];
        }
        return preparedBuild;
      })
      .filter((build) => {
        const startDate = build?.properties?.start_date + "";
        if (!startDate) {
          return false;
        }
        if (startDate.length !== 4 || isNaN(parseInt(startDate))) {
          return false;
        }
        return true;
      });
    const buildingsToAdd: Buildings = {};
    preparedBuildings.forEach((build) => {
      buildingsToAdd[build.properties?.id] = build;
    });
    return buildingsToAdd;
  };

  const getYears = (_buildings: Buildings): Array<number> => {
    const result: { [key: string]: any } = {};
    Object.values(_buildings)
      .map((build) => build.properties.start_date)
      .forEach((curr) => {
        if (isNaN(curr) || result.hasOwnProperty(curr)) {
          return;
        }
        result[curr] = curr;
      });
    return Object.values(result).filter(
      (year) => year <= new Date().getFullYear()
    );
  };

  return {
    filterBuildings,
    getBuildings,
    getYears,
  };
};
