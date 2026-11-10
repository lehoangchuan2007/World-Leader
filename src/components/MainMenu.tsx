import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Globe2,
  Landmark,
  Coins,
  Shield,
  Handshake,
  Cpu,
  Settings,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ActivePage } from '../types/game';

interface MainMenuProps {
  currentPage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  onNewGame?: () => void;
}

interface MenuItem {
  id: ActivePage;
  name: string;
  phaseNote: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentPage,
  onSelectPage,
  onNewGame,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'politics',
      name: 'Chính trị',
      phaseNote: 'GĐ2',
      icon: Landmark,
    },
    {
      id: 'economy',
      name: 'Kinh tế',
      phaseNote: 'GĐ3',
      icon: Coins,
    },
    {
      id: 'military',
      name: 'Quân sự',
      phaseNote: 'GĐ7',
      icon: Shield,
    },
    {
      id: 'diplomacy',
      name: 'Ngoại giao',
      phaseNote: 'GĐ6',
      icon: Handshake,
    },
    {
      id: 'technology',
      name: 'Công nghệ',
      phaseNote: 'GĐ5',
      icon: Cpu,
    },
    {
      id: 'settings',
      name: 'Cài đặt',
      phaseNote: 'Hệ thống',
      icon: Settings,
    },
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeItem = menuItems.find((item) => item.id === currentPage);

  const handleConfirmNewGame = () => {
    setShowConfirmNewGame(false);
    onNewGame?.();
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        {/* Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-lg px-3.5 py-2 shadow-xl text-slate-200 text-sm font-semibold transition-all select-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-amber-400" />
          ) : (
            <Menu className="w-4 h-4 text-amber-400" />
          )}
          <span>Menu</span>
          {currentPage !== 'map' && activeItem && (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {activeItem.name}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Danh mục quản lý</span>
              <span className="text-[10px] text-amber-500 font-mono font-normal">GĐ1</span>
            </div>

            <div className="p-1.5 space-y-0.5">
              {/* Quick return to map if currently in a placeholder page */}
              <button
                type="button"
                onClick={() => {
                  onSelectPage('map');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'map'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Globe2 className="w-4 h-4 text-amber-400" />
                  <span>Bản đồ thế giới</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Chính
                </span>
              </button>

              <div className="my-1 border-t border-slate-800/80" />

              {/* 6 Required Sub-menus */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectPage(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isSelected
                            ? 'text-amber-400'
                            : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500 group-hover:text-slate-400'
                      }`}
                    >
                      {item.phaseNote}
                    </span>
                  </button>
                );
              })}

              <div className="my-1 border-t border-slate-800/80" />

              {/* Tạo ván mới action */}
              <button
                type="button"
                onClick={() => {
                  setShowConfirmNewGame(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <RotateCcw className="w-4 h-4 text-rose-400 group-hover:rotate-[-45deg] transition-transform" />
                  <span>Tạo ván mới</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Reset
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Creating New Game */}
      {showConfirmNewGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Tạo ván mới?
                </h3>
                <p className="text-xs text-slate-400">
                  Bắt đầu lại ván chơi mới từ đầu
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn tạo ván mới? Toàn bộ tiến trình sẽ được thiết lập lại từ thời điểm <strong>01/01/1925</strong> và bạn sẽ được <strong>chọn lại quốc gia khởi đầu mới</strong> trên bản đồ.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmNewGame(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmNewGame}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xác nhận tạo ván mới</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
