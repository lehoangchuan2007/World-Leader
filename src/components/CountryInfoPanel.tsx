import React from 'react';
import {
  X,
  Users,
  DollarSign,
  Wheat,
  Fuel,
  Atom,
  CheckCircle2,
  Shield,
  ArrowRight,
  Landmark,
  Coins,
} from 'lucide-react';
import { CountryFlag } from './CountryFlag';
import { SelectedCountry, PlayerCountry } from '../types/game';
import { getCountryPoliticalRegime } from '../data/politicalData';
import { CountryEconomy } from '../types/economy';

interface CountryInfoPanelProps {
  country: SelectedCountry;
  playerCountry: PlayerCountry | null;
  isSelectingStartingCountry: boolean;
  onConfirmAsPlayerCountry: (country: SelectedCountry) => void;
  onClose: () => void;
  onOpenPolitics?: (country: SelectedCountry) => void;
  onOpenEconomy?: (country: SelectedCountry) => void;
  economy?: CountryEconomy | null;
}

export const CountryInfoPanel: React.FC<CountryInfoPanelProps> = ({
  country,
  playerCountry,
  isSelectingStartingCountry,
  onConfirmAsPlayerCountry,
  onClose,
  onOpenPolitics,
  onOpenEconomy,
  economy,
}) => {
  const isPlayer = playerCountry?.id === country.id;

  // Basic stats: Cờ, Tên, Dân số (G3), Tiền (G3), Lương thực (G4/G9), Dầu (G4/G9), Uranium (G4/G9)
  const populationFormatted = economy
    ? Math.round(economy.population).toLocaleString('vi-VN')
    : '-';
  const moneyFormatted = economy
    ? `$${Math.round(economy.treasury).toLocaleString('vi-VN')}`
    : '-';

  const stats = [
    {
      id: 'population',
      label: 'Dân số (Hiện đại)',
      value: populationFormatted,
      unit: economy ? 'người' : '',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'money',
      label: 'Ngân sách quốc gia',
      value: moneyFormatted,
      unit: economy ? 'USD' : '',
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'food',
      label: 'Lương thực',
      value: '-',
      unit: 'tấn',
      icon: Wheat,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'oil',
      label: 'Dầu',
      value: '-',
      unit: 'thùng',
      icon: Fuel,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'uranium',
      label: 'Uranium',
      value: '-',
      unit: 'kg',
      icon: Atom,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="absolute right-4 top-16 w-80 sm:w-88 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-right-4 duration-200 select-none">
      {/* Header with National Flag & Country Name */}
      <div className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-slate-950/80 to-slate-900/90 border-b border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Đóng bảng thông tin"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3.5">
          <div className="shrink-0 p-1 bg-slate-800 rounded-lg border border-slate-700 shadow-md">
            <CountryFlag
              countryId={country.id}
              countryName={country.name}
              size="lg"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                Quốc gia
              </span>
              {isPlayer && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 flex items-center space-x-1">
                  <Shield className="w-2.5 h-2.5" />
                  <span>Của bạn</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white truncate leading-tight">
              {country.nameVi}
            </h2>
            {country.name !== country.nameVi && (
              <p className="text-xs text-slate-400 truncate font-mono">
                {country.name}
              </p>
            )}
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                Thể chế: {getCountryPoliticalRegime(country.id, country.name).regime} (Cố định)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Country Stats Grid */}
      <div className="p-4 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Thông tin cơ bản</span>
          <span className="text-[10px] text-slate-500 font-mono">Giai đoạn 1</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => {
            const Icon = s.icon;
            const isFullWidth = s.id === 'population';
            return (
              <div
                key={s.id}
                className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${s.bg} ${
                  isFullWidth ? 'col-span-2' : ''
                }`}
              >
                <div className={`p-1.5 rounded-lg bg-slate-900/60 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 font-medium">
                    {s.label}
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      {s.value}
                    </span>
                    {s.unit && (
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {s.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 leading-tight italic pt-1">
          * Các chỉ số kinh tế, dân số và tài nguyên đang để dấu &quot;-&quot; và sẽ được kích hoạt ở các giai đoạn tiếp theo.
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 space-y-2">
        {onOpenPolitics && (
          <button
            type="button"
            onClick={() => onOpenPolitics(country)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Xem bộ máy nhà nước (GĐ2)</span>
          </button>
        )}

        {onOpenEconomy && (
          <button
            type="button"
            onClick={() => onOpenEconomy(country)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xem kinh tế & ngân sách (GĐ3)</span>
          </button>
        )}

        {isSelectingStartingCountry ? (
          <button
            type="button"
            onClick={() => onConfirmAsPlayerCountry(country)}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98"
          >
            <span>Xác nhận & Bắt đầu chơi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : isPlayer ? (
          <div className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>Đang lãnh đạo quốc gia này</span>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Quốc gia độc lập</span>
          </div>
        )}
      </div>
    </div>
  );
};
