export const urls = {
  overpassApi: (mapBoundaries) => {
    const { baseUrl, expectedType, expectedDataRules, endParams } = apiParams
    const expectedData = expectedDataRules.map(rule => `${rule}(${mapBoundaries});`).join('')
    return `${baseUrl}?data=[out:${expectedType}];(${expectedData});${endParams};`
  },
  baseMap: 'http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
  osmCopyright: 'https://www.openstreetmap.org/copyright',
  wiki: (article) => `https://wikipedia.org/wiki/${article}`
}

const apiParams = {
  baseUrl: 'https://www.overpass-api.de/api/interpreter',
  expectedType: 'json',
  expectedDataRules: [
    'relation["building"]["start_date"]',
    'way["building"]["start_date"]'
  ],
  endParams: 'out geom',
}