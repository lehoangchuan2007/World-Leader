import React from 'react';
import { Play, FastForward, Pause, Calendar } from 'lucide-react';
import { GameDate, TimeSpeed } from '../types/game';
import { formatGameDate } from '../systems/timeSystem';

interface TimeControlProps {
  currentDate: GameDate;
  currentSpeed: TimeSpeed;
  onSpeedChange: (speed: TimeSpeed) => void;
}

export const TimeControl: React.FC<TimeControlProps> = ({
  currentDate,
  currentSpeed,
  onSpeedChange,
}) => {
  const { dayStr, monthStr, yearStr } = formatGameDate(currentDate);

  return (
    <div className="flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3.5 py-2 shadow-xl select-none">
      {/* Date Display */}
      <div className="flex items-center space-x-2.5 pr-3 border-r border-slate-700/80">
        <div className="p-1.5 rounded bg-slate-800 text-amber-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex items-baseline space-x-1.5 font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Ngày</span>
            <span className="text-sm font-bold text-slate-100">{dayStr}</span>
          </div>
          <span className="text-slate-600 font-bold">/</span>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Tháng</span>
            <span className="text-sm font-bold text-slate-100">{monthStr}</span>
          </div>
          <span className="text-slate-600 font-bold">/</span>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Năm</span>
            <span className="text-sm font-bold text-amber-400">{yearStr}</span>
          </div>
        </div>
      </div>

      {/* Speed Controls: Pause, X1, X2 */}
      <div className="flex items-center space-x-1">
        {/* Pause Button */}
        <button
          type="button"
          onClick={() => onSpeedChange('pause')}
          title="Tạm dừng thời gian"
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
            currentSpeed === 'pause'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
          <span>Pause</span>
        </button>

        {/* X1 Button: 1 game day = 2s */}
        <button
          type="button"
          onClick={() => onSpeedChange('x1')}
          title="Tốc độ bình thường (1 ngày = 2 giây)"
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
            currentSpeed === 'x1'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>X1</span>
        </button>

        {/* X2 Button: 1 game day = 1s */}
        <button
          type="button"
          onClick={() => onSpeedChange('x2')}
          title="Tốc độ nhanh (1 ngày = 1 giây)"
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
            currentSpeed === 'x2'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <FastForward className="w-3.5 h-3.5 fill-current" />
          <span>X2</span>
        </button>
      </div>
    </div>
  );
};
