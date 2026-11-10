import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import worldDataRaw from 'world-atlas/countries-50m.json';
import { specialArchipelagoFeatures } from './islandsGeoData';
import { getCountryNameVi } from './countryNamesVi';
import { getCountryColor } from './countryColors';

export interface CountryProperties {
  id: string;
  name: string;
  nameVi: string;
  color: string;
  isArchipelago?: boolean;
}

export type CountryMapFeature = Feature<Geometry, CountryProperties>;

/**
 * Loads and processes all countries + special archipelagos (Hoàng Sa & Trường Sa)
 */
export function getLoadedMapFeatures(): CountryMapFeature[] {
  const topology = worldDataRaw as unknown as Topology<{
    countries: GeometryCollection<{ name?: string }>;
  }>;

  const geojson = feature(topology, topology.objects.countries);

  const countryFeatures: CountryMapFeature[] = geojson.features.map((f) => {
    const rawId = String(f.id || '');
    const rawName = f.properties?.name || `Quốc gia ${rawId}`;
    const nameVi = getCountryNameVi(rawName);
    const color = getCountryColor(rawId, rawName);

    return {
      type: 'Feature',
      id: rawId,
      properties: {
        id: rawId,
        name: rawName,
        nameVi,
        color,
        isArchipelago: false,
      },
      geometry: f.geometry,
    };
  });

  // Append separate polygons for Quần đảo Hoàng Sa and Quần đảo Trường Sa
  const archipelagoFeatures: CountryMapFeature[] = specialArchipelagoFeatures.map((f) => {
    return {
      type: 'Feature',
      id: f.properties.id,
      properties: {
        id: f.properties.id,
        name: f.properties.name,
        nameVi: f.properties.nameVi,
        color: getCountryColor(f.properties.id, f.properties.name),
        isArchipelago: true,
      },
      geometry: f.geometry,
    };
  });

  return [...countryFeatures, ...archipelagoFeatures];
}
