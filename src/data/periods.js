import {
  defaultStyle,
  defaultPolygonStyle,
  defaultCircleStyle,
} from "../styles/styles";

const colors = {
  indigoDye: "#304966ff",
  yInMnBlue: "#355070ff",
  chineseViolet: "#6d597aff",
  roseDust: "#a96275ff",
  candyPink: "#e56b6fff",
  tumbleweed: "#eaac8bff",
  apricot: "#eebba0ff",
  mediumChampagne: "#f9c758",
  greenLizard: "#bced35ff",
  screaminGreen: "#75f048ff",
};

export const periodsByFirstYear = {
  1256: {
    name: "Середньовіччя",
    from: 1256,
    to: 1772,
    color: colors.indigoDye,
  },
  1773: {
    name: "Австрія",
    from: 1773,
    to: 1848,
    color: colors.yInMnBlue,
  },
  1849: {
    name: "Австрія-автономна",
    from: 1849,
    to: 1918,
    color: colors.chineseViolet,
  },
  1919: {
    name: "Польща",
    from: 1919,
    to: 1939,
    color: colors.roseDust,
  },
  1940: {
    name: "Сталінки",
    from: 1940,
    to: 1953,
    color: colors.candyPink,
  },
  1954: {
    name: "Хрущовки",
    from: 1954,
    to: 1966,
    color: colors.tumbleweed,
  },
  1967: {
    name: "Брежнівки",
    from: 1967,
    to: 1982,
    color: colors.apricot,
  },
  1983: {
    name: "Перестройка",
    from: 1983,
    to: 1991,
    color: colors.mediumChampagne,
  },
  1991: {
    name: "Пострадянський",
    from: 1991,
    to: 2010,
    color: colors.greenLizard,
  },
  2011: {
    name: "Глобалізація",
    from: 2011,
    to: 2020,
    color: colors.screaminGreen,
  },
};

export const getPeriodsWithStylesByYear = function (feature) {
  const year = +feature.properties.start_date;
  const type = feature.geometry.type;
  let style = {...defaultStyle};
  if (type === "Polygon") {
    style = {...style, ...defaultPolygonStyle};
  }
  if (type === "Point") {
    style = {...style, ...defaultCircleStyle};
  }
  const mappedYear = +Object.keys(periodsByFirstYear)
    .reverse()
    .find((y) => y <= year);
  return {...style, ...periodsByFirstYear[mappedYear]};
};
