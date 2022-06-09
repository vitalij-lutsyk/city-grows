
import { Feature, Geometry, Polygon } from "geojson";

import { OverpassApiRes, OverpassApiResItem } from "../interfaces/api-response";
import { Buildings } from "../interfaces/map.interface";
import { urls } from "../constants/base-urls";

export const checkIsBuildingInRange = (
  feature: Feature<Geometry, any>,
  filter: [number, number]
) => {
  const startDate = Number(feature.properties.start_date);
  return startDate >= filter[0] && startDate <= filter[1];
};

export const prepareBuildings = (data: OverpassApiRes): Buildings => {
  const { elements: buildings } = data;
  return buildings
    .map(constructBuildingShape)
    .filter((build) => {
      const startDate = build?.properties?.start_date + "";
      return startDate || startDate.length === 4 || !isNaN(parseInt(startDate));
    });
};

const constructBuildingShape = (
  build: OverpassApiResItem
): Feature<Polygon> => {
  const geometry: Polygon = {
    type: "Polygon",
    coordinates: [],
  };
  const preparedBuild: Feature<Polygon> = {
    type: "Feature",
    properties: { id: build.id, ...build.tags },
    geometry,
  };
  if (build.type === "way") {
    geometry.coordinates = [build.geometry.map((node) => Object.values(node).reverse())];
  }
  if (build.type === "relation" && build.members?.length) {
    const outerLine = build.members.find((member) =>
      ["outer", "outline"].includes(member.role)
    );
    const mappedCoords =
      outerLine?.geometry.map((node) => Object.values(node).reverse()) || [];
    geometry.coordinates = [mappedCoords];
  }
  return preparedBuild;
};

export const getYears = (buildings: Buildings): Array<number> => {
  const result: { [key: string]: number } = {};
  buildings
    .map((build) => build.properties?.start_date)
    .forEach((year) => {
      if (!year || isNaN(year) || year in result) {
        return;
      }
      result[year] = year;
    });
  return Object.values(result).filter(
    (year) => year <= new Date().getFullYear()
  );
};

export const buildPopup = (layer: any) => {
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
};
