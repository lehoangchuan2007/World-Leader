// Map sources and illustrative island overlays are kept separate from UI code.
export const WORLD_GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export const GEOBOUNDARIES_API =
  "https://www.geoboundaries.org/api/current/gbOpen";

export const ISLAND_GROUPS = [
  {
    id: "hoang-sa",
    name: "Quần đảo Hoàng Sa",
    shortName: "Hoàng Sa",
    // Schematic locator polygon for map interaction, not a cadastral boundary.
    coordinates: [
      [111.0, 16.0], [111.7, 17.25], [113.25, 17.1],
      [113.7, 16.2], [113.0, 15.55], [111.55, 15.55], [111.0, 16.0]
    ]
  },
  {
    id: "truong-sa",
    name: "Quần đảo Trường Sa",
    shortName: "Trường Sa",
    // Schematic locator polygon for map interaction, not a cadastral boundary.
    coordinates: [
      [109.0, 11.8], [110.0, 12.25], [114.0, 11.8],
      [117.0, 10.4], [116.2, 7.1], [113.3, 6.0],
      [110.2, 7.0], [109.0, 9.2], [109.0, 11.8]
    ]
  }
];

export function getCountryIso3(properties = {}) {
  const candidates = [
    properties["ISO3166-1-Alpha-3"],
    properties.ISO3166_1_Alpha_3,
    properties.ISO_A3,
    properties.ADM0_A3,
    properties.iso_a3,
    properties.ISO3
  ];
  return candidates.find((value) => value && value !== "-99") || "";
}

export function getCountryName(properties = {}) {
  return properties.ADMIN || properties.name || properties.NAME || properties.SOVEREIGNT || "Quốc gia";
}

export function getCountryColor(iso3 = "", name = "") {
  const palette = [
    "#8eb8a5", "#d8ad82", "#91a9ce", "#c6a0b7", "#d1c17e",
    "#83b9bd", "#b4a1d4", "#d49b8c", "#9eaf83", "#8fa6b1",
    "#d2a96e", "#a3b7a0", "#c49c91", "#91a7c7", "#b9ad82",
    "#8db6a9", "#c5a3c2", "#b0b4d0", "#d0b18f", "#9ab6c5"
  ];
  const key = iso3 || name;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export function getAdmin1Url(iso3) {
  return `${GEOBOUNDARIES_API}/${encodeURIComponent(iso3)}/ADM1/`;
}