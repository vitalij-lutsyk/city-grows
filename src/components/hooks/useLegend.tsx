import L, { LatLngBoundsLiteral, Map, Control } from "leaflet";

import "../../styles/legend.css";
import { periodsByFirstYear } from "../../data/periods";
import { useRef } from "react";

export const useLegend = () => {
  const legend = useRef<Control | null>(null);
  const createLegend = (map: Map): void => {
    if(legend.current) {
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
    legend.current = _legend;
    _legend.addTo(map);
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
  return { toggleLegendVisibility, createLegend };
}
