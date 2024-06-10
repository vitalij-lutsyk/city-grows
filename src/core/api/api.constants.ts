const apiParams = {
  baseUrl: 'https://www.overpass-api.de/api/interpreter',
  expectedType: 'json',
  expectedDataRules: [
    'relation["building"]["start_date"]',
    'way["building"]["start_date"]'
  ],
  endParams: 'out geom',
};

export const urls = {
  overpassApi: (mapBoundaries: string) => {
    const { baseUrl, expectedType, expectedDataRules, endParams } = apiParams
    const expectedData = expectedDataRules.map(rule => `${rule}(${mapBoundaries});`).join('')
    return `${baseUrl}?data=[out:${expectedType}];(${expectedData});${endParams};`
  },
  baseMap: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
  osmCopyright: 'https://www.openstreetmap.org/copyright',
  wiki: (article: string) => `https://wikipedia.org/wiki/${article}`
};
