/**
 * WORLD LEADER - Giai đoạn 4: Factory Progress System
 * Tiến trình thời gian và tự động đưa nhà máy vào vận hành sau khi hoàn thành.
 * Kế thừa hoàn toàn hệ thống thời gian game (không dùng đồng hồ máy tính).
 */

import { FactoryInstance, FactoryLevel } from '../types/factory';
import { getFactorySpec } from '../data/factorySpecs';

export interface ProgressResult {
  updatedFactories: FactoryInstance[];
  completedFactoryIds: string[];
}

/**
 * Cập nhật tiến độ xây dựng và nâng cấp cho danh sách nhà máy khi qua một ngày game
 */
export function advanceFactoriesOneDay(
  factories: FactoryInstance[],
  currentDate: { day: number; month: number; year: number }
): ProgressResult {
  const completedFactoryIds: string[] = [];

  const updatedFactories = factories.map((factory) => {
    // Nếu nhà máy đã đang hoạt động thì không cần đếm tiến độ xây dựng
    if (factory.status === 'operating') {
      return factory;
    }

    const nextDaysElapsed = factory.daysElapsed + 1;

    // Kiểm tra đã hoàn thành thời gian xây dựng / nâng cấp chưa
    if (nextDaysElapsed >= factory.totalDurationDays) {
      completedFactoryIds.push(factory.id);

      if (factory.status === 'building') {
        // Hoàn thành xây dựng ban đầu cấp 1
        const spec = getFactorySpec(factory.type, 1);
        return {
          ...factory,
          status: 'operating' as const,
          currentLevel: 1 as FactoryLevel,
          daysElapsed: factory.totalDurationDays,
          dailyOutput: spec.dailyOutput,
          outputUnit: spec.outputUnit,
          dailyMaintenanceUSD: spec.dailyMaintenanceUSD,
          completedDate: currentDate,
        };
      } else if (factory.status === 'upgrading') {
        // Hoàn thành nâng cấp lên cấp độ kế tiếp
        const newLevel = (factory.targetLevel || factory.currentLevel + 1) as FactoryLevel;
        const newSpec = getFactorySpec(factory.type, newLevel);

        return {
          ...factory,
          status: 'operating' as const,
          currentLevel: newLevel,
          targetLevel: undefined,
          daysElapsed: factory.totalDurationDays,
          dailyOutput: newSpec.dailyOutput,
          outputUnit: newSpec.outputUnit,
          dailyMaintenanceUSD: newSpec.dailyMaintenanceUSD,
          completedDate: currentDate,
          upgradeHistory: [
            ...factory.upgradeHistory,
            {
              fromLevel: factory.currentLevel,
              toLevel: newLevel,
              costUSD: newSpec.buildCostUSD,
              completionDate: currentDate,
            },
          ],
        };
      }
    }

    // Tiếp tục tiến độ
    return {
      ...factory,
      daysElapsed: nextDaysElapsed,
    };
  });

  return {
    updatedFactories,
    completedFactoryIds,
  };
}
