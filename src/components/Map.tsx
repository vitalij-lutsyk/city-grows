import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Feature, FeatureCollection, GeoJsonObject } from "geojson";
import L, {
  LatLngBoundsLiteral,
  Layer,
  LayerGroup,
  Map,
  GeoJSON,
  Control,
} from "leaflet";
import "leaflet/dist/leaflet.css";

import "../styles/legend.css";
import { defaultStartPoint } from "../constants/default-start-point";
import { urls } from "../constants/base-urls";
import {
  getPeriodsWithStylesByYear,
  periodsByFirstYear,
} from "../data/periods";
import { debounce } from "../utils/debounce";
import { Buildings, Location, MapLayerGroups, MapProps } from "../interfaces/map.interface";

function MapComponent(props: MapProps) {
  const { buildings, filter = [0, 0], getBuildings } = props;

  const map = useRef<Map | null>(null);
  const geojsonLayer = useRef<GeoJSON | null>(null);
  const legend = useRef<Control | null>(null);
  const mapLayerGroups = useRef<MapLayerGroups>({});
  let debounceFn: Function | null = null;
  let [, setSearchParams] = useSearchParams();

  useEffect(() => {
    handleFilterChange();
  }, [props.filter]);

  useEffect(() => {
    if (!map.current) {
      return;
    }
    if (!geojsonLayer?.current) {
      const _geojsonLayer = createPolygonsLayer(buildings);
      geojsonLayer.current = _geojsonLayer;
    } else {
      addDataToGeojson(Object.values(buildings));
    }
  }, [buildings, map.current]);

  useEffect(() => {
    const _map = createMap();
    map.current = _map;
    const _legend = createLegend();
    legend.current = _legend;
    _legend.addTo(_map);
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
    fetchBuildings(_map);
    return _map;
  };

  const createLegend = (): Control => {
    if (legend.current) {
      return legend.current;
    }
    const _legend = L.control.attribution({ position: "bottomright" });
    _legend.onAdd = function (map: Map) {
      let div = L.DomUtil.create("div", "info legend");
      const content = Object.values(periodsByFirstYear)
        .map(
          (item) =>
            `<div class="legend-item">` +
            `<div class="item-value" style="background-color:${item.color}">${item.from}-${item.to}</div>` +
            `<div class="item-name">${item.name}</div>` +
            `</div>`
        )
        .join("");
      const contentWrapper = `<div class="legend-content">${content}</div>`;
      div.innerHTML = contentWrapper;
      return div;
    };
    return _legend;
  };

  const handleMapMove = async (_map: Map) => {
    updateUrlCoordinates(_map);
    toggleLegendVisibility(_map);
    if (_map.getZoom() <= 13) return;
    await fetchBuildings(_map);
  };

  const toggleLegendVisibility = (_map: Map) => {
    const lvivBoundaries: LatLngBoundsLiteral = [
      [49.777384397005484, 23.9088249206543],
      [49.894413228336724, 24.12769317626953],
    ];
    const lviv = L.rectangle(lvivBoundaries);
    const mapIntersectsLviv = _map.getBounds().intersects(lviv.getBounds());
    if (mapIntersectsLviv) {
      legend?.current?.addTo(_map);
    } else {
      legend?.current?.remove();
    }
  };

  const getMapBoundaries = (map: L.Map): string => {
    return Object.values(map?.getBounds() || [])
      .map((arr) => Object.values(arr).map((val) => val))
      .flat()
      .join(",");
  };

  const createPolygonsLayer = (_buildings: Buildings): GeoJSON => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [...Object.values(_buildings)],
    };
    const _geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature,
    });
    return _geojsonLayer;
  };

  const onEachFeature = (feature: Feature, featureLayer: Layer): void => {
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups.current[feature.properties?.id];
    if (lg === undefined) {
      lg = new LayerGroup();
      // add the layer to the map
      if (map?.current) {
        lg.addTo(map.current);
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
          start_date,
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

  const showLayer = (id: number): void => {
    const lg = mapLayerGroups.current[id];
    map?.current?.addLayer(lg);
  };

  const hideLayer = (id: number): void => {
    const lg = mapLayerGroups.current[id];
    map?.current?.removeLayer(lg);
  };

  const addDataToGeojson = (_buildings: Buildings): void => {
    const buildingsToAdd: Array<GeoJsonObject> = Object.values(_buildings).filter(
      (build) => !mapLayerGroups.current[build.properties?.id]
    );
    geojsonLayer?.current?.addData(buildingsToAdd as any); // TODO: any
  };

  const fetchBuildings = async (_map?: L.Map): Promise<void> => {
    if (!_map) {
      return;
    }
    const mapBoundaries = getMapBoundaries(_map);
    await getBuildings(mapBoundaries);
  };

  const filterBuildings = (): void => {
    const [min = 0, max = 0] = filter;
    Object.values(buildings).forEach(({ properties }) => {
      if (max >= +properties?.start_date && min <= +properties?.start_date) {
        showLayer(properties?.id);
      } else {
        hideLayer(properties?.id);
      }
    });
  };

  const handleFilterChange = () => {
    if (!debounceFn) {
      debounceFn = debounce(filterBuildings, 60);
    }
    debounceFn && debounceFn();
  };

  return <div id="map"></div>;
}

export default MapComponent;
