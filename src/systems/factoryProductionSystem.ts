/**
 * WORLD LEADER - Giai đoạn 4: Factory Production & Maintenance System
 * Tính toán tổng sản lượng hàng ngày và chi phí duy trì hàng ngày của một quốc gia.
 * Chỉ tính các nhà máy đã hoàn thành và đang hoạt động ('operating').
 * Nhà máy đang xây dựng hoặc đang nâng cấp KHÔNG được tính sản lượng và chi phí duy trì.
 */

import { CountryFactorySummary, FactoryInstance } from '../types/factory';

/**
 * Tính toán tổng sản lượng và chi phí duy trì mỗi ngày cho một quốc gia
 */
export function calculateCountryFactorySummary(
  factories: FactoryInstance[],
  countryId: string
): CountryFactorySummary {
  const countryFactories = factories.filter((f) => f.countryId === countryId);

  let oilOutput = 0;
  let foodOutput = 0;
  let uraniumOutput = 0;
  let totalMaintenanceUSD = 0;

  let operatingFactoriesCount = 0;
  let buildingFactoriesCount = 0;
  let upgradingFactoriesCount = 0;

  for (const fac of countryFactories) {
    if (fac.status === 'building') {
      buildingFactoriesCount++;
      continue; // Đang xây dựng: Không cộng sản lượng, không tính chi phí duy trì
    }

    if (fac.status === 'upgrading') {
      upgradingFactoriesCount++;
      continue; // Đang nâng cấp: Theo quy định Mục IX.2, không tính sản lượng và chi phí duy trì
    }

    if (fac.status === 'operating') {
      operatingFactoriesCount++;

      // Cộng dồn chi phí duy trì
      totalMaintenanceUSD += fac.dailyMaintenanceUSD;

      // Cộng dồn sản lượng theo loại
      if (fac.type === 'oil') {
        oilOutput += fac.dailyOutput;
      } else if (fac.type === 'food') {
        foodOutput += fac.dailyOutput;
      } else if (fac.type === 'uranium') {
        uraniumOutput += fac.dailyOutput;
      }
    }
  }

  return {
    oilOutput,
    foodOutput,
    uraniumOutput,
    totalMaintenanceUSD,
    operatingFactoriesCount,
    buildingFactoriesCount,
    upgradingFactoriesCount,
  };
}

/**
 * Hàm kiểm tra xác minh đối chiếu với kịch bản bắt buộc tại Mục VIII:
 * Ví dụ gồm:
 * - 2 nhà máy dầu cấp I (50 thùng/ngày, 250 USD duy trì)
 * - 1 nhà máy dầu cấp III (180 thùng/ngày, 650 USD duy trì)
 * - 2 nhà máy lương thực cấp II (250 tấn/ngày, 250 USD duy trì)
 * - 1 nhà máy uranium (20 kg/ngày, 1.500 USD duy trì)
 * Kết quả bắt buộc:
 * - Dầu: 280 thùng/ngày
 * - Lương thực: 500 tấn/ngày
 * - Uranium: 20 kg/ngày
 * - Tổng chi phí duy trì: 3.150 USD/ngày
 */
export function verifyStandardExampleCalculation(): {
  oilMatch: boolean;
  foodMatch: boolean;
  uraniumMatch: boolean;
  maintenanceMatch: boolean;
  summary: CountryFactorySummary;
} {
  const mockFactories: FactoryInstance[] = [
    // 2 dầu cấp I
    {
      id: 'mock_oil_1',
      countryId: 'test',
      provinceId: 'p1',
      type: 'oil',
      currentLevel: 1,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 30,
      daysElapsed: 30,
      dailyOutput: 50,
      outputUnit: 'thùng/ngày',
      dailyMaintenanceUSD: 250,
      constructionCostUSD: 150000,
      upgradeHistory: [],
    },
    {
      id: 'mock_oil_2',
      countryId: 'test',
      provinceId: 'p2',
      type: 'oil',
      currentLevel: 1,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 30,
      daysElapsed: 30,
      dailyOutput: 50,
      outputUnit: 'thùng/ngày',
      dailyMaintenanceUSD: 250,
      constructionCostUSD: 150000,
      upgradeHistory: [],
    },
    // 1 dầu cấp III
    {
      id: 'mock_oil_3',
      countryId: 'test',
      provinceId: 'p3',
      type: 'oil',
      currentLevel: 3,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 30,
      daysElapsed: 30,
      dailyOutput: 180,
      outputUnit: 'thùng/ngày',
      dailyMaintenanceUSD: 650,
      constructionCostUSD: 180000,
      upgradeHistory: [],
    },
    // 2 lương thực cấp II
    {
      id: 'mock_food_1',
      countryId: 'test',
      provinceId: 'p4',
      type: 'food',
      currentLevel: 2,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 15,
      daysElapsed: 15,
      dailyOutput: 250,
      outputUnit: 'tấn/ngày',
      dailyMaintenanceUSD: 250,
      constructionCostUSD: 50000,
      upgradeHistory: [],
    },
    {
      id: 'mock_food_2',
      countryId: 'test',
      provinceId: 'p5',
      type: 'food',
      currentLevel: 2,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 15,
      daysElapsed: 15,
      dailyOutput: 250,
      outputUnit: 'tấn/ngày',
      dailyMaintenanceUSD: 250,
      constructionCostUSD: 50000,
      upgradeHistory: [],
    },
    // 1 uranium
    {
      id: 'mock_uranium_1',
      countryId: 'test',
      provinceId: 'p6',
      type: 'uranium',
      currentLevel: 1,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 60,
      daysElapsed: 60,
      dailyOutput: 20,
      outputUnit: 'kg/ngày',
      dailyMaintenanceUSD: 1500,
      constructionCostUSD: 500000,
      upgradeHistory: [],
    },
  ];

  const summary = calculateCountryFactorySummary(mockFactories, 'test');

  return {
    oilMatch: summary.oilOutput === 280,
    foodMatch: summary.foodOutput === 500,
    uraniumMatch: summary.uraniumOutput === 20,
    maintenanceMatch: summary.totalMaintenanceUSD === 3150,
    summary,
  };
}
