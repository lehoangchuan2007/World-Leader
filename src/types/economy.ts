/**
 * WORLD LEADER - Giai đoạn 3: Hệ thống Kinh tế và Ngân sách Quốc gia
 * Type definitions for G3: Economy, Taxation, Budget, Migration, and International Loans
 */

import { GameDate } from './game';

// Kỳ hạn vay cố định: chỉ hỗ trợ 180, 270, 365 ngày
export type LoanTermDays = 180 | 270 | 365;

// Trạng thái của hợp đồng vay
export type LoanContractStatus =
  | 'active'            // Đang có hiệu lực, chờ đến ngày đáo hạn
  | 'repaid'            // Đã thanh toán đầy đủ gốc và lãi
  | 'defaulted'         // Không đủ tiền khi đến hạn (vỡ nợ)
  | 'settled_resources';// Đã xử lý thu hồi tài nguyên (kết nối G9)

// Hợp đồng vay vốn quốc tế
export interface LoanContract {
  id: string;
  lenderCountryId: string;
  lenderCountryName: string;
  borrowerCountryId: string;
  borrowerCountryName: string;
  principalUSD: number;         // Tiền gốc
  annualInterestRate: number;   // Lãi suất (%/năm, ví dụ 8 = 8%/năm)
  termDays: LoanTermDays;       // 180 | 270 | 365 ngày
  startDate: GameDate;          // Ngày giải ngân
  dueDate: GameDate;            // Ngày đáo hạn
  interestAmountUSD: number;    // Tiền lãi phải trả
  totalObligationUSD: number;   // Tổng nghĩa vụ thanh toán = Gốc + Lãi
  status: LoanContractStatus;
  createdAt: GameDate;
  settledAt?: GameDate;
  notes?: string;
  history: {
    date: GameDate;
    action: string;
    details: string;
  }[];
}

// Nhật ký giao dịch thu chi ngân sách
export interface BudgetTransaction {
  id: string;
  countryId: string;
  date: GameDate;
  type:
    | 'tax_income'               // Thu thuế hàng ngày
    | 'factory_maintenance'      // Chi phí vận hành nhà máy hàng ngày (G4)
    | 'loan_disbursement_out'    // Cho nước khác vay (chi tiền gốc)
    | 'loan_disbursement_in'     // Nhận giải ngân khoản vay (thu tiền gốc)
    | 'loan_repayment_out'       // Trả nợ khi đến hạn (chi gốc + lãi)
    | 'loan_repayment_in'        // Nhận thanh toán nợ đến hạn (thu gốc + lãi)
    | 'debt_default_loss'        // Xóa nợ không thu hồi được
    | 'resource_seizure_settle'; // Thu hồi tài nguyên nợ quá hạn
  category: 'income' | 'expense';
  amountUSD: number;
  balanceAfterUSD: number;
  description: string;
}

// Báo cáo quyết toán tháng
export interface MonthlyBudgetReport {
  month: number;
  year: number;
  openingBalanceUSD: number;
  closingBalanceUSD: number;
  totalIncomeUSD: number;
  totalExpenseUSD: number;
  netCashFlowUSD: number;
  taxRevenueUSD: number;
  factoryMaintenanceUSD: number;
  populationStart: number;
  populationEnd: number;
  migratedPopulation: number;
}

// Dữ liệu kinh tế của một quốc gia
export interface CountryEconomy {
  countryId: string;
  countryName: string;
  population: number;                 // Dân số hiện đại
  basePopulation: number;             // Dân số gốc ban đầu
  taxRate: number;                    // Mức thuế USD/người/tháng (0 - 10, bước 0.1)
  treasury: number;                   // Số dư ngân sách hiện tại (USD)
  initialTreasury: number;            // Ngân sách khởi đầu = 40% Monthly Tax
  consecutiveHighTaxMonths: number;   // Số tháng liên tục duy trì thuế > 3 USD/người (m)
  currentMonthMigrationRate: number;  // Tỷ lệ di cư tháng hiện tại (r: 0 - 1%)
  totalMigratedPopulation: number;    // Tổng số người đã di cư vĩnh viễn
  monthlyTaxGross: number;            // Thuế tháng theo công thức gốc (dân số × mức thuế)
  dailyTaxNet: number;                // Thuế thực thu mỗi ngày (đã tính hiệu suất Bộ trưởng Tài chính)
  dailyFactoryMaintenance: number;    // Chi phí duy trì nhà máy mỗi ngày (G4)
  dailyNetCashFlow: number;           // Dòng tiền ròng mỗi ngày (Thuế net - Bảo trì nhà máy)
  lastDayProcessed?: GameDate;        // Ngày gần nhất đã xử lý thu thuế và trừ chi phí
}

// Đối tác tiềm năng trong thị trường vốn
export interface BankPartnerCandidate {
  countryId: string;
  countryName: string;
  treasury: number;
  population: number;
  monthlyTaxGross: number;
  existingDebtObligation: number;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  recommendedInterestRate: number;
  maxLendAmount: number;
  maxBorrowAmount: number;
}
