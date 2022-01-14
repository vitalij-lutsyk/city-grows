import React, { useState, useEffect } from "react";
import { defaultStartPoint } from "../constants/default-start-point";

import 'leaflet/dist/leaflet.css'
import L, { LatLngBoundsLiteral, Layer, LayerGroup, Map, GeoJSON, Control } from "leaflet";
import { urls } from "../constants/base-urls";
import { getPeriodsWithStylesByYear, periodsByFirstYear } from "../data/periods";
import { debounce } from "../utils/debounce";
import { Feature, FeatureCollection, GeoJsonObject, Geometry } from "geojson";
// L.Icon.Default.imagePath = ".";
// // delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

interface Buildings {
  [key: number]: Feature<Geometry>
}

interface LL {
  [key: number]: LayerGroup
}

interface MapProps {
  buildings: Buildings;
  getBuildings: Function;
  filter: [number, number];
}

function MapComponent(props: MapProps) {
  const { buildings, filter = [0, 0], getBuildings } = props;

  const [map, setMap] = useState<Map | null>(null);
  const [geojsonLayer, setGeojsonLayer] = useState<GeoJSON | null>(null);
  const [legend, setLegend] = useState<Control | null>(null);
  const [mapLayerGroups, setMapLayerGroups] = useState<LL>({});
  // const [debounceFn, setDebounceFn] = useState<Function | null>(null);

  // useEffect(() => {
  //   handleFilterChange();
  // }, [props.filter]);

  useEffect(() => {
    if (!map) {
      return;
    }
    if (!geojsonLayer) {
      createPolygonsLayer(buildings)
    } else {
      addDataToGeojson(Object.values(buildings))
    }
  }, [buildings, map])

  useEffect(() => {
    const _map = createMap();
    createLegend(_map);
  }, []);

  const startLocation = (): {
    lat: number;
    lng: number;
    zoom: number;
  } => {
    const urlParametersRegex = /(\?|\&)([^=]+)\=([^&]+)/gi;
    // const digitsRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
    const defaultLocation = {
      lat: defaultStartPoint.lat,
      lng: defaultStartPoint.lng,
      zoom: 17,
    };
    if (!window.location.search) {
      return defaultLocation;
    }
    const urlParameters = window.location.search.match(urlParametersRegex);
    const lat = urlParameters?.find((param) => param.includes("lat")) || defaultLocation.lat;
    const lng = urlParameters?.find((param) => param.includes("lng")) || defaultLocation.lng;
    const zoom = urlParameters?.find((param) => param.includes("zoom")) || defaultLocation.zoom;
    if (!lat || !lng || !zoom) {
      return defaultLocation;
    }
    return {
      lat: parseFloat(lat.toString()),
      lng: parseFloat(lng.toString()),
      zoom: parseInt(zoom.toString()),
    };
  };

  const createMap = () => {
    if (map) {
      return map;
    }
    const { lat, lng, zoom } = startLocation();
    const _map = new Map("map", { renderer: L.canvas() }).setView(
      [lat, lng],
      zoom
    );

    const tileLayer = L.tileLayer(urls.baseMap, {
      attribution: `&copy; <a href="${urls.osmCopyright}">OpenStreetMap</a> contributors`,
    })
    tileLayer.addTo(_map);
    _map.on("dragend", () => handleMapMove(_map));

    setMap(_map);
    fetchBuildings(_map);
    return _map;
    // updateUrlCoordinates();
  };
  const createLegend = (map: Map) => {
    if (legend) {
      return;
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
    _legend.addTo(map);
    setLegend(_legend);
  };
  const handleMapMove = async (map: Map) => {
    // updateUrlCoordinates();
    toggleLegendVisibility();
    if (map.getZoom() <= 13) return;
    await fetchBuildings(map);
  };
  const toggleLegendVisibility = () => {
    const lvivBoundaries: LatLngBoundsLiteral = [
      [49.777384397005484, 23.9088249206543],
      [49.894413228336724, 24.12769317626953],
    ];
    const lviv = L.rectangle(lvivBoundaries);

    const mapIntersectsLviv = map?.getBounds().intersects(lviv.getBounds());
    if (mapIntersectsLviv && map) {
      legend?.addTo(map);
    } else {
      legend?.remove();
    }
  };
  // const updateUrlCoordinates = () => {
  //   if (!map) return;
  //   const { lat, lng } = map.getCenter();
  //   const searchString = `?lat=${lat}&lng=${lng}&zoom=${map.getZoom()}`;
  //   history.pushState({}, null, $route.path + searchString);
  // };

  const getMapBoundaries = (map: L.Map) => {
    return Object.values(map?.getBounds() || [])
      .map((arr) => Object.values(arr).map((val) => val))
      .flat()
      .join(",");
  };
  const createPolygonsLayer = (buildings: Buildings) => {
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [...Object.values(buildings)],
    };
    const _geojsonLayer = new GeoJSON(geojson, {
      style: getPeriodsWithStylesByYear,
      onEachFeature,
    });
    setGeojsonLayer(_geojsonLayer);
  };
  // feature: geojson.Feature<geojson.GeometryObject, P>, layer: Layer
  const onEachFeature = (feature: Feature, featureLayer: Layer) => {
    // does layerGroup already exist? if not create it and add to map
    let lg = mapLayerGroups[feature.properties?.id];
    if (lg === undefined) {
      lg = new LayerGroup(); // TODO: any
      // add the layer to the map
      if (map) {
        lg.addTo(map);
      }
      // store layer
      mapLayerGroups[feature.properties?.id] = lg;
    }

    // add the feature to the layer
    featureLayer
      .bindPopup((layer: any) => { // TODO: any
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

  // const showLayer = (id: number) => {
  //   const lg = mapLayerGroups[id];
  //   map?.addLayer(lg);
  // };

  // const hideLayer = (id: number) => {
  //   const lg = mapLayerGroups[id];
  //   map?.removeLayer(lg);
  // };

  const addDataToGeojson = (buildings: Array<Feature>) => {
    const buildingsToAdd: Array<GeoJsonObject> = buildings.filter(
      (build) => !mapLayerGroups[build.properties?.id]
    );
    geojsonLayer?.addData(buildingsToAdd as any); // TODO: any
  };

  const fetchBuildings = async (map?: L.Map) => {
    if (!map) {
      return;
    }
    const mapBoundaries = getMapBoundaries(map);
    await getBuildings(mapBoundaries);
  };

  // const filterBuildings = () => {
  //   const [min = 0, max = 0] = filter;
  //   Object.values(buildings).forEach(({ properties }) => {
  //     if (max >= +properties?.start_date && min <= +properties?.start_date) {
  //       showLayer(properties?.id);
  //     } else {
  //       hideLayer(properties?.id);
  //     }
  //   });
  // };

  // const handleFilterChange = () => {
  //   if (!debounceFn) {
  //     setDebounceFn(debounce(filterBuildings, 60));
  //   }
  //   debounceFn && debounceFn();
  // };

  return <div id="map"></div>;
}

export default MapComponent;
