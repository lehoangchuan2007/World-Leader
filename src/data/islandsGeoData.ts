import type { Feature, Polygon } from 'geojson';

export interface IslandFeatureProperties {
  id: string;
  name: string;
  nameVi: string;
  countryId: string;
  countryName: string;
  countryNameVi: string;
  isArchipelago: boolean;
}

/**
 * GeoJSON polygon for Quần đảo Hoàng Sa (Paracel Islands)
 * Real geographical coordinates: 15°45'N - 17°15'N, 111°10'E - 112°55'E
 */
export const hoangSaFeature: Feature<Polygon, IslandFeatureProperties> = {
  type: 'Feature',
  id: 'vn-hoangsa',
  properties: {
    id: 'vn-hoangsa',
    name: 'Hoang Sa Archipelago',
    nameVi: 'Quần đảo Hoàng Sa',
    countryId: '704',
    countryName: 'Vietnam',
    countryNameVi: 'Việt Nam',
    isArchipelago: true,
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [111.18, 15.78],
        [111.08, 16.32],
        [111.48, 16.92],
        [112.18, 17.22],
        [112.85, 17.18],
        [112.92, 16.65],
        [112.58, 16.15],
        [111.65, 15.68],
        [111.18, 15.78],
      ],
    ],
  },
};

/**
 * GeoJSON polygon for Quần đảo Trường Sa (Spratly Islands)
 * Real geographical coordinates: 7°20'N - 11°55'N, 111°30'E - 117°20'E
 */
export const truongSaFeature: Feature<Polygon, IslandFeatureProperties> = {
  type: 'Feature',
  id: 'vn-truongsa',
  properties: {
    id: 'vn-truongsa',
    name: 'Truong Sa Archipelago',
    nameVi: 'Quần đảo Trường Sa',
    countryId: '704',
    countryName: 'Vietnam',
    countryNameVi: 'Việt Nam',
    isArchipelago: true,
  },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [114.35, 11.60],
        [116.85, 11.62],
        [117.35, 10.55],
        [117.10, 8.85],
        [115.60, 7.50],
        [113.80, 7.25],
        [112.45, 7.75],
        [111.75, 8.55],
        [112.15, 10.05],
        [113.90, 11.25],
        [114.35, 11.60],
      ],
    ],
  },
};

export const specialArchipelagoFeatures = [hoangSaFeature, truongSaFeature];
