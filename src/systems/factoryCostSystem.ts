/**
 * WORLD LEADER - Giai đoạn 4: Factory Cost Recording System
 * Bộ ghi nhận chi phí riêng dành cho hệ thống nhà máy.
 * Không triển khai hệ thống kinh tế tổng thể của GĐ3 (không thuế, không nợ công, không GDP).
 * Chi phí xây dựng và duy trì được ghi nhận để theo dõi, không phải điều kiện từ chối xây dựng.
 */

import {
  FactoryCostRecord,
  FactoryInstance,
  FactoryLevel,
  FactoryType,
} from '../types/factory';

/**
 * Tạo bản ghi chi phí xây dựng hoặc nâng cấp một lần
 */
export function recordOneTimeFactoryCost(
  countryId: string,
  provinceId: string,
  factoryType: FactoryType,
  level: FactoryLevel,
  costType: 'construction' | 'upgrade',
  amountUSD: number,
  gameDate: { day: number; month: number; year: number }
): FactoryCostRecord {
  return {
    id: `cost_${costType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    countryId,
    provinceId,
    factoryType,
    level,
    costType,
    amountUSD,
    gameDate,
  };
}

/**
 * Tạo các bản ghi chi phí duy trì hàng ngày cho các nhà máy đang hoạt động
 */
export function recordDailyMaintenanceCosts(
  factories: FactoryInstance[],
  gameDate: { day: number; month: number; year: number }
): FactoryCostRecord[] {
  const records: FactoryCostRecord[] = [];

  for (const f of factories) {
    if (f.status === 'operating' && f.dailyMaintenanceUSD > 0) {
      records.push({
        id: `cost_maint_${f.id}_${gameDate.year}_${gameDate.month}_${gameDate.day}`,
        countryId: f.countryId,
        provinceId: f.provinceId,
        factoryType: f.type,
        level: f.currentLevel,
        costType: 'maintenance',
        amountUSD: f.dailyMaintenanceUSD,
        gameDate,
      });
    }
  }

  return records;
}
