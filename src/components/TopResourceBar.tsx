import React from 'react';
import { DollarSign, Wheat, Fuel, Atom, Flag } from 'lucide-react';
import { CountryFlag } from './CountryFlag';
import { PlayerCountry } from '../types/game';

interface TopResourceBarProps {
  playerCountry?: PlayerCountry | null;
}

export const TopResourceBar: React.FC<TopResourceBarProps> = ({
  playerCountry,
}) => {
  const resources = [
    {
      id: 'money',
      name: 'Tiền',
      unit: 'USD',
      value: '-',
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      id: 'food',
      name: 'Lương thực',
      unit: 'tấn',
      value: '-',
      icon: Wheat,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      id: 'oil',
      name: 'Dầu',
      unit: 'thùng',
      value: '-',
      icon: Fuel,
      color: 'text-sky-400',
      bgColor: 'bg-sky-400/10 border-sky-400/20',
    },
    {
      id: 'uranium',
      name: 'Uranium',
      unit: 'kg',
      value: '-',
      icon: Atom,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10 border-purple-400/20',
    },
  ];

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-200 px-4 py-2 flex items-center justify-between shadow-lg select-none z-30 relative">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-black text-sm tracking-widest text-slate-100 uppercase hidden sm:inline">
            WORLD LEADER
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-medium border border-slate-700/60">
            GĐ1
          </span>
        </div>

        {/* Player Chosen Country Indicator (Locked once selected, no 'Đổi' button) */}
        {playerCountry ? (
          <div
            className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold"
            title={`Quốc gia đang lãnh đạo: ${playerCountry.nameVi}`}
          >
            <CountryFlag
              countryId={playerCountry.id}
              countryName={playerCountry.name}
              size="sm"
            />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {playerCountry.nameVi}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Đang chọn quốc gia</span>
          </div>
        )}
      </div>

      {/* 4 Required Phase 1 Resources - all strictly displaying "-" */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {resources.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border text-xs sm:text-sm font-medium ${item.bgColor}`}
              title={`${item.name} (${item.unit}) - Chưa triển khai ở Giai đoạn 1`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
              <div className="flex items-baseline space-x-1">
                <span className="text-slate-400 text-xs hidden sm:inline">
                  {item.name}:
                </span>
                <span className="font-mono font-bold text-slate-100 px-1">
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {item.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>


    </header>
  );
};
