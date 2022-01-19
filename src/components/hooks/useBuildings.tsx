import { useRef } from "react";
import { Feature, FeatureCollection, GeoJsonObject } from "geojson";
import { Layer, LayerGroup, Map, GeoJSON } from "leaflet";

import { urls } from "../../constants/base-urls";
import { getPeriodsWithStylesByYear } from "../../data/periods";
import { Buildings, MapLayerGroups } from "../../interfaces/map.interface";

export const useBuildings = (
  map?: Map | null,
  mapLayerGroups?: MapLayerGroups | null
) => {
  const layer = useRef<GeoJSON | null>(null);

  const createLayer = (buildings: Buildings): GeoJSON => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [...Object.values(buildings)],
    };
    const geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature,
    });
    return geojsonLayer;
  };

  const onEachFeature = (feature: Feature, featureLayer: Layer): void => {
    if (!mapLayerGroups) {
      return;
    }
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups[feature.properties?.id];
    if (lg === undefined) {
      lg = new LayerGroup();
      // add the layer to the map
      if (map) {
        lg.addTo(map);
      }
      // store layer
      mapLayerGroups[feature.properties?.id] = lg;
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
    if (!mapLayerGroups) {
      return;
    }
    const buildingsToAdd: Array<GeoJsonObject> = Object.values(
      _buildings
    ).filter((build) => !mapLayerGroups[build.properties?.id]);
    layer?.current?.addData(buildingsToAdd as any); // TODO: any
  };

  const filter = (buildings: Buildings, filter: [number, number]): void => {
    const [min, max] = filter;
    Object.values(buildings).forEach(({ properties }) => {
      if (max >= +properties?.start_date && min <= +properties?.start_date) {
        showLayer(properties?.id);
      } else {
        hideLayer(properties?.id);
      }
    });
  };

  const showLayer = (id: number): void => {
    if (mapLayerGroups) {
      const lg = mapLayerGroups[id];
      map?.addLayer(lg);
    }
  };

  const hideLayer = (id: number): void => {
    if (mapLayerGroups) {
      const lg = mapLayerGroups[id];
      map?.removeLayer(lg);
    }
  };

  return {
    buildingsLayer: layer,
    createBuildingsLayer: createLayer,
    addBuildingsToLayer,
    filterBuildings: filter,
  };
};
