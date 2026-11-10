/**
 * WORLD LEADER - Giai đoạn 3: Trang Quản Lý Kinh Tế & Ngân Sách Quốc Gia (Economy Page)
 * Tích hợp:
 * 1. Hệ thống thuế (0-10 USD/người/tháng, thu hằng ngày, ảnh hưởng bởi Bộ trưởng Tài chính)
 * 2. Ngân sách quốc gia & Sổ kế toán thu chi
 * 3. Dân số & Di cư (ngưỡng 3 USD/người/tháng)
 * 4. Ngân hàng quốc tế & Khoản vay (180, 270, 365 ngày, trả 1 lần khi đáo hạn)
 * 5. Cơ chế xử lý nợ quá hạn sẵn sàng kết nối G9
 */

import React, { useState, useMemo } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Landmark,
  Scale,
  HandCoins,
  Receipt,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  BankPartnerCandidate,
  BudgetTransaction,
  CountryEconomy,
  LoanContract,
  LoanTermDays,
} from '../types/economy';
import { PlayerCountry, SelectedCountry, GameDate } from '../types/game';
import { CountryPoliticalData } from '../types/politics';
import {
  calculateDailyTaxCollection,
  calculateFinanceMinisterTaxEfficiency,
  calculateMonthlyGrossTax,
  calculateMonthlyMigrationRate,
  MIGRATION_TAX_THRESHOLD,
  TAX_RATE_STEP,
  MIN_TAX_RATE,
  MAX_TAX_RATE,
} from '../systems/economySystem';
import {
  calculateLoanObligation,
  getTopBorrowerPartners,
  getTopLenderPartners,
  VALID_LOAN_TERMS,
} from '../systems/loanSystem';
import { formatGameDate } from '../systems/timeSystem';

interface EconomyPageProps {
  countryId: string;
  countryName: string;
  economy: CountryEconomy;
  allEconomies: Record<string, CountryEconomy>;
  politicalData?: CountryPoliticalData;
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  contracts: LoanContract[];
  transactions: BudgetTransaction[];
  currentDate: GameDate;
  onUpdateTaxRate: (newRate: number) => void;
  onSelectCountryView: (countryId: string) => void;
  onLendMoney: (borrowerId: string, principal: number, rate: number, termDays: LoanTermDays) => void;
  onBorrowMoney: (lenderId: string, principal: number, rate: number, termDays: LoanTermDays) => void;
  onBackToMap: () => void;
  availableCountries?: { id: string; name: string; nameVi: string }[];
}

export const EconomyPage: React.FC<EconomyPageProps> = ({
  countryId,
  countryName,
  economy,
  allEconomies,
  politicalData,
  playerCountry,
  contracts,
  transactions,
  currentDate,
  onUpdateTaxRate,
  onSelectCountryView,
  onLendMoney,
  onBorrowMoney,
  onBackToMap,
  availableCountries = [],
}) => {
  // Tabs trong trang Kinh tế
  const [activeTab, setActiveTab] = useState<'tax' | 'banking' | 'ledger' | 'defaults'>('tax');
  const [bankingSubTab, setBankingSubTab] = useState<'lend' | 'borrow' | 'active'>('lend');

  // Modal cho vay
  const [lendModalTarget, setLendModalTarget] = useState<BankPartnerCandidate | null>(null);
  const [lendPrincipalInput, setLendPrincipalInput] = useState<number>(5000000);
  const [lendTermInput, setLendTermInput] = useState<LoanTermDays>(180);
  const [lendRateInput, setLendRateInput] = useState<number>(8.0);

  // Modal đi vay
  const [borrowModalTarget, setBorrowModalTarget] = useState<BankPartnerCandidate | null>(null);
  const [borrowPrincipalInput, setBorrowPrincipalInput] = useState<number>(5000000);
  const [borrowTermInput, setBorrowTermInput] = useState<LoanTermDays>(180);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isPlayerCountry = playerCountry?.id === countryId;
  const canManage = isPlayerCountry || !playerCountry;

  // Hiệu suất thu thuế từ Bộ trưởng Tài chính
  const financeMinisterAbility = politicalData?.government.financeMinister?.managementAbility;
  const ministerEfficiency = useMemo(() => {
    return calculateFinanceMinisterTaxEfficiency(financeMinisterAbility);
  }, [financeMinisterAbility]);

  // Dự báo thuế tháng và thuế ngày hiện tại
  const taxForecast = useMemo(() => {
    return calculateDailyTaxCollection(
      economy.population,
      economy.taxRate,
      currentDate.month,
      currentDate.year,
      financeMinisterAbility
    );
  }, [economy.population, economy.taxRate, currentDate.month, currentDate.year, financeMinisterAbility]);

  // Tỷ lệ di cư tháng hiện tại nếu thuế > 3
  const migrationRate = useMemo(() => {
    return calculateMonthlyMigrationRate(economy.taxRate, economy.consecutiveHighTaxMonths);
  }, [economy.taxRate, economy.consecutiveHighTaxMonths]);

  // Đối tác tiềm năng cho vay và vay
  const topLenders = useMemo(() => {
    return getTopLenderPartners(allEconomies, countryId, contracts);
  }, [allEconomies, countryId, contracts]);

  const topBorrowers = useMemo(() => {
    return getTopBorrowerPartners(allEconomies, countryId, contracts);
  }, [allEconomies, countryId, contracts]);

  // Danh sách hợp đồng đang thực hiện liên quan đến quốc gia này
  const activeContractsForCountry = useMemo(() => {
    return contracts.filter(
      (c) =>
        (c.lenderCountryId === countryId || c.borrowerCountryId === countryId) &&
        c.status === 'active'
    );
  }, [contracts, countryId]);

  // Danh sách hợp đồng vỡ nợ / quá hạn
  const defaultedContractsForCountry = useMemo(() => {
    return contracts.filter(
      (c) =>
        (c.lenderCountryId === countryId || c.borrowerCountryId === countryId) &&
        (c.status === 'defaulted' || c.status === 'settled_resources')
    );
  }, [contracts, countryId]);

  // Lọc giao dịch của quốc gia này
  const countryTransactions = useMemo(() => {
    return transactions.filter((t) => t.countryId === countryId).slice(-30).reverse();
  }, [transactions, countryId]);

  // Mở modal cho vay
  const handleOpenLendModal = (partner: BankPartnerCandidate) => {
    setLendModalTarget(partner);
    setLendPrincipalInput(Math.min(partner.maxBorrowAmount, Math.floor(economy.treasury * 0.2) || 5000000));
    setLendRateInput(partner.recommendedInterestRate);
    setLendTermInput(180);
  };

  // Mở modal đi vay
  const handleOpenBorrowModal = (partner: BankPartnerCandidate) => {
    setBorrowModalTarget(partner);
    setBorrowPrincipalInput(Math.min(partner.maxLendAmount, 10000000));
    setBorrowTermInput(180);
  };

  // Thực hiện cho vay
  const handleConfirmLend = () => {
    if (!lendModalTarget) return;
    if (lendPrincipalInput > economy.treasury) {
      showToast('Ngân sách khả dụng không đủ để cho vay số tiền này!');
      return;
    }
    onLendMoney(
      lendModalTarget.countryId,
      lendPrincipalInput,
      lendRateInput,
      lendTermInput
    );
    showToast(`Đã giải ngân khoản vay ${lendPrincipalInput.toLocaleString('vi-VN')} USD cho ${lendModalTarget.countryName}!`);
    setLendModalTarget(null);
  };

  // Thực hiện đề nghị vay
  const handleConfirmBorrow = () => {
    if (!borrowModalTarget) return;
    if (borrowPrincipalInput > borrowModalTarget.maxLendAmount) {
      showToast(`Bên cho vay chỉ có khả năng cho vay tối đa ${borrowModalTarget.maxLendAmount.toLocaleString('vi-VN')} USD!`);
      return;
    }
    onBorrowMoney(
      borrowModalTarget.countryId,
      borrowPrincipalInput,
      borrowModalTarget.recommendedInterestRate,
      borrowTermInput
    );
    showToast(`Đã nhận giải ngân ${borrowPrincipalInput.toLocaleString('vi-VN')} USD từ ${borrowModalTarget.countryName}!`);
    setBorrowModalTarget(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto px-4 py-4 sm:px-8 space-y-6 select-none">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Country Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToMap}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Quay lại bản đồ</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Kinh tế & Ngân sách – {countryName}
              </h1>
              {isPlayerCountry ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Quốc gia của bạn</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  AI quản lý
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Giai đoạn 3: Hệ thống thuế hằng ngày, ngân sách quốc gia, dân số - di cư và ngân hàng khoản vay quốc tế
            </p>
          </div>
        </div>

        {/* Country Switcher */}
        {availableCountries.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Quốc gia:</span>
            <select
              value={countryId}
              onChange={(e) => onSelectCountryView(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {playerCountry && (
                <option value={playerCountry.id}>
                  ⭐ {playerCountry.nameVi} (Quốc gia của bạn)
                </option>
              )}
              {availableCountries
                .filter((c) => c.id !== playerCountry?.id)
                .slice(0, 25)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameVi || c.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* TỔNG QUAN TÀI CHÍNH QUỐC GIA (Top Financial Overview Bar) */}
      <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Chỉ số ngân sách quốc gia hiện hành
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Số dư tiền mặt & Dòng tiền thu chi hằng ngày
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Số dư ngân sách hiện tại */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Số dư ngân sách</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-amber-300 truncate">
                  ${Math.round(economy.treasury).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-amber-400/80">USD</span>
              </div>
            </div>
          </div>

          {/* 2. Thuế thực thu hàng ngày */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Thuế thu hằng ngày</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-emerald-300">
                  +${Math.round(taxForecast.netDailyUSD).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-emerald-400/80">/ngày</span>
              </div>
            </div>
          </div>

          {/* 3. Chi phí bảo trì nhà máy hàng ngày (G4) */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Duy trì nhà máy (G4)</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-rose-300">
                  -${Math.round(economy.dailyFactoryMaintenance).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-rose-400/80">/ngày</span>
              </div>
            </div>
          </div>

          {/* 4. Dân số hiện tại */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Dân số hiện tại</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-sky-300">
                  {Math.round(economy.population).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-sky-400/80">người</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dòng tiền ròng và ghi chú khởi đầu */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span>Dòng tiền ròng mỗi ngày: </span>
            <span
              className={`font-mono font-bold text-sm ${
                taxForecast.netDailyUSD - economy.dailyFactoryMaintenance >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {taxForecast.netDailyUSD - economy.dailyFactoryMaintenance >= 0 ? '+' : ''}
              ${Math.round(taxForecast.netDailyUSD - economy.dailyFactoryMaintenance).toLocaleString('vi-VN')} USD/ngày
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Ngân sách khởi đầu = 40% Tổng thuế tháng (${Math.round(economy.initialTreasury).toLocaleString('vi-VN')} USD)
          </div>
        </div>
      </section>

      {/* THANH ĐIỀU HƯỚNG TAB CHỨC NĂNG */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('tax')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'tax'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Hệ thống Thuế & Dân số</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'banking'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Ngân hàng & Khoản vay</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'ledger'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sổ kế toán ngân sách</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defaults')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'defaults'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Xử lý nợ quá hạn (G9)</span>
        </button>
      </div>

      {/* TAB 1: HỆ THỐNG THUẾ & DÂN SỐ */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột 1: Điều chỉnh thuế suất */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Điều chỉnh thuế suất quốc gia
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Bước chỉnh: 0.1 USD
                </span>
              </div>

              {/* Slider điều chỉnh */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Mức thuế đang áp dụng:</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black font-mono text-amber-400">
                      {economy.taxRate.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">USD/người/tháng</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={MIN_TAX_RATE}
                  max={MAX_TAX_RATE}
                  step={TAX_RATE_STEP}
                  value={economy.taxRate}
                  disabled={!canManage}
                  onChange={(e) => onUpdateTaxRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0.0 USD (Miễn thuế)</span>
                  <span className="text-amber-500/80 font-bold">3.0 USD (Ngưỡng di cư)</span>
                  <span>10.0 USD (Tối đa)</span>
                </div>
              </div>

              {/* Cảnh báo ngưỡng di cư */}
              {economy.taxRate > MIGRATION_TAX_THRESHOLD ? (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>CẢNH BÁO: MỨC THUẾ VƯỢT NGƯỠNG AN TOÀN (3.0 USD)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-200/90">
                    Mức thuế đang vượt ngưỡng 3 USD/người/tháng. Dân số sẽ bắt đầu di cư ra khỏi quốc gia với tỷ lệ{' '}
                    <strong className="text-white font-mono">{(migrationRate * 100).toFixed(4)}%/tháng</strong>{' '}
                    (đã duy trì {economy.consecutiveHighTaxMonths} tháng liên tục).
                  </p>
                  <p className="text-[10px] italic text-rose-400">
                    * Công thức: r = min(1%, 0.05% × (T - 3) × [1 + 0.1(m - 1)]). Dân số đã di cư không tự quay lại.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mức thuế nằm trong ngưỡng an toàn (≤ 3.0 USD). Dân số không bị sụt giảm do di cư.</span>
                </div>
              )}

              {/* Thông tin chi tiết thu thuế */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng thuế tháng dự kiến (Gốc):</span>
                  <span className="font-bold text-white">
                    ${Math.round(calculateMonthlyGrossTax(economy.population, economy.taxRate)).toLocaleString('vi-VN')} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số ngày trong tháng hiện tại:</span>
                  <span className="font-bold text-slate-200">{taxForecast.daysInMonth} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thuế bình quân ngày (Chưa trừ hiệu suất):</span>
                  <span className="font-bold text-slate-300">
                    ${Math.round(taxForecast.grossDailyUSD).toLocaleString('vi-VN')} USD/ngày
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Thuế thực tế cộng vào ngân sách mỗi ngày:</span>
                  <span className="font-bold text-emerald-400">
                    +${Math.round(taxForecast.netDailyUSD).toLocaleString('vi-VN')} USD/ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Cột 2: Ảnh hưởng của Bộ trưởng Tài chính & Dân số */}
            <div className="space-y-6">
              {/* Card Bộ máy: Bộ trưởng Tài chính */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <HandCoins className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Hiệu suất thu thuế (Bộ máy G2)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Bộ trưởng Tài chính
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Nhân sự đương nhiệm:</span>
                    <span className="font-bold text-white">
                      {politicalData?.government.financeMinister?.fullName || 'Chưa bổ nhiệm (Mặc định 90%)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Năng lực quản lý:</span>
                    <span className="font-bold font-mono text-amber-400">
                      {financeMinisterAbility !== undefined ? `${financeMinisterAbility}/100` : '0/100'}
                    </span>
                  </div>

                  {/* Thanh tiến trình hiệu suất */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">Hiệu suất thu thuế thực tế:</span>
                      <span className="font-bold text-emerald-400">{(ministerEfficiency * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full transition-all"
                        style={{ width: `${(ministerEfficiency - 0.85) * 666}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    * Quy định G3: Kỹ năng 100 đạt hiệu suất 100%, kỹ năng 50 đạt 95%, nội suy tuyến tính trong khoảng [90% – 100%]. Hiệu suất KHÔNG áp dụng vào ngân sách ban đầu.
                  </p>
                </div>
              </div>

              {/* Card Dân số & Thống kê di cư */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Biến động dân số</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Dữ liệu hiện đại
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Dân số ban đầu:</span>
                    <span className="text-sm font-bold text-slate-200">
                      {economy.basePopulation.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Đã di cư vĩnh viễn:</span>
                    <span className="text-sm font-bold text-rose-400">
                      -{Math.round(economy.totalMigratedPopulation).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGÂN HÀNG QUỐC TẾ & KHOẢN VAY */}
      {activeTab === 'banking' && (
        <div className="space-y-6">
          {/* Sub-tabs điều hướng Ngân hàng */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setBankingSubTab('lend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                bankingSubTab === 'lend'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cho quốc gia khác vay ({topBorrowers.length})
            </button>
            <button
              type="button"
              onClick={() => setBankingSubTab('borrow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                bankingSubTab === 'borrow'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đề nghị vay vốn ({topLenders.length})
            </button>
            <button
              type="button"
              onClick={() => setBankingSubTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                bankingSubTab === 'active'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hợp đồng đang thực hiện ({activeContractsForCountry.length})
            </button>
          </div>

          {/* SUBTAB 1: CHO QUỐC GIA KHÁC VAY */}
          {bankingSubTab === 'lend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <p>
                  Danh sách tối đa 20 quốc gia có nhu cầu vay vốn. Bạn có thể điều chỉnh lãi suất trước khi giải ngân.
                </p>
                <span className="font-mono text-slate-300">
                  Ngân sách khả dụng của bạn: <strong className="text-amber-400">${Math.round(economy.treasury).toLocaleString('vi-VN')} USD</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topBorrowers.map((borrower) => (
                  <div
                    key={borrower.countryId}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 space-y-3 transition-colors shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-black text-white">{borrower.countryName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {borrower.countryId} • Dân số: {(borrower.population / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {borrower.creditRating}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ngân sách hiện tại:</span>
                        <span className="text-slate-200">${Math.round(borrower.treasury).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lãi suất đề xuất:</span>
                        <span className="text-amber-400 font-bold">{borrower.recommendedInterestRate}%/năm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nhu cầu vay tối đa:</span>
                        <span className="text-emerald-400 font-bold">${borrower.maxBorrowAmount.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleOpenLendModal(borrower)}
                        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-amber-500/20"
                      >
                        Cho quốc gia này vay
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 2: ĐỀ NGHỊ VAY VỐN */}
          {bankingSubTab === 'borrow' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Danh sách tối đa 20 quốc gia có thặng dư ngân sách có thể cho vay. Kỳ hạn cố định: 180, 270 hoặc 365 ngày.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topLenders.map((lender) => (
                  <div
                    key={lender.countryId}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 space-y-3 transition-colors shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-black text-white">{lender.countryName}</h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Xếp hạng: {lender.creditRating}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Có thể cho vay
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Khả năng cho vay:</span>
                        <span className="text-emerald-400 font-bold">${lender.maxLendAmount.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lãi suất cố định:</span>
                        <span className="text-amber-400 font-bold">{lender.recommendedInterestRate}%/năm</span>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleOpenBorrowModal(lender)}
                        className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-sky-500/20"
                      >
                        Đề nghị vay vốn
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB 3: HỢP ĐỒNG ĐANG THỰC HIỆN */}
          {bankingSubTab === 'active' && (
            <div className="space-y-4">
              {activeContractsForCountry.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  Hiện chưa có hợp đồng vay vốn nào đang thực hiện.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeContractsForCountry.map((contract) => {
                    const isLender = contract.lenderCountryId === countryId;
                    const formattedStart = formatGameDate(contract.startDate);
                    const formattedDue = formatGameDate(contract.dueDate);

                    return (
                      <div
                        key={contract.id}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-white text-base">
                              {isLender ? `Cho ${contract.borrowerCountryName} vay` : `Vay từ ${contract.lenderCountryName}`}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                isLender ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                              }`}
                            >
                              {isLender ? 'CHỦ NỢ' : 'CON NỢ'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                            <span>Gốc: <strong className="text-slate-200">${contract.principalUSD.toLocaleString('vi-VN')}</strong></span>
                            <span>•</span>
                            <span>Lãi suất: <strong className="text-amber-400">{contract.annualInterestRate}%/năm</strong></span>
                            <span>•</span>
                            <span>Kỳ hạn: <strong>{contract.termDays} ngày</strong></span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500">
                            Ngày giải ngân: {formattedStart.fullStr} • Ngày đáo hạn: <strong className="text-amber-300">{formattedDue.fullStr}</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono text-slate-400 block">
                            Tổng nghĩa vụ thanh toán khi đáo hạn
                          </span>
                          <span className="text-xl font-black font-mono text-emerald-400">
                            ${contract.totalObligationUSD.toLocaleString('vi-VN')} USD
                          </span>
                          <span className="text-[10px] text-slate-500 block italic">
                            (Thanh toán 1 lần trọn gói gốc + lãi)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SỔ KẾ TOÁN THU CHI (Budget Ledger) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Nhật ký giao dịch thu chi ngân sách</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Ghi nhận dòng tiền thực tế
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Ngày</th>
                    <th className="p-3">Khoản mục</th>
                    <th className="p-3">Loại</th>
                    <th className="p-3 text-right">Số tiền (USD)</th>
                    <th className="p-3 text-right">Số dư sau giao dịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {countryTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                        Chưa có giao dịch phát sinh.
                      </td>
                    </tr>
                  ) : (
                    countryTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-400">
                          {formatGameDate(tx.date).fullStr}
                        </td>
                        <td className="p-3 font-medium text-white">{tx.description}</td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tx.category === 'income'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tx.category === 'income' ? 'THU' : 'CHI'}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            tx.category === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.category === 'income' ? '+' : '-'}${tx.amountUSD.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-3 text-right text-slate-400 font-bold">
                          ${Math.round(tx.balanceAfterUSD).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: XỬ LÝ NỢ QUÁ HẠN & KẾT NỐI G9 */}
      {activeTab === 'defaults' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
              <Info className="w-4 h-4" />
              <span>Quy tắc xử lý nợ quá hạn (Mục VI)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khi quốc gia đi vay không đủ tiền thanh toán khi đến hạn, hợp đồng sẽ chuyển sang trạng thái <strong>Quá hạn (Defaulted)</strong>. Bên cho vay được quyền thu hồi tài nguyên (Dầu, Uranium, Lương thực) theo giá trị định giá từ hệ thống <strong>G9 — Giao thương</strong>.
            </p>
            <p className="text-[11px] text-slate-400 italic">
              * Theo quy tắc khóa phạm vi G3, hệ thống không tự đặt giá tài nguyên độc lập. Khi G9 được triển khai, cơ chế định giá sẽ tự động kích hoạt để thu hồi giá trị tài nguyên tương ứng. Nếu giá trị tài nguyên thu hồi vẫn không đủ thanh toán nghĩa vụ nợ, phần còn thiếu sẽ được xóa bỏ theo quyết định thiết kế.
            </p>
          </div>

          {defaultedContractsForCountry.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
              Không có khoản nợ nào bị quá hạn hoặc vỡ nợ.
            </div>
          ) : (
            <div className="space-y-3">
              {defaultedContractsForCountry.map((contract) => (
                <div
                  key={contract.id}
                  className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span className="font-bold text-white text-base">
                        Vỡ nợ: {contract.borrowerCountryName} không thanh toán cho {contract.lenderCountryName}
                      </span>
                    </div>
                    <p className="text-xs text-rose-300 font-mono">
                      Tổng nghĩa vụ quá hạn: <strong>${contract.totalObligationUSD.toLocaleString('vi-VN')} USD</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ngày đáo hạn: {formatGameDate(contract.dueDate).fullStr} • Đang chờ xử lý thu hồi tài nguyên G9
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold text-center">
                    CHỜ ĐỊNH GIÁ G9
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL CHO VAY */}
      {lendModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Hợp đồng cho vay vốn
                </h3>
                <p className="text-xs text-slate-400">
                  Bên vay: {lendModalTarget.countryName} (Xếp hạng: {lendModalTarget.creditRating})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* Số tiền gốc */}
              <div>
                <label className="text-slate-400 block mb-1">Số tiền cho vay (USD):</label>
                <input
                  type="number"
                  min={500000}
                  max={Math.min(economy.treasury, lendModalTarget.maxBorrowAmount)}
                  step={500000}
                  value={lendPrincipalInput}
                  onChange={(e) => setLendPrincipalInput(Math.max(500000, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500">
                  Tối đa: ${Math.min(economy.treasury, lendModalTarget.maxBorrowAmount).toLocaleString('vi-VN')} USD
                </span>
              </div>

              {/* Kỳ hạn */}
              <div>
                <label className="text-slate-400 block mb-1">Kỳ hạn vay (Chỉ 3 kỳ hạn hợp lệ):</label>
                <div className="grid grid-cols-3 gap-2">
                  {VALID_LOAN_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLendTermInput(term)}
                      className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                        lendTermInput === term
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {term} ngày
                    </button>
                  ))}
                </div>
              </div>

              {/* Lãi suất */}
              <div>
                <label className="text-slate-400 block mb-1">Lãi suất thỏa thuận (%/năm):</label>
                <input
                  type="number"
                  min={1.0}
                  max={30.0}
                  step={0.5}
                  value={lendRateInput}
                  onChange={(e) => setLendRateInput(parseFloat(e.target.value) || 5.0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Dự kiến nghĩa vụ */}
              {(() => {
                const { interestAmountUSD, totalObligationUSD } = calculateLoanObligation(
                  lendPrincipalInput,
                  lendRateInput,
                  lendTermInput
                );
                return (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiền lãi dự kiến:</span>
                      <span className="text-amber-400 font-bold">${interestAmountUSD.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-300 font-bold">Thu hồi khi đáo hạn:</span>
                      <span className="text-emerald-400 font-black">${totalObligationUSD.toLocaleString('vi-VN')} USD</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setLendModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLend}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
              >
                Xác nhận giải ngân
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐỀ NGHỊ VAY VỐN */}
      {borrowModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Đề nghị vay vốn quốc tế
                </h3>
                <p className="text-xs text-slate-400">
                  Bên cho vay: {borrowModalTarget.countryName} (Lãi suất: {borrowModalTarget.recommendedInterestRate}%/năm)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Số tiền vay (USD):</label>
                <input
                  type="number"
                  min={500000}
                  max={borrowModalTarget.maxLendAmount}
                  step={500000}
                  value={borrowPrincipalInput}
                  onChange={(e) => setBorrowPrincipalInput(Math.max(500000, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sky-300 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-[10px] text-slate-500">
                  Hạn mức cho phép: ${borrowModalTarget.maxLendAmount.toLocaleString('vi-VN')} USD
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Kỳ hạn vay:</label>
                <div className="grid grid-cols-3 gap-2">
                  {VALID_LOAN_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setBorrowTermInput(term)}
                      className={`py-2 rounded-lg border font-bold text-xs transition-colors ${
                        borrowTermInput === term
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {term} ngày
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const { interestAmountUSD, totalObligationUSD } = calculateLoanObligation(
                  borrowPrincipalInput,
                  borrowModalTarget.recommendedInterestRate,
                  borrowTermInput
                );
                return (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiền lãi phải trả:</span>
                      <span className="text-rose-400 font-bold">${interestAmountUSD.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-300 font-bold">Nghĩa vụ khi đáo hạn:</span>
                      <span className="text-amber-400 font-black">${totalObligationUSD.toLocaleString('vi-VN')} USD</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setBorrowModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBorrow}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20"
              >
                Xác nhận vay vốn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
