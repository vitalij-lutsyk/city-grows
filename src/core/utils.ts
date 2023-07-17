import { Feature, LineString, MultiLineString, Polygon, Point, Geometry } from "geojson";

import {
  defaultStyle,
  defaultPolygonStyle,
  defaultLineStyle,
  defaultCircleStyle,
} from "../core/map/map.styles";
import { periodsByFirstYear } from "../data/periods";

export const getYear = (year: number | string | null | undefined) => {
  if (!year) return undefined;
  if (typeof year === 'string') {
    const _year = year.match(/\d{4}/)?.[0];
    return Boolean(_year) ? Number(_year) : undefined;
  }
  return year;
}

abstract class AbstractFeatureProp {
  date_from_text?: number | string;
  date_to_text?: number | string;
  start_date?: number | string;
}

type AbstractFeature = Feature<Geometry, AbstractFeatureProp>;
type AbstractFeatures = Array<AbstractFeature>;

export const getYears = (
  features: AbstractFeatures,
  fields: Array<keyof AbstractFeatureProp>
): Array<number> => {
  const result: { [key: string]: number } = {};
  features
    .flatMap(({properties: p}) => [p[fields[0]], p[fields[1]], p[fields[2]]].filter(y => y))
    .forEach(year => {
      const _year = getYear(year);

      if (!_year || _year in result) {
        return;
      }
      result[_year] = _year;
    });
  return Object.values(result).filter(
    (year) => year <= new Date().getFullYear()
  );
};

export const getPeriodsWithStylesByYear = function (feature?: AbstractFeature) {
  if (!feature) return {};

  const year = getYear(feature.properties.start_date || feature.properties.date_from_text);
  const type = feature.geometry.type;
  let style = {...defaultStyle};
  if (['MultiLineString', 'LineString'].includes(type)) {
    style = {...style, ...defaultLineStyle};
  }
  if (type === "Polygon") {
    style = {...style, ...defaultPolygonStyle};
  }
  if (type === "Point") {
    style = {...style, ...defaultCircleStyle};
  }
  const mappedYear = year && Number(Object.keys(periodsByFirstYear)
    .reverse()
    .find((y) => Number(y) <= year));

  if(!mappedYear) return style;

  return {
    ...style,
    color: periodsByFirstYear[mappedYear].color,
  };

};
