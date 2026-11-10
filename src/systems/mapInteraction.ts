import { geoNaturalEarth1, geoPath, GeoPath, GeoProjection } from 'd3-geo';
import { MapViewport } from '../types/game';

export const BASE_MAP_WIDTH = 1200;
export const BASE_MAP_HEIGHT = 620;

export const MIN_ZOOM = 0.8;
export const MAX_ZOOM = 18.0;

/**
 * Creates the standard 2D flat natural earth projection
 */
export function createMapProjection(): GeoProjection {
  return geoNaturalEarth1()
    .scale(190)
    .translate([BASE_MAP_WIDTH / 2, BASE_MAP_HEIGHT / 2]);
}

/**
 * Creates the D3 geo path generator
 */
export function createPathGenerator(projection: GeoProjection): GeoPath {
  return geoPath().projection(projection);
}

/**
 * Clamps viewport zoom and pan coordinates within safe limits
 */
export function clampViewport(
  viewport: MapViewport,
  containerWidth: number,
  containerHeight: number
): MapViewport {
  const k = Math.min(Math.max(viewport.k, MIN_ZOOM), MAX_ZOOM);

  // Allow panning within a generous margin of the map bounds
  const mapWidthScaled = BASE_MAP_WIDTH * k;
  const mapHeightScaled = BASE_MAP_HEIGHT * k;

  const minX = containerWidth - mapWidthScaled - containerWidth * 0.5;
  const maxX = containerWidth * 0.5;

  const minY = containerHeight - mapHeightScaled - containerHeight * 0.5;
  const maxY = containerHeight * 0.5;

  return {
    k,
    x: Math.min(Math.max(viewport.x, minX), maxX),
    y: Math.min(Math.max(viewport.y, minY), maxY),
  };
}

/**
 * Zooms into a specific center point (e.g. cursor or screen center)
 */
export function zoomToPoint(
  current: MapViewport,
  deltaScale: number,
  focalPoint: { x: number; y: number }
): MapViewport {
  const newK = Math.min(Math.max(current.k * deltaScale, MIN_ZOOM), MAX_ZOOM);
  const factor = newK / current.k;

  // Zoom centered on focal point: focalPoint.x = x + localX * k
  const newX = focalPoint.x - (focalPoint.x - current.x) * factor;
  const newY = focalPoint.y - (focalPoint.y - current.y) * factor;

  return {
    k: newK,
    x: newX,
    y: newY,
  };
}
