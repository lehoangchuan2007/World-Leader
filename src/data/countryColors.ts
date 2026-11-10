/**
 * Geopolitical color palette for WORLD LEADER Phase 1.
 * Provides soft, distinguishable, historic/geopolitical hues.
 * Not too dark, pleasing contrast against ocean and crisp political borders.
 */

export const COUNTRY_PALETTE = [
  '#4a7c59', // Muted Forest Green
  '#b88b4a', // Warm Amber Gold
  '#855c75', // Dusty Plum / Rose
  '#4b6e8a', // Prussian Steel Blue
  '#a26c4f', // Terracotta Sienna
  '#537c78', // Deep Sage / Pine
  '#8e7d53', // Sand / Khaki Ochre
  '#74597d', // Muted Heather Violet
  '#6b7f4f', // Olive Green
  '#995d53', // Dusty Crimson
  '#4d7380', // Nordic Petrol Blue
  '#968565', // Desert Tan
  '#636e7b', // Slate Neutral
  '#7a6352', // Warm Umber
  '#52796f', // Sea Green
  '#826a7a', // Vintage Mauve
];

// Special designated colors for recognizable strategic continuity
export const SPECIAL_COUNTRY_COLORS: Record<string, string> = {
  // Vietnam & its archipelagos
  '704': '#a84e38', // Muted Vietnamese Imperial Red/Crimson
  Vietnam: '#a84e38',
  'vn-hoangsa': '#a84e38',
  'vn-truongsa': '#a84e38',

  // Other major countries for visual distinction
  'United States of America': '#4b6e8a', // Blue
  'China': '#9b5d3a',                  // Warm Brick
  'Russia': '#537c78',                 // Muted Pine
  'France': '#4a6782',                 // Slate Navy
  'United Kingdom': '#855c75',         // Royal Wine
  'Germany': '#6b705c',                // Field Gray-Green
  'Japan': '#a06155',                  // Rose Terracotta
  'India': '#8e7d53',                  // Warm Khaki
  'Australia': '#827351',              // Golden Ochre
  'Canada': '#7a545a',                 // Muted Berry
  'Brazil': '#4a7c59',                 // Forest Green
};

/**
 * Deterministically get a color for a country based on its ID or name
 */
export function getCountryColor(id: string | number, name?: string): string {
  const idStr = String(id);
  if (SPECIAL_COUNTRY_COLORS[idStr]) {
    return SPECIAL_COUNTRY_COLORS[idStr];
  }
  if (name && SPECIAL_COUNTRY_COLORS[name]) {
    return SPECIAL_COUNTRY_COLORS[name];
  }

  // Hash ID to pick from palette
  let hash = 0;
  const str = idStr + (name || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COUNTRY_PALETTE.length;
  return COUNTRY_PALETTE[index];
}

export const MAP_THEME = {
  ocean: '#0f172a',          // Deep navy ocean (Slate 900)
  graticule: '#1e293b',      // Subtle coordinate grid
  border: '#020617',         // Sharp border lines between countries (Slate 950)
  selectedBorder: '#f59e0b', // Vibrant Gold outline for selected country
  selectedGlow: 'rgba(245, 158, 11, 0.45)',
  hoverBorder: '#e2e8f0',    // Light highlight on hover
  countryLabel: '#f8fafc',   // High-contrast readable label
};
