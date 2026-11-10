/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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

  // Selected Country State (Mặc định gợi ý Việt Nam khi mở game để người chơi có thể xác nhận ngay hoặc nhấp/gõ quốc gia khác)
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>({
    id: '704',
    name: 'Vietnam',
    nameVi: 'Việt Nam',
  });

  // Reference for stable speed state inside timer
  const speedRef = useRef(currentSpeed);
  speedRef.current = currentSpeed;

  // Real-time calendar progression engine
  useEffect(() => {
    if (currentSpeed === 'pause') return;

    const intervalMs = SPEED_INTERVALS[currentSpeed];
    const timer = setInterval(() => {
      setCurrentDate((prevDate) => advanceOneDay(prevDate));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentSpeed]);

  const handleBackToMap = () => {
    setCurrentPage('map');
  };

  const handleConfirmPlayerCountry = (country: SelectedCountry) => {
    setPlayerCountry(country);
    setSelectedCountry(country);
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
    setCurrentPage('map');
  };

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
              onSelectPage={setCurrentPage}
              onNewGame={handleNewGame}
            />
          </div>

          {/* Search bar in center (Gõ tên hoặc chọn trực tiếp trên bản đồ) */}
          <div className="pointer-events-auto flex-1 max-w-sm sm:max-w-md mx-2">
            <CountrySearchBar
              isSelectingStartingCountry={isSelectingStartingCountry}
              onSelectCountry={(country) => {
                setSelectedCountry(country);
              }}
            />
          </div>

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
        {/* Keep MapPage mounted so map state, zoom and position are preserved when visiting placeholders */}
        <div
          className={`w-full h-full ${
            currentPage === 'map' ? 'block' : 'hidden'
          }`}
        >
          <MapPage
            playerCountry={playerCountry}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            isSelectingStartingCountry={isSelectingStartingCountry}
            onConfirmPlayerCountry={handleConfirmPlayerCountry}
          />
        </div>

        {/* Placeholder Pages */}
        {currentPage === 'politics' && (
          <div className="w-full h-full pt-16 flex flex-col">
            <PoliticsPage onBackToMap={handleBackToMap} />
          </div>
        )}

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
