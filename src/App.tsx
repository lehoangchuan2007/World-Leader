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

  // Lưu lịch sử chi phí nhà máy (GĐ4)
  const [, setCostRecords] = useState<FactoryCostRecord[]>([]);

  // ID quốc gia đang được xem trong trang Chính trị hoặc Nhà máy
  const [viewingCountryId, setViewingCountryId] = useState<string>('704');

  // Lưu trạng thái nhà máy vào localStorage để khôi phục khi tải lại
  useEffect(() => {
    try {
      localStorage.setItem(FACTORIES_STORAGE_KEY, JSON.stringify(factories));
    } catch {
      // Bỏ qua nếu lỗi quota
    }
  }, [factories]);

  // Reference for stable speed state inside timer
  const speedRef = useRef(currentSpeed);
  speedRef.current = currentSpeed;

  const factoriesRef = useRef(factories);
  factoriesRef.current = factories;

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

        // 1. Tiến độ xây dựng & nâng cấp nhà máy mỗi ngày
        setFactories((prevFactories) => {
          const { updatedFactories } = advanceFactoriesOneDay(prevFactories, nextDate);
          return updatedFactories;
        });

        // 2. Ghi nhận chi phí duy trì hàng ngày của các nhà máy đang hoạt động
        setCostRecords((prevCosts) => {
          const dailyCosts = recordDailyMaintenanceCosts(factoriesRef.current, nextDate);
          return dailyCosts.length > 0 ? [...prevCosts, ...dailyCosts] : prevCosts;
        });

        // 3. Mỗi khi sang tháng mới (ngày 1), kích hoạt chu kỳ AI
        if (nextDate.day === 1 && nextDate.month !== prevDate.month) {
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
    localStorage.removeItem(FACTORIES_STORAGE_KEY);
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

  // Người chơi khởi công xây dựng nhà máy mới (GĐ4)
  const handleBuildFactory = (provinceId: string, type: FactoryType) => {
    const targetId = viewingCountryId;
    const newFac = createNewFactoryInstance(targetId, provinceId, type, currentDate);
    const spec = getFactorySpec(type, 1);
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

  // Người chơi nâng cấp nhà máy (GĐ4)
  const handleUpgradeFactory = (factoryId: string) => {
    setFactories((prev) => {
      const target = prev.find((f) => f.id === factoryId);
      if (!target) return prev;
      const upgraded = startFactoryUpgrade(target, currentDate);
      const nextLevel = (upgraded.targetLevel || upgraded.currentLevel + 1) as 2 | 3 | 4;
      const spec = getFactorySpec(upgraded.type, nextLevel);
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

  // Mở trang chính trị từ bản đồ
  const handleOpenPoliticsFromMap = (country: SelectedCountry) => {
    setViewingCountryId(country.id);
    setCurrentPage('politics');
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
                if (page === 'politics' || page === 'factories') {
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
                  if (currentPage === 'politics' || currentPage === 'factories') {
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
            onSelectCountry={(country) => {
              setSelectedCountry(country);
            }}
            isSelectingStartingCountry={isSelectingStartingCountry}
            onConfirmPlayerCountry={handleConfirmPlayerCountry}
            onOpenPolitics={handleOpenPoliticsFromMap}
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

        {/* Các trang GĐ3, GĐ5–GĐ8 vẫn là Placeholder theo đúng Quy tắc Khóa Phạm vi */}
        {currentPage === 'economy' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <EconomyPage onBackToMap={handleBackToMap} />
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
