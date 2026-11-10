/**
 * WORLD LEADER - Giai đoạn 4: Bảng Chi phí, Thời gian và Sản lượng chính thức
 * Tuyệt đối không tự ý thay đổi các thông số đã được phê duyệt.
 */

import { FactoryLevel, FactorySpec, FactoryType } from '../types/factory';

// Thông số kỹ thuật chính thức cho Nhà máy dầu
export const OIL_FACTORY_SPECS: Record<FactoryLevel, FactorySpec> = {
  1: {
    type: 'oil',
    level: 1,
    name: 'Nhà máy dầu Cấp I',
    buildCostUSD: 150000,
    dailyMaintenanceUSD: 250,
    buildTimeDays: 30,
    dailyOutput: 50,
    outputUnit: 'thùng/ngày',
  },
  2: {
    type: 'oil',
    level: 2,
    name: 'Nhà máy dầu Cấp II',
    buildCostUSD: 100000,
    dailyMaintenanceUSD: 400,
    buildTimeDays: 20,
    dailyOutput: 100,
    outputUnit: 'thùng/ngày',
  },
  3: {
    type: 'oil',
    level: 3,
    name: 'Nhà máy dầu Cấp III',
    buildCostUSD: 180000,
    dailyMaintenanceUSD: 650,
    buildTimeDays: 30,
    dailyOutput: 180,
    outputUnit: 'thùng/ngày',
  },
  4: {
    type: 'oil',
    level: 4,
    name: 'Nhà máy dầu Cấp IV',
    buildCostUSD: 300000,
    dailyMaintenanceUSD: 1000,
    buildTimeDays: 45,
    dailyOutput: 300,
    outputUnit: 'thùng/ngày',
  },
};

// Thông số kỹ thuật chính thức cho Nhà máy lương thực
export const FOOD_FACTORY_SPECS: Record<FactoryLevel, FactorySpec> = {
  1: {
    type: 'food',
    level: 1,
    name: 'Nhà máy lương thực Cấp I',
    buildCostUSD: 80000,
    dailyMaintenanceUSD: 150,
    buildTimeDays: 20,
    dailyOutput: 100,
    outputUnit: 'tấn/ngày',
  },
  2: {
    type: 'food',
    level: 2,
    name: 'Nhà máy lương thực Cấp II',
    buildCostUSD: 50000,
    dailyMaintenanceUSD: 250,
    buildTimeDays: 15,
    dailyOutput: 250,
    outputUnit: 'tấn/ngày',
  },
  3: {
    type: 'food',
    level: 3,
    name: 'Nhà máy lương thực Cấp III',
    buildCostUSD: 90000,
    dailyMaintenanceUSD: 400,
    buildTimeDays: 25,
    dailyOutput: 500,
    outputUnit: 'tấn/ngày',
  },
  4: {
    type: 'food',
    level: 4,
    name: 'Nhà máy lương thực Cấp IV',
    buildCostUSD: 150000,
    dailyMaintenanceUSD: 650,
    buildTimeDays: 35,
    dailyOutput: 900,
    outputUnit: 'tấn/ngày',
  },
};

// Thông số kỹ thuật chính thức cho Nhà máy uranium (Chỉ có 1 cấp, không nâng cấp)
export const URANIUM_FACTORY_SPEC: FactorySpec = {
  type: 'uranium',
  level: 1,
  name: 'Nhà máy tinh chế Uranium',
  buildCostUSD: 500000,
  dailyMaintenanceUSD: 1500,
  buildTimeDays: 60,
  dailyOutput: 20,
  outputUnit: 'kg/ngày',
};

/**
 * Lấy thông số kỹ thuật cho một loại nhà máy và cấp độ
 */
export function getFactorySpec(type: FactoryType, level: FactoryLevel = 1): FactorySpec {
  if (type === 'oil') return OIL_FACTORY_SPECS[level];
  if (type === 'food') return FOOD_FACTORY_SPECS[level];
  if (type === 'uranium') return URANIUM_FACTORY_SPEC;
  throw new Error(`Loại nhà máy không hợp lệ: ${type}`);
}
