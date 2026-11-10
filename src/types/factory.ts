/**
 * WORLD LEADER - Giai đoạn 4: Hệ thống Nhà máy (Factory System)
 * Type definitions for GĐ4
 */

export type FactoryType = 'oil' | 'food' | 'uranium';

export type FactoryLevel = 1 | 2 | 3 | 4;

export type FactoryStatus =
  | 'building'    // Đang xây dựng
  | 'upgrading'   // Đang nâng cấp
  | 'operating';  // Đang hoạt động

export interface FactorySpec {
  type: FactoryType;
  level: FactoryLevel;
  name: string;
  buildCostUSD: number;       // Chi phí xây mới (cấp 1) hoặc nâng cấp (từ cấp trước)
  dailyMaintenanceUSD: number;// Chi phí duy trì (USD/ngày)
  buildTimeDays: number;      // Thời gian xây dựng/nâng cấp (ngày game)
  dailyOutput: number;        // Sản lượng (thùng/ngày, tấn/ngày, hoặc kg/ngày)
  outputUnit: string;         // 'thùng/ngày' | 'tấn/ngày' | 'kg/ngày'
}

// Dữ liệu mỏ Uranium theo cơ sở địa chất 2026 (IAEA, WNA, USGS)
export interface UraniumDeposit {
  countryId: string;
  countryName: string;
  provinceId: string;
  provinceName: string;
  depositName?: string;
  status?: 'active' | 'inactive' | 'unexploited' | 'depleted' | 'explored';
  source: string;              // Nguồn dữ liệu (IAEA, WNA, USGS, v.v.)
  isVerified: boolean;         // Trạng thái xác minh dữ liệu
  notes?: string;
}

// Đơn vị hành chính cấp TỈNH (Province)
export interface Province {
  id: string;                  // ID ổn định (vd: 'vn_hn', 'vn_qn', 'us_tx')
  name: string;                // Tên tỉnh (vd: 'Hà Nội', 'Quảng Nam', 'Texas')
  countryId: string;           // ID quốc gia sở hữu
  countryName: string;         // Tên quốc gia
  hasUraniumDeposit: boolean;  // Tỉnh có mỏ uranium hay không
  uraniumDepositInfo?: UraniumDeposit;
}

// Đối tượng nhà máy cụ thể được xây dựng tại một tỉnh
export interface FactoryInstance {
  id: string;
  countryId: string;
  provinceId: string;
  type: FactoryType;
  currentLevel: FactoryLevel;
  targetLevel?: FactoryLevel;   // Cấp độ đang hướng tới nếu đang nâng cấp
  status: FactoryStatus;
  
  // Thời gian theo ngày game
  startDay: number;
  startMonth: number;
  startYear: number;
  totalDurationDays: number;
  daysElapsed: number;          // Số ngày đã xây dựng/nâng cấp
  completedDate?: { day: number; month: number; year: number };

  // Thông số sản lượng và chi phí áp dụng hiện tại (chỉ áp dụng khi 'operating')
  dailyOutput: number;
  outputUnit: string;
  dailyMaintenanceUSD: number;
  
  // Chi phí xây dựng/nâng cấp ban đầu
  constructionCostUSD: number;

  // Lịch sử nâng cấp
  upgradeHistory: {
    fromLevel: FactoryLevel;
    toLevel: FactoryLevel;
    costUSD: number;
    completionDate: { day: number; month: number; year: number };
  }[];
}

// Bản ghi chi phí phát sinh
export interface FactoryCostRecord {
  id: string;
  countryId: string;
  provinceId: string;
  factoryType: FactoryType;
  level: FactoryLevel;
  costType: 'construction' | 'upgrade' | 'maintenance';
  amountUSD: number;
  gameDate: { day: number; month: number; year: number };
}

// Bản ghi sản lượng phát sinh
export interface FactoryProductionRecord {
  id: string;
  countryId: string;
  provinceId: string;
  factoryType: FactoryType;
  level: FactoryLevel;
  output: number;
  unit: string;
  gameDate: { day: number; month: number; year: number };
}

// Tổng sản lượng hàng ngày của một quốc gia
export interface CountryFactorySummary {
  oilOutput: number;         // Thùng/ngày
  foodOutput: number;        // Tấn/ngày
  uraniumOutput: number;     // Kg/ngày
  totalMaintenanceUSD: number;// USD/ngày
  operatingFactoriesCount: number;
  buildingFactoriesCount: number;
  upgradingFactoriesCount: number;
}
