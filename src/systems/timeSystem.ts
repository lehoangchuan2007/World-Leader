import { GameDate, TimeSpeed } from '../types/game';

/**
 * Initial start date for WORLD LEADER Phase 1: 01/01/1925
 */
export const INITIAL_GAME_DATE: GameDate = {
  day: 1,
  month: 1,
  year: 1925,
};

/**
 * Real-time duration (ms) for 1 game day based on speed:
 * X1: 1 game day = 2s (2000ms)
 * X2: 1 game day = 1s (1000ms)
 */
export const SPEED_INTERVALS: Record<Exclude<TimeSpeed, 'pause'>, number> = {
  x1: 2000,
  x2: 1000,
};

/**
 * Check if a given year is a leap year (Gregorian calendar rules)
 */
export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

/**
 * Returns number of days in a given month and year
 */
export function getDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 1: // January
    case 3: // March
    case 5: // May
    case 7: // July
    case 8: // August
    case 10: // October
    case 12: // December
      return 31;
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      return 30;
    case 2: // February
      return isLeapYear(year) ? 29 : 28;
    default:
      return 30;
  }
}

/**
 * Advance calendar by exactly 1 day
 */
export function advanceOneDay(current: GameDate): GameDate {
  const daysInCurrentMonth = getDaysInMonth(current.month, current.year);
  
  if (current.day < daysInCurrentMonth) {
    return {
      ...current,
      day: current.day + 1,
    };
  }

  // End of month reached
  if (current.month < 12) {
    return {
      day: 1,
      month: current.month + 1,
      year: current.year,
    };
  }

  // End of year reached
  return {
    day: 1,
    month: 1,
    year: current.year + 1,
  };
}

/**
 * Format date in standard DD/MM/YYYY
 */
export function formatGameDate(date: GameDate): {
  dayStr: string;
  monthStr: string;
  yearStr: string;
  fullStr: string;
} {
  const dayStr = String(date.day).padStart(2, '0');
  const monthStr = String(date.month).padStart(2, '0');
  const yearStr = String(date.year);
  return {
    dayStr,
    monthStr,
    yearStr,
    fullStr: `${dayStr}/${monthStr}/${yearStr}`,
  };
}
