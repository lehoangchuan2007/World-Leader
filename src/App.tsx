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
import { initializeCountryPoliticalData } from './data/governmentData';
import {
  hirePersonnelForPosition,
  firePersonnelFromPosition,
  runAiGovernmentTick,
} from './systems/governmentSystem';
import { COUNTRY_NAMES_VI, getCountryNameVi } from './data/countryNamesVi';

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

  // State lưu trữ dữ liệu chính trị và bộ máy nhà nước của toàn bộ quốc gia
  const [countriesPolitical, setCountriesPolitical] = useState<Record<string, CountryPoliticalData>>(
    () => buildInitialCountriesMap()
  );

  // ID quốc gia đang được xem trong trang Chính trị
  const [viewingCountryId, setViewingCountryId] = useState<string>('704');

  // Reference for stable speed state inside timer
  const speedRef = useRef(currentSpeed);
  speedRef.current = currentSpeed;

  // Lấy hoặc khởi tạo dữ liệu chính trị cho một quốc gia bất kỳ nếu chưa có trong bộ nhớ
  const getOrInitCountryData = useCallback((countryId: string): CountryPoliticalData => {
    if (countriesPolitical[countryId]) {
      return countriesPolitical[countryId];
    }

    // Tìm tên quốc gia từ tên được chọn hoặc từ bảng dịch
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

  // Real-time calendar progression engine & AI government management tick
  useEffect(() => {
    if (currentSpeed === 'pause') return;

    const intervalMs = SPEED_INTERVALS[currentSpeed];
    const timer = setInterval(() => {
      setCurrentDate((prevDate) => {
        const nextDate = advanceOneDay(prevDate);

        // Mỗi khi sang tháng mới (ngày 1), kích hoạt chu kỳ quản lý nhân sự AI tối thiểu cho các quốc gia AI
        if (nextDate.day === 1 && nextDate.month !== prevDate.month) {
          setCountriesPolitical((prevData) => {
            const { updatedCountries, changedCountryIds } = runAiGovernmentTick(
              prevData,
              playerCountry?.id || null
            );
            return changedCountryIds.length > 0 ? updatedCountries : prevData;
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
    setCurrentPage('map');
  };

  // Người chơi thuê nhân sự cho chức vụ
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

  // Người chơi sa thải nhân sự
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

  // Mở trang chính trị cho một quốc gia cụ thể từ bản đồ
  const handleOpenPoliticsFromMap = (country: SelectedCountry) => {
    setViewingCountryId(country.id);
    setCurrentPage('politics');
  };

  // Danh sách các quốc gia có sẵn cho bộ chọn trên trang Chính trị
  const availableCountriesList = useMemo(() => {
    return Object.entries(COUNTRY_NAMES_VI).map(([nameEn, nameVi]) => ({
      id: nameEn,
      name: nameEn,
      nameVi,
    }));
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Resource Bar (Giữ nguyên quy chuẩn GĐ1) */}
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
                if (page === 'politics') {
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
                  if (currentPage === 'politics') {
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

        {/* Các trang GĐ3–GĐ8 vẫn là Placeholder theo đúng Quy tắc Khóa Phạm vi */}
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
