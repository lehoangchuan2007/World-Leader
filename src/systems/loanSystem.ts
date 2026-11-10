/**
 * WORLD LEADER - Giai đoạn 3: Hệ thống Ngân hàng Quốc tế và Khoản vay (Loan System)
 * Quản lý vay và cho vay giữa các quốc gia, chỉ hỗ trợ kỳ hạn 180, 270, 365 ngày.
 * Thanh toán toàn bộ gốc + lãi một lần khi đến hạn.
 * Xử lý nợ quá hạn và chuẩn bị cấu trúc tích hợp G9.
 */

import {
  BankPartnerCandidate,
  CountryEconomy,
  LoanContract,
  LoanTermDays,
} from '../types/economy';
import { GameDate } from '../types/game';

// Kỳ hạn vay hợp lệ duy nhất của G3
export const VALID_LOAN_TERMS: readonly LoanTermDays[] = [180, 270, 365] as const;

/**
 * Tính ngày đáo hạn dựa trên ngày bắt đầu và số ngày vay (180, 270 hoặc 365 ngày)
 */
export function calculateDueDate(startDate: GameDate, termDays: LoanTermDays): GameDate {
  // Giả lập bước nhảy ngày lịch chuẩn
  const tempDate = new Date(startDate.year, startDate.month - 1, startDate.day);
  tempDate.setDate(tempDate.getDate() + termDays);

  return {
    day: tempDate.getDate(),
    month: tempDate.getMonth() + 1,
    year: tempDate.getFullYear(),
  };
}

/**
 * Kiểm tra xem ngày hiện tại đã đến hoặc qua ngày đáo hạn chưa
 */
export function isLoanMatured(currentDate: GameDate, dueDate: GameDate): boolean {
  if (currentDate.year > dueDate.year) return true;
  if (currentDate.year === dueDate.year) {
    if (currentDate.month > dueDate.month) return true;
    if (currentDate.month === dueDate.month) {
      return currentDate.day >= dueDate.day;
    }
  }
  return false;
}

/**
 * Tính tiền lãi và tổng nghĩa vụ thanh toán theo chuẩn tài chính ngân hàng quốc tế:
 * Lãi suất tính theo tỷ lệ năm (%/năm), phân bổ theo số ngày vay thực tế:
 * Interest = Principal × (annualRate / 100) × (termDays / 365)
 * Total Obligation = Principal + Interest
 */
export function calculateLoanObligation(
  principalUSD: number,
  annualInterestRate: number,
  termDays: LoanTermDays
): {
  interestAmountUSD: number;
  totalObligationUSD: number;
} {
  const interestAmountUSD = Math.round(
    principalUSD * (annualInterestRate / 100) * (termDays / 365)
  );
  const totalObligationUSD = principalUSD + interestAmountUSD;

  return {
    interestAmountUSD,
    totalObligationUSD,
  };
}

/**
 * Đánh giá xếp hạng tín nhiệm và đề xuất lãi suất dựa trên tình hình tài chính
 */
export function evaluateCreditRatingAndRate(
  treasury: number,
  monthlyTax: number,
  existingDebt: number
): {
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  recommendedInterestRate: number;
} {
  const debtToMonthlyIncomeRatio = monthlyTax > 0 ? existingDebt / monthlyTax : 10;
  const reserveRatio = monthlyTax > 0 ? treasury / monthlyTax : 0;

  if (reserveRatio >= 1.5 && debtToMonthlyIncomeRatio < 0.5) {
    return { creditRating: 'AAA', recommendedInterestRate: 5.5 };
  }
  if (reserveRatio >= 1.0 && debtToMonthlyIncomeRatio < 1.0) {
    return { creditRating: 'AA', recommendedInterestRate: 6.5 };
  }
  if (reserveRatio >= 0.7 && debtToMonthlyIncomeRatio < 1.5) {
    return { creditRating: 'A', recommendedInterestRate: 7.5 };
  }
  if (reserveRatio >= 0.4 && debtToMonthlyIncomeRatio < 2.5) {
    return { creditRating: 'BBB', recommendedInterestRate: 9.0 };
  }
  if (reserveRatio >= 0.2 && debtToMonthlyIncomeRatio < 4.0) {
    return { creditRating: 'BB', recommendedInterestRate: 11.5 };
  }
  if (reserveRatio >= 0.1) {
    return { creditRating: 'B', recommendedInterestRate: 14.0 };
  }
  return { creditRating: 'CCC', recommendedInterestRate: 18.0 };
}

/**
 * Lọc danh sách tối đa 20 đối tác cho vay (quốc gia có ngân sách dồi dào có thể cho người chơi vay)
 */
export function getTopLenderPartners(
  allEconomies: Record<string, CountryEconomy>,
  excludeCountryId: string,
  contracts: LoanContract[]
): BankPartnerCandidate[] {
  const candidates: BankPartnerCandidate[] = [];

  for (const [cId, eco] of Object.entries(allEconomies)) {
    if (cId === excludeCountryId) continue;

    // Tính tổng nợ hiện tại
    const existingDebt = contracts
      .filter((c) => c.borrowerCountryId === cId && c.status === 'active')
      .reduce((sum, c) => sum + c.totalObligationUSD, 0);

    const { creditRating, recommendedInterestRate } = evaluateCreditRatingAndRate(
      eco.treasury,
      eco.monthlyTaxGross,
      existingDebt
    );

    // Quốc gia có thể cho vay tối đa 40% số dư ngân sách khả dụng của họ
    const maxLendAmount = Math.max(0, Math.floor(eco.treasury * 0.4));
    const maxBorrowAmount = Math.max(0, Math.floor(eco.monthlyTaxGross * 3));

    // Chỉ chọn những quốc gia có khả năng giải ngân tối thiểu 500.000 USD
    if (maxLendAmount >= 500000) {
      candidates.push({
        countryId: cId,
        countryName: eco.countryName,
        treasury: eco.treasury,
        population: eco.population,
        monthlyTaxGross: eco.monthlyTaxGross,
        existingDebtObligation: existingDebt,
        creditRating,
        recommendedInterestRate,
        maxLendAmount,
        maxBorrowAmount,
      });
    }
  }

  // Sắp xếp theo số dư ngân sách cao nhất và lấy tối đa 20 quốc gia
  return candidates
    .sort((a, b) => b.treasury - a.treasury)
    .slice(0, 20);
}

/**
 * Lọc danh sách tối đa 20 đối tác cần vay (quốc gia có nhu cầu vay vốn từ người chơi)
 */
export function getTopBorrowerPartners(
  allEconomies: Record<string, CountryEconomy>,
  excludeCountryId: string,
  contracts: LoanContract[]
): BankPartnerCandidate[] {
  const candidates: BankPartnerCandidate[] = [];

  for (const [cId, eco] of Object.entries(allEconomies)) {
    if (cId === excludeCountryId) continue;

    const existingDebt = contracts
      .filter((c) => c.borrowerCountryId === cId && c.status === 'active')
      .reduce((sum, c) => sum + c.totalObligationUSD, 0);

    const { creditRating, recommendedInterestRate } = evaluateCreditRatingAndRate(
      eco.treasury,
      eco.monthlyTaxGross,
      existingDebt
    );

    const maxLendAmount = Math.max(0, Math.floor(eco.treasury * 0.4));
    // Hạn mức có thể vay tối đa bằng 3 tháng doanh thu thuế trừ đi số nợ hiện có
    const maxBorrowAmount = Math.max(0, Math.floor(eco.monthlyTaxGross * 3 - existingDebt));

    // Nhu cầu vay: quốc gia có nhu cầu vay vốn
    if (maxBorrowAmount >= 500000) {
      candidates.push({
        countryId: cId,
        countryName: eco.countryName,
        treasury: eco.treasury,
        population: eco.population,
        monthlyTaxGross: eco.monthlyTaxGross,
        existingDebtObligation: existingDebt,
        creditRating,
        recommendedInterestRate,
        maxLendAmount,
        maxBorrowAmount,
      });
    }
  }

  // Sắp xếp theo uy tín tín nhiệm và nhu cầu vay, lấy tối đa 20 quốc gia
  return candidates
    .sort((a, b) => b.maxBorrowAmount - a.maxBorrowAmount)
    .slice(0, 20);
}

/**
 * Giải ngân một hợp đồng vay mới
 * - Trừ tiền bên cho vay
 * - Cộng tiền bên đi vay
 * - Tuyệt đối không tạo tiền từ hư không
 */
export function disburseNewLoan(
  lenderEconomy: CountryEconomy,
  borrowerEconomy: CountryEconomy,
  principalUSD: number,
  annualInterestRate: number,
  termDays: LoanTermDays,
  currentDate: GameDate
): {
  success: boolean;
  message: string;
  contract?: LoanContract;
  updatedLenderTreasury?: number;
  updatedBorrowerTreasury?: number;
} {
  // 1. Kiểm tra giới hạn ngân sách thực tế của bên cho vay
  if (lenderEconomy.treasury < principalUSD) {
    return {
      success: false,
      message: `Bên cho vay (${lenderEconomy.countryName}) không đủ ngân sách khả dụng để giải ngân số tiền ${principalUSD.toLocaleString('vi-VN')} USD.`,
    };
  }

  // 2. Kiểm tra kỳ hạn
  if (!VALID_LOAN_TERMS.includes(termDays)) {
    return {
      success: false,
      message: 'Kỳ hạn vay không hợp lệ. Chỉ chấp nhận các kỳ hạn 180, 270 hoặc 365 ngày.',
    };
  }

  const dueDate = calculateDueDate(currentDate, termDays);
  const { interestAmountUSD, totalObligationUSD } = calculateLoanObligation(
    principalUSD,
    annualInterestRate,
    termDays
  );

  const contract: LoanContract = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    lenderCountryId: lenderEconomy.countryId,
    lenderCountryName: lenderEconomy.countryName,
    borrowerCountryId: borrowerEconomy.countryId,
    borrowerCountryName: borrowerEconomy.countryName,
    principalUSD,
    annualInterestRate,
    termDays,
    startDate: currentDate,
    dueDate,
    interestAmountUSD,
    totalObligationUSD,
    status: 'active',
    createdAt: currentDate,
    history: [
      {
        date: currentDate,
        action: 'Giải ngân thành công',
        details: `Giải ngân gốc ${principalUSD.toLocaleString('vi-VN')} USD với lãi suất ${annualInterestRate}%/năm trong ${termDays} ngày. Tổng nghĩa vụ khi đáo hạn: ${totalObligationUSD.toLocaleString('vi-VN')} USD.`,
      },
    ],
  };

  return {
    success: true,
    message: `Đã giải ngân thành công khoản vay ${principalUSD.toLocaleString('vi-VN')} USD.`,
    contract,
    updatedLenderTreasury: lenderEconomy.treasury - principalUSD,
    updatedBorrowerTreasury: borrowerEconomy.treasury + principalUSD,
  };
}

/**
 * Xử lý khi khoản vay đến hạn (Maturity Check)
 * - Nếu bên vay đủ tiền: trừ tiền bên vay, cộng tiền bên cho vay, trạng thái 'repaid'
 * - Nếu bên vay không đủ tiền: chuyển trạng thái 'defaulted', ghi nhận nợ xấu
 */
export function processLoanMaturity(
  contract: LoanContract,
  borrowerTreasury: number,
  lenderTreasury: number,
  currentDate: GameDate
): {
  repaid: boolean;
  updatedContract: LoanContract;
  updatedBorrowerTreasury: number;
  updatedLenderTreasury: number;
  message: string;
} {
  const obligation = contract.totalObligationUSD;

  if (borrowerTreasury >= obligation) {
    // Thanh toán thành công một lần toàn bộ gốc + lãi
    return {
      repaid: true,
      updatedBorrowerTreasury: borrowerTreasury - obligation,
      updatedLenderTreasury: lenderTreasury + obligation,
      updatedContract: {
        ...contract,
        status: 'repaid',
        settledAt: currentDate,
        history: [
          ...contract.history,
          {
            date: currentDate,
            action: 'Tất toán khi đáo hạn',
            details: `Bên vay (${contract.borrowerCountryName}) đã thanh toán đầy đủ ${obligation.toLocaleString('vi-VN')} USD (Gốc: ${contract.principalUSD.toLocaleString('vi-VN')} USD + Lãi: ${contract.interestAmountUSD.toLocaleString('vi-VN')} USD) cho bên cho vay (${contract.lenderCountryName}).`,
          },
        ],
      },
      message: `Hợp đồng vay của ${contract.borrowerCountryName} đã được tất toán đầy đủ.`,
    };
  }

  // Không đủ tiền thanh toán khi đến hạn -> Chuyển sang vỡ nợ (defaulted)
  return {
    repaid: false,
    updatedBorrowerTreasury: borrowerTreasury,
    updatedLenderTreasury: lenderTreasury,
    updatedContract: {
      ...contract,
      status: 'defaulted',
      settledAt: currentDate,
      history: [
        ...contract.history,
        {
          date: currentDate,
          action: 'Quá hạn thanh toán (Vỡ nợ)',
          details: `Bên vay (${contract.borrowerCountryName}) không đủ số dư ngân sách (${borrowerTreasury.toLocaleString('vi-VN')} USD < ${obligation.toLocaleString('vi-VN')} USD) để thanh toán nghĩa vụ nợ. Chuyển sang cơ chế thu hồi tài nguyên (kết nối G9).`,
        },
      ],
    },
    message: `Khoản vay của ${contract.borrowerCountryName} đã quá hạn và không thể thanh toán đầy đủ.`,
  };
}

/**
 * Logic AI tự động vay và cho vay giữa các quốc gia AI
 * - Tuyệt đối không can thiệp vào ngân sách của người chơi
 */
export function runAiLoanCycle(
  allEconomies: Record<string, CountryEconomy>,
  playerCountryId: string | null,
  activeContracts: LoanContract[],
  currentDate: GameDate
): {
  updatedEconomies: Record<string, CountryEconomy>;
  newContracts: LoanContract[];
} {
  const updatedEconomies = { ...allEconomies };
  const newContracts: LoanContract[] = [];

  const aiCountryIds = Object.keys(updatedEconomies).filter(
    (id) => id !== playerCountryId
  );

  if (aiCountryIds.length < 2) {
    return { updatedEconomies, newContracts };
  }

  // Chọn ngẫu nhiên một quốc gia AI có ngân sách rất lớn (Lender)
  const potentialLenders = aiCountryIds.filter(
    (id) => updatedEconomies[id].treasury >= 50000000 // Có ít nhất 50 triệu USD
  );

  // Chọn ngẫu nhiên một quốc gia AI có ngân sách eo hẹp (Borrower)
  const potentialBorrowers = aiCountryIds.filter(
    (id) =>
      updatedEconomies[id].treasury < 15000000 && // Dưới 15 triệu USD
      updatedEconomies[id].monthlyTaxGross > 1000000 // Nhưng có nguồn thu thuế để đảm bảo
  );

  if (potentialLenders.length > 0 && potentialBorrowers.length > 0) {
    const lenderId = potentialLenders[Math.floor(Math.random() * potentialLenders.length)];
    const borrowerId = potentialBorrowers[Math.floor(Math.random() * potentialBorrowers.length)];

    if (lenderId !== borrowerId) {
      const lender = updatedEconomies[lenderId];
      const borrower = updatedEconomies[borrowerId];

      // Khoản vay hợp lý: khoảng 1 tháng thuế của bên vay
      const loanAmount = Math.min(
        Math.floor(lender.treasury * 0.15),
        Math.floor(borrower.monthlyTaxGross)
      );

      if (loanAmount >= 1000000) {
        const terms: LoanTermDays[] = [180, 270, 365];
        const term = terms[Math.floor(Math.random() * terms.length)];
        const rate = 8.5; // Lãi suất thị trường chuẩn

        const res = disburseNewLoan(
          lender,
          borrower,
          loanAmount,
          rate,
          term,
          currentDate
        );

        if (res.success && res.contract && res.updatedLenderTreasury !== undefined && res.updatedBorrowerTreasury !== undefined) {
          updatedEconomies[lenderId] = {
            ...lender,
            treasury: res.updatedLenderTreasury,
          };
          updatedEconomies[borrowerId] = {
            ...borrower,
            treasury: res.updatedBorrowerTreasury,
          };
          newContracts.push(res.contract);
        }
      }
    }
  }

  return { updatedEconomies, newContracts };
}
