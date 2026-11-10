/**
 * WORLD LEADER - Giai đoạn 3: Economy & Budget System
 * Triển khai công thức thuế, ngân sách ban đầu, hiệu suất Bộ trưởng Tài chính và di cư theo đúng thiết kế.
 */

import { CountryEconomy } from '../types/economy';
import { getDaysInMonth } from './timeSystem';
import { getModernPopulation } from '../data/populationData';

// Mức thuế mặc định ban đầu: 2.5 USD/người/tháng (nằm an toàn dưới ngưỡng di cư 3.0 USD)
export const DEFAULT_TAX_RATE = 2.5;

// Giới hạn thuế suất
export const MIN_TAX_RATE = 0.0;
export const MAX_TAX_RATE = 10.0;
export const TAX_RATE_STEP = 0.1;

// Ngưỡng thuế kích hoạt di cư (USD/người/tháng)
export const MIGRATION_TAX_THRESHOLD = 3.0;

/**
 * Tính hiệu suất thu thuế của Bộ trưởng Tài chính
 * - Kỹ năng 100: hiệu suất 100% (1.00)
 * - Kỹ năng 50: hiệu suất 95% (0.95)
 * - Nội suy tuyến tính trong khoảng [90% - 100%]
 * - Nếu chưa bổ nhiệm Bộ trưởng Tài chính: áp dụng mức tối thiểu 90% (0.90)
 */
export function calculateFinanceMinisterTaxEfficiency(managementAbility?: number | null): number {
  if (managementAbility === undefined || managementAbility === null) {
    return 0.90; // Chưa bổ nhiệm -> 90%
  }
  const clampedSkill = Math.min(100, Math.max(0, managementAbility));
  return 0.90 + (clampedSkill / 100) * 0.10;
}

/**
 * Tính tổng thuế tháng theo công thức gốc:
 * Monthly Tax Revenue = Dân số × Mức thuế (USD/người/tháng)
 */
export function calculateMonthlyGrossTax(population: number, taxRate: number): number {
  return population * taxRate;
}

/**
 * Tính ngân sách ban đầu của quốc gia:
 * Initial Treasury = 40% × Monthly Tax Revenue
 * Lưu ý: TUYỆT ĐỐI không nhân hiệu suất của Bộ trưởng Tài chính vào công thức này.
 */
export function calculateInitialTreasury(population: number, taxRate: number): number {
  const grossMonthly = calculateMonthlyGrossTax(population, taxRate);
  return 0.40 * grossMonthly;
}

/**
 * Tính thuế thu hàng ngày cho một tháng cụ thể:
 * - Tổng thuế tháng chia đều cho số ngày thực tế của tháng (28, 29, 30 hoặc 31 ngày).
 * - Nhân với hiệu suất thu thuế của Bộ trưởng Tài chính.
 */
export function calculateDailyTaxCollection(
  population: number,
  taxRate: number,
  month: number,
  year: number,
  financeMinisterAbility?: number | null
): {
  grossDailyUSD: number;
  netDailyUSD: number;
  efficiency: number;
  daysInMonth: number;
} {
  const daysInMonth = getDaysInMonth(month, year);
  const efficiency = calculateFinanceMinisterTaxEfficiency(financeMinisterAbility);
  const monthlyGross = calculateMonthlyGrossTax(population, taxRate);
  
  const grossDailyUSD = monthlyGross / daysInMonth;
  const netDailyUSD = grossDailyUSD * efficiency;

  return {
    grossDailyUSD,
    netDailyUSD,
    efficiency,
    daysInMonth,
  };
}

/**
 * Tính tỷ lệ di cư mỗi tháng (r) khi mức thuế vượt ngưỡng 3 USD/người/tháng:
 * Công thức:
 * r = min(1%, 0.05% × (T − 3) × [1 + 0.1(m − 1)])
 * Trong đó:
 * - T: Mức thuế USD/người/tháng
 * - m: Số tháng liên tục duy trì mức thuế vượt ngưỡng (m >= 1)
 * Giới hạn tối đa: 1% (0.01).
 * Khi T <= 3: r = 0, dừng di cư và đặt lại m = 0.
 */
export function calculateMonthlyMigrationRate(
  taxRate: number,
  consecutiveHighTaxMonths: number
): number {
  if (taxRate <= MIGRATION_TAX_THRESHOLD) {
    return 0;
  }

  const m = Math.max(1, consecutiveHighTaxMonths);
  const rawRate = 0.0005 * (taxRate - MIGRATION_TAX_THRESHOLD) * (1 + 0.1 * (m - 1));
  return Math.min(0.01, Math.max(0, rawRate));
}

/**
 * Khởi tạo dữ liệu kinh tế cho một quốc gia
 */
export function initializeCountryEconomy(
  countryId: string,
  countryName: string,
  financeMinisterAbility?: number | null,
  customTaxRate: number = DEFAULT_TAX_RATE
): CountryEconomy {
  const population = getModernPopulation(countryId, countryName);
  const taxRate = Math.min(MAX_TAX_RATE, Math.max(MIN_TAX_RATE, customTaxRate));
  
  // Ngân sách ban đầu = 40% Monthly Gross Tax (không nhân hiệu suất)
  const initialTreasury = calculateInitialTreasury(population, taxRate);
  const monthlyTaxGross = calculateMonthlyGrossTax(population, taxRate);

  // Tính thuế ngày cho tháng 1 năm 1925 (31 ngày)
  const { netDailyUSD } = calculateDailyTaxCollection(
    population,
    taxRate,
    1,
    1925,
    financeMinisterAbility
  );

  return {
    countryId,
    countryName,
    population,
    basePopulation: population,
    taxRate,
    treasury: initialTreasury,
    initialTreasury,
    consecutiveHighTaxMonths: 0,
    currentMonthMigrationRate: 0,
    totalMigratedPopulation: 0,
    monthlyTaxGross,
    dailyTaxNet: netDailyUSD,
    dailyFactoryMaintenance: 0,
    dailyNetCashFlow: netDailyUSD,
  };
}
