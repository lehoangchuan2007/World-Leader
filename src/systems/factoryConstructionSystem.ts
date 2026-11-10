/**
 * WORLD LEADER - Giai đoạn 4: Factory Construction System
 * Điều phối các quy tắc kiểm tra và khởi tạo xây dựng / nâng cấp nhà máy.
 */

import {
  FactoryInstance,
  FactoryLevel,
  FactoryType,
  Province,
} from '../types/factory';
import { getFactorySpec } from '../data/factorySpecs';

export interface ConstructionCheckResult {
  canBuild: boolean;
  reason?: string;
}

export interface UpgradeCheckResult {
  canUpgrade: boolean;
  nextLevel?: FactoryLevel;
  reason?: string;
}

/**
 * Kiểm tra xem có thể xây dựng loại nhà máy dự kiến tại tỉnh hay không
 * Quy định bắt buộc:
 * 1. Mỗi tỉnh chỉ được có tối đa 1 nhà máy thuộc nhóm dầu / lương thực (loại trừ lẫn nhau).
 * 2. Nhà máy uranium chỉ được xây tại tỉnh có mỏ uranium, tối đa 1 nhà máy uranium mỗi tỉnh.
 * 3. Không thể xây dựng trực tiếp cấp II, III, IV. Luôn bắt đầu từ cấp 1.
 */
export function checkCanBuildFactory(
  province: Province,
  type: FactoryType,
  existingFactoriesInProvince: FactoryInstance[]
): ConstructionCheckResult {
  // 1. Kiểm tra nhà máy Uranium
  if (type === 'uranium') {
    if (!province.hasUraniumDeposit) {
      return {
        canBuild: false,
        reason: `Tỉnh ${province.name} không có mỏ uranium được xác minh. Không đủ điều kiện xây dựng nhà máy uranium.`,
      };
    }

    const hasUraniumFactory = existingFactoriesInProvince.some((f) => f.type === 'uranium');
    if (hasUraniumFactory) {
      return {
        canBuild: false,
        reason: `Tỉnh ${province.name} đã có nhà máy uranium. Mỗi tỉnh chỉ được xây tối đa một nhà máy uranium.`,
      };
    }

    return { canBuild: true };
  }

  // 2. Kiểm tra nhóm Dầu / Lương thực
  if (type === 'oil' || type === 'food') {
    const existingOilOrFood = existingFactoriesInProvince.find(
      (f) => f.type === 'oil' || f.type === 'food'
    );

    if (existingOilOrFood) {
      const typeName = existingOilOrFood.type === 'oil' ? 'nhà máy dầu' : 'nhà máy lương thực';
      return {
        canBuild: false,
        reason: `Tỉnh ${province.name} đã có ${typeName}. Quy định mỗi tỉnh chỉ được có tối đa một nhà máy thuộc nhóm Dầu hoặc Lương thực.`,
      };
    }

    return { canBuild: true };
  }

  return { canBuild: false, reason: 'Loại nhà máy không xác định.' };
}

/**
 * Kiểm tra xem một nhà máy có thể nâng cấp hay không
 * Quy định:
 * 1. Nhà máy Uranium không có hệ thống nâng cấp.
 * 2. Chỉ được nâng cấp tuần tự I -> II -> III -> IV, không được bỏ qua cấp độ.
 * 3. Đang xây dựng hoặc đang nâng cấp thì không được khởi tạo nâng cấp tiếp.
 * 4. Đã đạt cấp IV (cấp tối đa) thì không thể nâng cấp tiếp.
 */
export function checkCanUpgradeFactory(
  factory: FactoryInstance
): UpgradeCheckResult {
  if (factory.type === 'uranium') {
    return {
      canUpgrade: false,
      reason: 'Nhà máy uranium chỉ có 1 cấp độ duy nhất, không có hệ thống nâng cấp.',
    };
  }

  if (factory.status === 'building') {
    return {
      canUpgrade: false,
      reason: 'Nhà máy đang trong quá trình xây dựng ban đầu. Không thể nâng cấp lúc này.',
    };
  }

  if (factory.status === 'upgrading') {
    return {
      canUpgrade: false,
      reason: 'Nhà máy đang trong tiến trình nâng cấp. Không thể bắt đầu lượt nâng cấp thứ hai.',
    };
  }

  if (factory.currentLevel >= 4) {
    return {
      canUpgrade: false,
      reason: 'Nhà máy đã đạt cấp tối đa (Cấp IV). Không thể nâng cấp thêm.',
    };
  }

  const nextLevel = (factory.currentLevel + 1) as FactoryLevel;
  return {
    canUpgrade: true,
    nextLevel,
  };
}

/**
 * Khởi tạo một nhà máy mới ở trạng thái 'building'
 */
export function createNewFactoryInstance(
  countryId: string,
  provinceId: string,
  type: FactoryType,
  currentDate: { day: number; month: number; year: number }
): FactoryInstance {
  const spec = getFactorySpec(type, 1);

  return {
    id: `fac_${type}_${provinceId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    countryId,
    provinceId,
    type,
    currentLevel: 1,
    status: 'building',
    startDay: currentDate.day,
    startMonth: currentDate.month,
    startYear: currentDate.year,
    totalDurationDays: spec.buildTimeDays,
    daysElapsed: 0,
    dailyOutput: spec.dailyOutput,
    outputUnit: spec.outputUnit,
    dailyMaintenanceUSD: spec.dailyMaintenanceUSD,
    constructionCostUSD: spec.buildCostUSD,
    upgradeHistory: [],
  };
}

/**
 * Bắt đầu quá trình nâng cấp cho một nhà máy hiện có
 */
export function startFactoryUpgrade(
  factory: FactoryInstance,
  currentDate: { day: number; month: number; year: number }
): FactoryInstance {
  const check = checkCanUpgradeFactory(factory);
  if (!check.canUpgrade || !check.nextLevel) {
    throw new Error(check.reason || 'Không đủ điều kiện nâng cấp.');
  }

  const targetLevel = check.nextLevel;
  const targetSpec = getFactorySpec(factory.type, targetLevel);

  return {
    ...factory,
    status: 'upgrading',
    targetLevel,
    startDay: currentDate.day,
    startMonth: currentDate.month,
    startYear: currentDate.year,
    totalDurationDays: targetSpec.buildTimeDays,
    daysElapsed: 0,
  };
}
