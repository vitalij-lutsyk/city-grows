import { defaultStyle, defaultPolygonStyle, defaultCircleStyle } from "../constants/styles"

export const periodsByFirstYear = {
  1256: {
    name: 'Середньовіччя',
    from: 1256,
    to: 1772,
    color: '#304966'
  },
  1773: {
    name: 'Австрія',
    from: 1773,
    to: 1848,
    color: '#355070'
  },
  1849: {
    name: 'Австрія-автономна',
    from: 1849,
    to: 1918,
    color: '#6D597A'
  },
  1919: {
    name: 'Польща',
    from: 1919,
    to: 1939,
    color: '#B56576'
  },
  1940: {
    name: 'Сталінки',
    from: 1940,
    to: 1953,
    color: '#E56B6F'
  },
  1954: {
    name: 'Хрущовки',
    from: 1954,
    to: 1966,
    color: '#EAAC8B'
  },
  1967: {
    name: 'Брежнівки',
    from: 1967,
    to: 1982,
    color: '#ffd94b'
  },
  1983: {
    name: 'Перестройка',
    from: 1983,
    to: 1991,
    color: '#86bf2e'
  },
  1991: {
    name: 'Пострадянський',
    from: 1991,
    to: 2010,
    color: '#60a453'
  },
  2011: {
    name: 'Глобалізація',
    from: 2011,
    to: 2020,
    color: '#199900'
  }
}

export const getPeriodsWithStylesByYear = function(feature) {
  const year = +feature.properties.start_date
  const type = feature.geometry.type
  if (type === 'Polygon') {
    Object.assign(defaultStyle, defaultPolygonStyle)
  }
  if (type === 'Point') {
    Object.assign(defaultStyle, defaultCircleStyle)
  }
  const mappedYear = +Object.keys(periodsByFirstYear).reverse().find(y => y <= year);
  return Object.assign(defaultStyle, periodsByFirstYear[mappedYear])
}