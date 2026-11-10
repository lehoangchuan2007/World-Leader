/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TopResourceBar } from './components/TopResourceBar';
import { TimeControl } from './components/TimeControl';
import { MainMenu } from './components/MainMenu';
import { CountrySearchBar } from './components/CountrySearchBar';
import { MapPage } from './pages/MapPage';
import { PoliticsPage } from './pages/PoliticsPage';
import { FactoryPage } from './pages/FactoryPage';
import { EconomyPage } from './pages/EconomyPage';
import { MilitaryPage } from './pages/MilitaryPage';
import { DiplomacyPage } from './pages/DiplomacyPage';
import { TechnologyPage } from './pages/TechnologyPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  INITIAL_GAME_DATE,
  SPEED_INTERVALS,
  advanceOneDay,
} from './systems/timeSystem';
import {
  ActivePage,
  GameDate,
  SelectedCountry,
  PlayerCountry,
  TimeSpeed,
} from './types/game';
import {
  Candidate,
  CountryPoliticalData,
  GovernmentPosition,
} from './types/politics';
import {
  FactoryCostRecord,
  FactoryInstance,
  FactoryType,
} from './types/factory';
import {
  BudgetTransaction,
  CountryEconomy,
  LoanContract,
  LoanTermDays,
} from './types/economy';
import { initializeCountryPoliticalData } from './data/governmentData';
import {
  hirePersonnelForPosition,
  firePersonnelFromPosition,
  runAiGovernmentTick,
} from './systems/governmentSystem';
import { COUNTRY_NAMES_VI } from './data/countryNamesVi';
import { getProvincesForCountry } from './data/provinceData';
import { getFactorySpec } from './data/factorySpecs';
import {
  createNewFactoryInstance,
  startFactoryUpgrade,
} from './systems/factoryConstructionSystem';
import { advanceFactoriesOneDay } from './systems/factoryProgressSystem';
import {
  recordOneTimeFactoryCost,
  recordDailyMaintenanceCosts,
} from './systems/factoryCostSystem';
import { runAiFactoryCycle } from './systems/factoryAiSystem';
import {
  initializeCountryEconomy,
  calculateDailyTaxCollection,
  calculateMonthlyMigrationRate,
} from './systems/economySystem';
import {
  isLoanMatured,
  processLoanMaturity,
  disburseNewLoan,
  runAiLoanCycle,
} from './systems/loanSystem';

// Danh sách một số quốc gia trọng tâm khởi tạo sẵn
const INITIAL_MAJOR_COUNTRIES = [
  { id: '704', name: 'Vietnam', nameVi: 'Việt Nam' },
  { id: '840', name: 'United States of America', nameVi: 'Hoa Kỳ' },
  { id: '826', name: 'United Kingdom', nameVi: 'Vương quốc Anh' },
  { id: '250', name: 'France', nameVi: 'Pháp' },
  { id: '643', name: 'Russia', nameVi: 'Nga (Liên Xô)' },
  { id: '276', name: 'Germany', nameVi: 'Đức' },
  { id: '392', name: 'Japan', nameVi: 'Nhật Bản' },
  { id: '156', name: 'China', nameVi: 'Trung Quốc' },
  { id: '380', name: 'Italy', nameVi: 'Ý' },
  { id: '764', name: 'Thailand', nameVi: 'Thái Lan' },
];

function buildInitialCountriesMap(): Record<string, CountryPoliticalData> {
  const map: Record<string, CountryPoliticalData> = {};
  for (const c of INITIAL_MAJOR_COUNTRIES) {
    map[c.id] = initializeCountryPoliticalData(c.id, c.nameVi, c.nameVi, true);
  }
  return map;
}

function buildInitialEconomiesMap(): Record<string, CountryEconomy> {
  const map: Record<string, CountryEconomy> = {};
  for (const c of INITIAL_MAJOR_COUNTRIES) {
    map[c.id] = initializeCountryEconomy(c.id, c.nameVi);
  }
  return map;
}

// Khởi tạo một số nhà máy ban đầu cho thế giới 1925
function buildInitialFactories(): FactoryInstance[] {
  return [
    // Việt Nam: 1 nhà máy lương thực cấp I tại Hà Nội
    {
      id: 'fac_init_vn_food_1',
      countryId: '704',
      provinceId: 'vn_hanoi',
      type: 'food',
      currentLevel: 1,
      status: 'operating',
      startDay: 1,
      startMonth: 1,
      startYear: 1925,
      totalDurationDays: 20,
      daysElapsed: 20,
      dailyOutput: 100,
      outputUnit: 'tấn/ngày',
      dailyMaintenanceUSD: 150,
      constructionCostUSD: 80000,
      upgradeHistory: [],
    },
    // Việt Nam: 1 nhà máy dầu cấp I tại Quảng Ninh
    {
      id: 'fac_init_vn_oil_1',
      countryId: '704',
      provinceId: 'vn_quangninh',
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
  ];
}

const FACTORIES_STORAGE_KEY = 'world_leader_gd4_factories';
const ECONOMIES_STORAGE_KEY = 'world_leader_gd3_economies';
const LOANS_STORAGE_KEY = 'world_leader_gd3_loans';
const TRANSACTIONS_STORAGE_KEY = 'world_leader_gd3_transactions';

export default function App() {
  // Calendar Date State - Initial 01/01/1925
  const [currentDate, setCurrentDate] = useState<GameDate>(INITIAL_GAME_DATE);

  // Time Speed State - Initial X1
  const [currentSpeed, setCurrentSpeed] = useState<TimeSpeed>('x1');

  // Navigation State - Initial 'map'
  const [currentPage, setCurrentPage] = useState<ActivePage>('map');

  // Player Country State (Quốc gia người chơi khởi đầu)
  const [playerCountry, setPlayerCountry] = useState<PlayerCountry | null>(null);

  // State xác định chế độ chọn quốc gia khởi đầu
  const [isSelectingStartingCountry, setIsSelectingStartingCountry] = useState<boolean>(true);

  // Selected Country State (Mặc định gợi ý Việt Nam khi mở game)
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>({
    id: '704',
    name: 'Vietnam',
    nameVi: 'Việt Nam',
  });

  // State lưu trữ dữ liệu chính trị và bộ máy nhà nước (GĐ2)
  const [countriesPolitical, setCountriesPolitical] = useState<Record<string, CountryPoliticalData>>(
    () => buildInitialCountriesMap()
  );

  // State lưu trữ dữ liệu Nhà máy (GĐ4)
  const [factories, setFactories] = useState<FactoryInstance[]>(() => {
    try {
      const saved = localStorage.getItem(FACTORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Bỏ qua nếu lỗi parse
    }
    return buildInitialFactories();
  });

  // State lưu trữ dữ liệu Kinh tế và Ngân sách (GĐ3)
  const [economies, setEconomies] = useState<Record<string, CountryEconomy>>(() => {
    try {
      const saved = localStorage.getItem(ECONOMIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // Bỏ qua nếu lỗi parse
    }
    return buildInitialEconomiesMap();
  });

  // State lưu trữ hợp đồng vay vốn quốc tế (GĐ3)
  const [loanContracts, setLoanContracts] = useState<LoanContract[]>(() => {
    try {
      const saved = localStorage.getItem(LOANS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Bỏ qua
    }
    return [];
  });

  // State lưu trữ nhật ký thu chi ngân sách (GĐ3)
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Bỏ qua
    }
    return [];
  });

  // Lưu lịch sử chi phí nhà máy (GĐ4)
  const [, setCostRecords] = useState<FactoryCostRecord[]>([]);

  // ID quốc gia đang được xem trong trang Chính trị, Nhà máy hoặc Kinh tế
  const [viewingCountryId, setViewingCountryId] = useState<string>('704');

  // Lưu trạng thái vào localStorage để khôi phục khi tải lại
  useEffect(() => {
    try {
      localStorage.setItem(FACTORIES_STORAGE_KEY, JSON.stringify(factories));
    } catch {
      // Bỏ qua nếu lỗi quota
    }
  }, [factories]);

  useEffect(() => {
    try {
      localStorage.setItem(ECONOMIES_STORAGE_KEY, JSON.stringify(economies));
    } catch {
      // Bỏ qua nếu lỗi quota
    }
  }, [economies]);

  useEffect(() => {
    try {
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loanContracts));
    } catch {
      // Bỏ qua nếu lỗi quota
    }
  }, [loanContracts]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(budgetTransactions));
    } catch {
      // Bỏ qua nếu lỗi quota
    }
  }, [budgetTransactions]);

  // References for stable state inside timer
  const factoriesRef = useRef(factories);
  factoriesRef.current = factories;

  const countriesPoliticalRef = useRef(countriesPolitical);
  countriesPoliticalRef.current = countriesPolitical;

  const loanContractsRef = useRef(loanContracts);
  loanContractsRef.current = loanContracts;

  const playerCountryRef = useRef(playerCountry);
  playerCountryRef.current = playerCountry;

  // Lấy hoặc khởi tạo dữ liệu chính trị cho một quốc gia bất kỳ nếu chưa có trong bộ nhớ
  const getOrInitCountryData = useCallback((countryId: string): CountryPoliticalData => {
    if (countriesPolitical[countryId]) {
      return countriesPolitical[countryId];
    }

    let name = `Quốc gia ${countryId}`;
    if (selectedCountry && selectedCountry.id === countryId) {
      name = selectedCountry.nameVi || selectedCountry.name;
    } else {
      const matchKey = Object.keys(COUNTRY_NAMES_VI).find((k) => k === countryId);
      if (matchKey) name = COUNTRY_NAMES_VI[matchKey];
    }

    const newData = initializeCountryPoliticalData(countryId, name, name, true);
    setCountriesPolitical((prev) => ({
      ...prev,
      [countryId]: newData,
    }));
    return newData;
  }, [countriesPolitical, selectedCountry]);

  // Lấy hoặc khởi tạo dữ liệu kinh tế cho một quốc gia bất kỳ nếu chưa có trong bộ nhớ
  const getOrInitCountryEconomy = useCallback((countryId: string): CountryEconomy => {
    if (economies[countryId]) {
      return economies[countryId];
    }

    let name = `Quốc gia ${countryId}`;
    if (selectedCountry && selectedCountry.id === countryId) {
      name = selectedCountry.nameVi || selectedCountry.name;
    } else {
      const matchKey = Object.keys(COUNTRY_NAMES_VI).find((k) => k === countryId);
      if (matchKey) name = COUNTRY_NAMES_VI[matchKey];
    }

    const ministerAbility =
      countriesPolitical[countryId]?.government.financeMinister?.managementAbility;
    const newEco = initializeCountryEconomy(countryId, name, ministerAbility);
    setEconomies((prev) => ({
      ...prev,
      [countryId]: newEco,
    }));
    return newEco;
  }, [economies, selectedCountry, countriesPolitical]);

  // Lấy tên hiển thị của một quốc gia theo ID
  const getCountryDisplayName = useCallback((cId: string): string => {
    if (playerCountry && playerCountry.id === cId) return playerCountry.nameVi;
    if (selectedCountry && selectedCountry.id === cId) return selectedCountry.nameVi || selectedCountry.name;
    const match = Object.entries(COUNTRY_NAMES_VI).find(([k]) => k === cId);
    if (match) return match[1];
    return `Quốc gia ${cId}`;
  }, [playerCountry, selectedCountry]);

  // Real-time calendar progression engine & AI tick
  useEffect(() => {
    if (currentSpeed === 'pause') return;

    const intervalMs = SPEED_INTERVALS[currentSpeed];
    const timer = setInterval(() => {
      setCurrentDate((prevDate) => {
        const nextDate = advanceOneDay(prevDate);
        const isNewMonth = nextDate.day === 1 && nextDate.month !== prevDate.month;

        // 1. Tiến độ xây dựng & nâng cấp nhà máy mỗi ngày (GĐ4)
        setFactories((prevFactories) => {
          const { updatedFactories } = advanceFactoriesOneDay(prevFactories, nextDate);
          return updatedFactories;
        });

        // 2. Ghi nhận chi phí duy trì hàng ngày của các nhà máy đang hoạt động (GĐ4)
        setCostRecords((prevCosts) => {
          const dailyCosts = recordDailyMaintenanceCosts(factoriesRef.current, nextDate);
          return dailyCosts.length > 0 ? [...prevCosts, ...dailyCosts] : prevCosts;
        });

        // 3. Hệ thống Kinh tế & Ngân sách Quốc gia (GĐ3)
        // Thu thuế hàng ngày, trừ chi phí duy trì nhà máy, tính toán di cư và kiểm tra đáo hạn khoản vay
        setEconomies((prevEconomies) => {
          const updatedEconomies: Record<string, CountryEconomy> = {};
          const currentFactories = factoriesRef.current;
          const currentPolitical = countriesPoliticalRef.current;

          for (const [cId, eco] of Object.entries(prevEconomies)) {
            // Chi phí duy trì nhà máy của quốc gia này
            const operatingFacs = currentFactories.filter(
              (f) => f.countryId === cId && f.status === 'operating'
            );
            const maintenanceCost = operatingFacs.reduce(
              (sum, f) => sum + f.dailyMaintenanceUSD,
              0
            );

            // Năng lực Bộ trưởng Tài chính
            const ministerAbility = currentPolitical[cId]?.government.financeMinister?.managementAbility;

            // Thu thuế hằng ngày
            const { netDailyUSD, daysInMonth } = calculateDailyTaxCollection(
              eco.population,
              eco.taxRate,
              nextDate.month,
              nextDate.year,
              ministerAbility
            );

            // Tháng thuế cao liên tiếp (> 3.0 USD/người/tháng)
            let highTaxMonths = eco.consecutiveHighTaxMonths;
            if (isNewMonth) {
              highTaxMonths = eco.taxRate > 3.0 ? highTaxMonths + 1 : 0;
            }

            // Di cư khi thuế > 3.0 USD/người/tháng
            let newPop = eco.population;
            let newTotalMigrated = eco.totalMigratedPopulation;
            let migrationRate = 0;
            if (eco.taxRate > 3.0) {
              migrationRate = calculateMonthlyMigrationRate(eco.taxRate, highTaxMonths);
              const dailyMigrated = (eco.population * migrationRate) / daysInMonth;
              newPop = Math.max(1000, eco.population - dailyMigrated);
              newTotalMigrated = eco.totalMigratedPopulation + dailyMigrated;
            }

            // Dòng tiền và số dư ngân sách mới
            const dailyNetCashFlow = netDailyUSD - maintenanceCost;
            const newTreasury = eco.treasury + dailyNetCashFlow;
            const monthlyGross = newPop * eco.taxRate;

            updatedEconomies[cId] = {
              ...eco,
              population: newPop,
              treasury: newTreasury,
              consecutiveHighTaxMonths: highTaxMonths,
              currentMonthMigrationRate: migrationRate,
              totalMigratedPopulation: newTotalMigrated,
              monthlyTaxGross: monthlyGross,
              dailyTaxNet: netDailyUSD,
              dailyFactoryMaintenance: maintenanceCost,
              dailyNetCashFlow,
              lastDayProcessed: nextDate,
            };
          }

          // Kiểm tra và xử lý hợp đồng vay vốn đáo hạn (G3)
          setLoanContracts((prevLoans) => {
            let loansChanged = false;
            const updatedLoans = prevLoans.map((contract) => {
              if (contract.status === 'active' && isLoanMatured(nextDate, contract.dueDate)) {
                loansChanged = true;
                const borrowerEco = updatedEconomies[contract.borrowerCountryId];
                const lenderEco = updatedEconomies[contract.lenderCountryId];
                const borrowerTreasury = borrowerEco ? borrowerEco.treasury : 0;
                const lenderTreasury = lenderEco ? lenderEco.treasury : 0;

                const result = processLoanMaturity(contract, borrowerTreasury, lenderTreasury, nextDate);

                if (borrowerEco) {
                  updatedEconomies[contract.borrowerCountryId] = {
                    ...borrowerEco,
                    treasury: result.updatedBorrowerTreasury,
                  };
                }
                if (lenderEco) {
                  updatedEconomies[contract.lenderCountryId] = {
                    ...lenderEco,
                    treasury: result.updatedLenderTreasury,
                  };
                }

                // Ghi nhận nhật ký thu chi nếu liên quan đến người chơi
                const playerId = playerCountryRef.current?.id;
                if (playerId && (contract.borrowerCountryId === playerId || contract.lenderCountryId === playerId)) {
                  const isPlayerBorrower = contract.borrowerCountryId === playerId;
                  setBudgetTransactions((prevT) => [
                    ...prevT.slice(-150),
                    {
                      id: `tx_loan_mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                      countryId: playerId,
                      date: nextDate,
                      type: result.repaid
                        ? (isPlayerBorrower ? 'loan_repayment_out' : 'loan_repayment_in')
                        : 'debt_default_loss',
                      category: isPlayerBorrower ? 'expense' : (result.repaid ? 'income' : 'expense'),
                      amountUSD: contract.totalObligationUSD,
                      balanceAfterUSD: isPlayerBorrower ? result.updatedBorrowerTreasury : result.updatedLenderTreasury,
                      description: result.repaid
                        ? (isPlayerBorrower
                            ? `Tất toán nợ đến hạn cho ${contract.lenderCountryName}`
                            : `Nhận thanh toán nợ đến hạn từ ${contract.borrowerCountryName}`)
                        : (isPlayerBorrower
                            ? `Vỡ nợ: Không đủ số dư để trả nợ cho ${contract.lenderCountryName}`
                            : `Bên vay ${contract.borrowerCountryName} không đủ tiền trả nợ (Quá hạn G9)`),
                    },
                  ]);
                }

                return result.updatedContract;
              }
              return contract;
            });

            return loansChanged ? updatedLoans : prevLoans;
          });

          // Chu kỳ vay vốn AI hàng tháng
          if (isNewMonth) {
            const aiResult = runAiLoanCycle(
              updatedEconomies,
              playerCountryRef.current?.id || null,
              loanContractsRef.current,
              nextDate
            );
            if (aiResult.newContracts.length > 0) {
              setLoanContracts((prev) => [...prev, ...aiResult.newContracts]);
              Object.assign(updatedEconomies, aiResult.updatedEconomies);
            }
          }

          // Ghi nhận giao dịch hàng ngày của người chơi vào sổ kế toán
          const pId = playerCountryRef.current?.id;
          if (pId && updatedEconomies[pId]) {
            const pEco = updatedEconomies[pId];
            const newTx: BudgetTransaction[] = [
              {
                id: `tx_tax_${nextDate.year}_${nextDate.month}_${nextDate.day}`,
                countryId: pId,
                date: nextDate,
                type: 'tax_income',
                category: 'income',
                amountUSD: Math.round(pEco.dailyTaxNet),
                balanceAfterUSD: Math.round(pEco.treasury),
                description: `Thu thuế hằng ngày (${pEco.taxRate.toFixed(1)} USD/người/tháng)`,
              },
            ];
            if (pEco.dailyFactoryMaintenance > 0) {
              newTx.push({
                id: `tx_maint_${nextDate.year}_${nextDate.month}_${nextDate.day}`,
                countryId: pId,
                date: nextDate,
                type: 'factory_maintenance',
                category: 'expense',
                amountUSD: Math.round(pEco.dailyFactoryMaintenance),
                balanceAfterUSD: Math.round(pEco.treasury),
                description: 'Chi phí bảo dưỡng các nhà máy vận hành (G4)',
              });
            }
            setBudgetTransactions((prevT) => [...prevT.slice(-150), ...newTx]);
          }

          return updatedEconomies;
        });

        // 4. Mỗi khi sang tháng mới (ngày 1), kích hoạt chu kỳ AI Chính trị & Nhà máy
        if (isNewMonth) {
          // AI quản lý nhân sự (GĐ2)
          setCountriesPolitical((prevData) => {
            const { updatedCountries, changedCountryIds } = runAiGovernmentTick(
              prevData,
              playerCountry?.id || null
            );
            return changedCountryIds.length > 0 ? updatedCountries : prevData;
          });

          // AI xây dựng & nâng cấp nhà máy (GĐ4)
          setFactories((prevFactories) => {
            const aiCountryIds = INITIAL_MAJOR_COUNTRIES.map((c) => c.id);
            return runAiFactoryCycle(
              prevFactories,
              aiCountryIds,
              playerCountry?.id || null,
              nextDate
            );
          });
        }

        return nextDate;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentSpeed, playerCountry]);

  const handleBackToMap = () => {
    setCurrentPage('map');
  };

  const handleConfirmPlayerCountry = (country: SelectedCountry) => {
    setPlayerCountry(country);
    setSelectedCountry(country);
    setViewingCountryId(country.id);
    setIsSelectingStartingCountry(false);
  };

  const handleNewGame = () => {
    setCurrentDate(INITIAL_GAME_DATE);
    setCurrentSpeed('x1');
    setPlayerCountry(null);
    setIsSelectingStartingCountry(true);
    setSelectedCountry({
      id: '704',
      name: 'Vietnam',
      nameVi: 'Việt Nam',
    });
    setViewingCountryId('704');
    setCountriesPolitical(buildInitialCountriesMap());
    setFactories(buildInitialFactories());
    setCostRecords([]);
    setEconomies(buildInitialEconomiesMap());
    setLoanContracts([]);
    setBudgetTransactions([]);
    localStorage.removeItem(FACTORIES_STORAGE_KEY);
    localStorage.removeItem(ECONOMIES_STORAGE_KEY);
    localStorage.removeItem(LOANS_STORAGE_KEY);
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    setCurrentPage('map');
  };

  // Người chơi thuê nhân sự cho chức vụ (GĐ2)
  const handleHirePersonnel = (position: GovernmentPosition, candidate: Candidate) => {
    const targetId = viewingCountryId;
    setCountriesPolitical((prev) => {
      const targetCountry = prev[targetId] || getOrInitCountryData(targetId);
      const res = hirePersonnelForPosition(targetCountry.government, position, candidate);
      if (res.success && res.updatedGovernment) {
        return {
          ...prev,
          [targetId]: {
            ...targetCountry,
            government: res.updatedGovernment,
          },
        };
      }
      return prev;
    });
  };

  // Người chơi sa thải nhân sự (GĐ2)
  const handleFirePersonnel = (position: GovernmentPosition) => {
    const targetId = viewingCountryId;
    setCountriesPolitical((prev) => {
      const targetCountry = prev[targetId] || getOrInitCountryData(targetId);
      const res = firePersonnelFromPosition(targetCountry.government, position);
      if (res.success && res.updatedGovernment) {
        return {
          ...prev,
          [targetId]: {
            ...targetCountry,
            government: res.updatedGovernment,
          },
        };
      }
      return prev;
    });
  };

  // Người chơi khởi công xây dựng nhà máy mới (GĐ4) kết nối trừ ngân sách (GĐ3)
  const handleBuildFactory = (provinceId: string, type: FactoryType) => {
    const targetId = viewingCountryId;
    const spec = getFactorySpec(type, 1);
    const countryEco = economies[targetId] || getOrInitCountryEconomy(targetId);

    if (countryEco.treasury < spec.buildCostUSD) {
      return;
    }

    // Trừ chi phí xây dựng từ ngân sách quốc gia
    setEconomies((prev) => {
      const current = prev[targetId] || countryEco;
      const newTreasury = current.treasury - spec.buildCostUSD;
      return {
        ...prev,
        [targetId]: {
          ...current,
          treasury: newTreasury,
        },
      };
    });

    if (playerCountry?.id === targetId) {
      setBudgetTransactions((prev) => [
        ...prev.slice(-150),
        {
          id: `tx_fac_build_${Date.now()}`,
          countryId: targetId,
          date: currentDate,
          type: 'factory_maintenance',
          category: 'expense',
          amountUSD: spec.buildCostUSD,
          balanceAfterUSD: countryEco.treasury - spec.buildCostUSD,
          description: `Khởi công xây dựng nhà máy ${type} cấp 1`,
        },
      ]);
    }

    const newFac = createNewFactoryInstance(targetId, provinceId, type, currentDate);
    const costRecord = recordOneTimeFactoryCost(
      targetId,
      provinceId,
      type,
      1,
      'construction',
      spec.buildCostUSD,
      currentDate
    );
    setCostRecords((prev) => [...prev, costRecord]);
    setFactories((prev) => [...prev, newFac]);
  };

  // Người chơi nâng cấp nhà máy (GĐ4) kết nối trừ ngân sách (GĐ3)
  const handleUpgradeFactory = (factoryId: string) => {
    setFactories((prev) => {
      const target = prev.find((f) => f.id === factoryId);
      if (!target) return prev;
      const nextLevel = (target.targetLevel || target.currentLevel + 1) as 2 | 3 | 4;
      const spec = getFactorySpec(target.type, nextLevel);
      const countryEco = economies[target.countryId] || getOrInitCountryEconomy(target.countryId);

      if (countryEco.treasury < spec.buildCostUSD) {
        return prev;
      }

      setEconomies((prevEco) => {
        const current = prevEco[target.countryId] || countryEco;
        return {
          ...prevEco,
          [target.countryId]: {
            ...current,
            treasury: current.treasury - spec.buildCostUSD,
          },
        };
      });

      if (playerCountry?.id === target.countryId) {
        setBudgetTransactions((prevT) => [
          ...prevT.slice(-150),
          {
            id: `tx_fac_up_${Date.now()}`,
            countryId: target.countryId,
            date: currentDate,
            type: 'factory_maintenance',
            category: 'expense',
            amountUSD: spec.buildCostUSD,
            balanceAfterUSD: countryEco.treasury - spec.buildCostUSD,
            description: `Nâng cấp nhà máy ${target.type} lên cấp ${nextLevel}`,
          },
        ]);
      }

      const upgraded = startFactoryUpgrade(target, currentDate);
      const costRecord = recordOneTimeFactoryCost(
        upgraded.countryId,
        upgraded.provinceId,
        upgraded.type,
        nextLevel,
        'upgrade',
        spec.buildCostUSD,
        currentDate
      );
      setCostRecords((c) => [...c, costRecord]);
      return prev.map((f) => (f.id === factoryId ? upgraded : f));
    });
  };

  // Cập nhật mức thuế quốc gia (GĐ3)
  const handleUpdateTaxRate = (newRate: number) => {
    const targetId = viewingCountryId;
    setEconomies((prev) => {
      const current = prev[targetId] || getOrInitCountryEconomy(targetId);
      const ministerAbility =
        countriesPolitical[targetId]?.government.financeMinister?.managementAbility;
      const { netDailyUSD } = calculateDailyTaxCollection(
        current.population,
        newRate,
        currentDate.month,
        currentDate.year,
        ministerAbility
      );
      const monthlyGross = current.population * newRate;

      return {
        ...prev,
        [targetId]: {
          ...current,
          taxRate: newRate,
          monthlyTaxGross: monthlyGross,
          dailyTaxNet: netDailyUSD,
          dailyNetCashFlow: netDailyUSD - current.dailyFactoryMaintenance,
        },
      };
    });
  };

  // Người chơi giải ngân cho quốc gia khác vay (GĐ3)
  const handleLendMoney = (
    borrowerId: string,
    principal: number,
    rate: number,
    termDays: LoanTermDays
  ) => {
    const lenderId = playerCountry?.id || viewingCountryId;
    const lenderEco = economies[lenderId] || getOrInitCountryEconomy(lenderId);
    const borrowerEco = economies[borrowerId] || getOrInitCountryEconomy(borrowerId);

    const res = disburseNewLoan(lenderEco, borrowerEco, principal, rate, termDays, currentDate);
    if (res.success && res.contract && res.updatedLenderTreasury !== undefined && res.updatedBorrowerTreasury !== undefined) {
      setEconomies((prev) => ({
        ...prev,
        [lenderId]: {
          ...lenderEco,
          treasury: res.updatedLenderTreasury!,
        },
        [borrowerId]: {
          ...borrowerEco,
          treasury: res.updatedBorrowerTreasury!,
        },
      }));

      setLoanContracts((prev) => [...prev, res.contract!]);

      setBudgetTransactions((prev) => [
        ...prev.slice(-150),
        {
          id: `tx_lend_${Date.now()}`,
          countryId: lenderId,
          date: currentDate,
          type: 'loan_disbursement_out',
          category: 'expense',
          amountUSD: principal,
          balanceAfterUSD: res.updatedLenderTreasury!,
          description: `Giải ngân cho ${borrowerEco.countryName} vay (${rate}%/năm, ${termDays} ngày)`,
        },
      ]);
    }
  };

  // Người chơi đề nghị vay vốn từ quốc gia khác (GĐ3)
  const handleBorrowMoney = (
    lenderId: string,
    principal: number,
    rate: number,
    termDays: LoanTermDays
  ) => {
    const borrowerId = playerCountry?.id || viewingCountryId;
    const lenderEco = economies[lenderId] || getOrInitCountryEconomy(lenderId);
    const borrowerEco = economies[borrowerId] || getOrInitCountryEconomy(borrowerId);

    const res = disburseNewLoan(lenderEco, borrowerEco, principal, rate, termDays, currentDate);
    if (res.success && res.contract && res.updatedLenderTreasury !== undefined && res.updatedBorrowerTreasury !== undefined) {
      setEconomies((prev) => ({
        ...prev,
        [lenderId]: {
          ...lenderEco,
          treasury: res.updatedLenderTreasury!,
        },
        [borrowerId]: {
          ...borrowerEco,
          treasury: res.updatedBorrowerTreasury!,
        },
      }));

      setLoanContracts((prev) => [...prev, res.contract!]);

      setBudgetTransactions((prev) => [
        ...prev.slice(-150),
        {
          id: `tx_borrow_${Date.now()}`,
          countryId: borrowerId,
          date: currentDate,
          type: 'loan_disbursement_in',
          category: 'income',
          amountUSD: principal,
          balanceAfterUSD: res.updatedBorrowerTreasury!,
          description: `Nhận giải ngân khoản vay từ ${lenderEco.countryName} (${rate}%/năm, ${termDays} ngày)`,
        },
      ]);
    }
  };

  // Mở trang chính trị từ bản đồ
  const handleOpenPoliticsFromMap = (country: SelectedCountry) => {
    setViewingCountryId(country.id);
    setCurrentPage('politics');
  };

  // Mở trang kinh tế từ bản đồ
  const handleOpenEconomyFromMap = (country: SelectedCountry) => {
    setViewingCountryId(country.id);
    setCurrentPage('economy');
  };

  // Danh sách các quốc gia có sẵn cho bộ chọn
  const availableCountriesList = useMemo(() => {
    return Object.entries(COUNTRY_NAMES_VI).map(([nameEn, nameVi]) => ({
      id: nameEn,
      name: nameEn,
      nameVi,
    }));
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Resource Bar */}
      <TopResourceBar
        playerCountry={playerCountry}
        playerEconomy={playerCountry ? (economies[playerCountry.id] || getOrInitCountryEconomy(playerCountry.id)) : null}
      />

      {/* Main Container */}
      <div className="relative flex-1 w-full h-[calc(100vh-45px)] overflow-hidden">
        {/* Floating Controls Overlay (Visible across all views) */}
        <div className="absolute top-3 left-4 right-4 flex items-start justify-between pointer-events-none z-30 space-x-2">
          {/* Menu button on left */}
          <div className="pointer-events-auto shrink-0">
            <MainMenu
              currentPage={currentPage}
              onSelectPage={(page) => {
                if (page === 'politics' || page === 'factories' || page === 'economy') {
                  setViewingCountryId(playerCountry?.id || selectedCountry?.id || '704');
                }
                setCurrentPage(page);
              }}
              onNewGame={handleNewGame}
            />
          </div>

          {/* Search bar in center (Chỉ hiển thị khi đang trong giai đoạn chọn quốc gia khởi đầu) */}
          {isSelectingStartingCountry && (
            <div className="pointer-events-auto flex-1 max-w-sm sm:max-w-md mx-2">
              <CountrySearchBar
                isSelectingStartingCountry={isSelectingStartingCountry}
                onSelectCountry={(country) => {
                  setSelectedCountry(country);
                  if (currentPage === 'politics' || currentPage === 'factories' || currentPage === 'economy') {
                    setViewingCountryId(country.id);
                  }
                }}
              />
            </div>
          )}

          {/* Time control on right */}
          <div className="pointer-events-auto shrink-0">
            <TimeControl
              currentDate={currentDate}
              currentSpeed={currentSpeed}
              onSpeedChange={setCurrentSpeed}
            />
          </div>
        </div>

        {/* 2. Main Viewport Area */}
        {/* Keep MapPage mounted so map state, zoom and position are preserved */}
        <div
          className={`w-full h-full ${
            currentPage === 'map' ? 'block' : 'hidden'
          }`}
        >
          <MapPage
            playerCountry={playerCountry}
            selectedCountry={selectedCountry}
            selectedCountryEconomy={selectedCountry ? (economies[selectedCountry.id] || getOrInitCountryEconomy(selectedCountry.id)) : null}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
            }}
            isSelectingStartingCountry={isSelectingStartingCountry}
            onConfirmPlayerCountry={handleConfirmPlayerCountry}
            onOpenPolitics={handleOpenPoliticsFromMap}
            onOpenEconomy={handleOpenEconomyFromMap}
          />
        </div>

        {/* GIAI ĐOẠN 2: CHÍNH TRỊ VÀ BỘ MÁY NHÀ NƯỚC */}
        {currentPage === 'politics' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <PoliticsPage
              countryData={getOrInitCountryData(viewingCountryId)}
              playerCountry={playerCountry}
              selectedCountry={selectedCountry}
              onSelectCountryView={(countryId) => setViewingCountryId(countryId)}
              onHire={handleHirePersonnel}
              onFire={handleFirePersonnel}
              onBackToMap={handleBackToMap}
              availableCountries={availableCountriesList}
            />
          </div>
        )}

        {/* GIAI ĐOẠN 4: HỆ THỐNG NHÀ MÁY */}
        {currentPage === 'factories' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <FactoryPage
              countryId={viewingCountryId}
              countryName={getCountryDisplayName(viewingCountryId)}
              provinces={getProvincesForCountry(viewingCountryId, getCountryDisplayName(viewingCountryId))}
              factories={factories}
              playerCountry={playerCountry}
              selectedCountry={selectedCountry}
              onSelectCountryView={(cId) => setViewingCountryId(cId)}
              onBuildFactory={handleBuildFactory}
              onUpgradeFactory={handleUpgradeFactory}
              onBackToMap={handleBackToMap}
              availableCountries={availableCountriesList}
            />
          </div>
        )}

        {/* GIAI ĐOẠN 3: KINH TẾ VÀ NGÂN SÁCH QUỐC GIA */}
        {currentPage === 'economy' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <EconomyPage
              countryId={viewingCountryId}
              countryName={getCountryDisplayName(viewingCountryId)}
              economy={getOrInitCountryEconomy(viewingCountryId)}
              allEconomies={economies}
              politicalData={countriesPolitical[viewingCountryId]}
              playerCountry={playerCountry}
              selectedCountry={selectedCountry}
              contracts={loanContracts}
              transactions={budgetTransactions}
              currentDate={currentDate}
              onUpdateTaxRate={handleUpdateTaxRate}
              onSelectCountryView={(cId) => setViewingCountryId(cId)}
              onLendMoney={handleLendMoney}
              onBorrowMoney={handleBorrowMoney}
              onBackToMap={handleBackToMap}
              availableCountries={availableCountriesList}
            />
          </div>
        )}

        {currentPage === 'military' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <MilitaryPage onBackToMap={handleBackToMap} />
          </div>
        )}

        {currentPage === 'diplomacy' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <DiplomacyPage onBackToMap={handleBackToMap} />
          </div>
        )}

        {currentPage === 'technology' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <TechnologyPage onBackToMap={handleBackToMap} />
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <SettingsPage onBackToMap={handleBackToMap} />
          </div>
        )}
      </div>
    </div>
  );
}
