
import { getYear } from "../../core/utils";
import { StreetFeature, StreetProperties } from "./streets.interfaces";

export const checkIsStreetInRange = (
  feature: StreetFeature,
  filter: [number, number]
) => {
  const {date_from_text} = feature.properties;
  const startDate = getYear(date_from_text);
  return startDate && startDate >= filter[0] && startDate <= filter[1];
};

export const buildPopup = (layer: any) => {
  const prop: StreetProperties = layer.feature.properties;
  const {
    title,
    date_from_text,
    date_to_text,
  } = prop;
  return `<div>
      <p>${title}</p>
      <p>${date_from_text || 'since'} - ${date_to_text || 'now'}</p>
    </div>`;
};
