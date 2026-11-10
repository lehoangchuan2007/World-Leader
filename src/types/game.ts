/**
 * WORLD LEADER - Giai đoạn 1: Type Definitions
 * Strictly scoped to Phase 1: Map & Main UI
 */

export interface GameDate {
  day: number;
  month: number;
  year: number;
}

export type TimeSpeed = 'pause' | 'x1' | 'x2';

export type ActivePage =
  | 'map'
  | 'politics'
  | 'factories'
  | 'economy'
  | 'military'
  | 'diplomacy'
  | 'technology'
  | 'settings';

export interface SelectedCountry {
  id: string;
  name: string;
  nameVi: string;
}

export type PlayerCountry = SelectedCountry;

export interface MapViewport {
  x: number;
  y: number;
  k: number;
}

export * from './politics';
export * from './factory';
