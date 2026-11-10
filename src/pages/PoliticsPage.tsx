/**
 * WORLD LEADER - Giai đoạn 2: Trang Quản Lý Chính Trị & Bộ Máy Nhà Nước
 * Tuân thủ tuyệt đối quy định khóa phạm vi GĐ2:
 * 1. Khu vực A: Thể chế chính trị (5 loại cố định: Dân chủ, Cộng hòa, Quân chủ, Độc tài, Cộng sản).
 * 2. Khu vực B: Bộ máy nhà nước (Đúng 3 chức vụ: Thủ tướng, Bộ trưởng Bộ Tài chính, Bộ trưởng Bộ Quốc phòng).
 * 3. Bảng danh sách ứng viên: Sinh tự động, nhân vật hư cấu, sắp xếp theo 4 tiêu chí.
 * 4. Modal xác nhận sa thải, đưa chức vụ về "CHƯA BỔ NHIỆM", nút "THUÊ NHÂN SỰ".
 */

import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Shield,
  Coins,
  Crown,
  Lock,
  UserCheck,
  UserX,
  UserPlus,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';
import { CountryFlag } from '../components/CountryFlag';
import {
  Candidate,
  CandidateSortField,
  CountryPoliticalData,
  GovernmentPosition,
  Personnel,
  PoliticalRegime,
  POSITION_LABELS,
  SortOrder,
} from '../types/politics';
import { SelectedCountry, PlayerCountry } from '../types/game';
import { generateCandidateList } from '../systems/candidateGenerator';
import { REGIME_DESCRIPTIONS } from '../systems/politicalSystem';

interface PoliticsPageProps {
  countryData: CountryPoliticalData;
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  onSelectCountryView: (countryId: string) => void;
  onHire: (position: GovernmentPosition, candidate: Candidate) => void;
  onFire: (position: GovernmentPosition) => void;
  onBackToMap: () => void;
  availableCountries?: { id: string; name: string; nameVi: string }[];
}

export const PoliticsPage: React.FC<PoliticsPageProps> = ({
  countryData,
  playerCountry,
  selectedCountry,
  onSelectCountryView,
  onHire,
  onFire,
  onBackToMap,
  availableCountries = [],
}) => {
  // Modal states
  const [candidateModalPosition, setCandidateModalPosition] = useState<GovernmentPosition | null>(null);
  const [currentCandidates, setCurrentCandidates] = useState<Candidate[]>([]);
  const [sortField, setSortField] = useState<CandidateSortField>('managementAbility');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Confirmation modal for firing
  const [fireModalPosition, setFireModalPosition] = useState<GovernmentPosition | null>(null);

  // Success / info notice
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isPlayerCountry = playerCountry?.id === countryData.countryId;
  const canManage = isPlayerCountry || !playerCountry; // Nếu chưa chọn quốc gia khởi đầu, người chơi có thể thử nghiệm

  // Mở modal tuyển dụng ứng viên
  const handleOpenHireModal = (position: GovernmentPosition) => {
    const list = generateCandidateList(
      countryData.countryName,
      countryData.countryName,
      position,
      6
    );
    setCurrentCandidates(list);
    setCandidateModalPosition(position);
  };

  // Xác nhận tuyển dụng ứng viên
  const handleConfirmHire = (candidate: Candidate) => {
    if (!candidateModalPosition) return;
    onHire(candidateModalPosition, candidate);
    setActionNotice(
      `Đã bổ nhiệm ${candidate.fullName} vào chức vụ ${POSITION_LABELS[candidateModalPosition]}.`
    );
    setCandidateModalPosition(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Mở modal xác nhận sa thải
  const handleOpenFireModal = (position: GovernmentPosition) => {
    setFireModalPosition(position);
  };

  // Xác nhận sa thải
  const handleConfirmFire = () => {
    if (!fireModalPosition) return;
    const minister = countryData.government[fireModalPosition];
    onFire(fireModalPosition);
    setActionNotice(
      minister
        ? `Đã sa thải ${minister.fullName} khỏi chức vụ ${POSITION_LABELS[fireModalPosition]}. Chức vụ hiện đang trống.`
        : 'Đã miễn nhiệm chức vụ.'
    );
    setFireModalPosition(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Sắp xếp danh sách ứng viên theo đúng 4 tiêu chí quy định
  const sortedCandidates = useMemo(() => {
    return [...currentCandidates].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'fullName') {
        comparison = a.fullName.localeCompare(b.fullName, 'vi');
      } else if (sortField === 'nationality') {
        comparison = a.nationality.localeCompare(b.nationality, 'vi');
      } else if (sortField === 'age') {
        comparison = a.age - b.age;
      } else if (sortField === 'managementAbility') {
        comparison = a.managementAbility - b.managementAbility;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [currentCandidates, sortField, sortOrder]);

  const toggleSort = (field: CandidateSortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'managementAbility' ? 'desc' : 'asc');
    }
  };

  // Màu sắc & biểu tượng theo từng thể chế chính trị
  const getRegimeTheme = (regime: PoliticalRegime) => {
    switch (regime) {
      case 'Dân chủ':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          accent: 'text-emerald-400',
        };
      case 'Cộng hòa':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          accent: 'text-sky-400',
        };
      case 'Quân chủ':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-400',
        };
      case 'Độc tài':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          accent: 'text-purple-400',
        };
      case 'Cộng sản':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          accent: 'text-rose-400',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          badge: 'bg-slate-700 text-slate-200 border-slate-600',
          accent: 'text-slate-300',
        };
    }
  };

  const theme = getRegimeTheme(countryData.politicalRegime);
  const regimeInfo = REGIME_DESCRIPTIONS[countryData.politicalRegime];

  // Danh sách đúng 3 chức vụ được quy định trong GĐ2
  const positionsConfig: {
    id: GovernmentPosition;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'primeMinister',
      title: 'Thủ tướng',
      icon: Crown,
      accentColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
    {
      id: 'financeMinister',
      title: 'Bộ trưởng Bộ Tài chính',
      icon: Coins,
      accentColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      id: 'defenseMinister',
      title: 'Bộ trưởng Bộ Quốc phòng',
      icon: Shield,
      accentColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto px-4 py-4 sm:px-8 space-y-6 select-none">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-16 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Top Bar with Navigation & Country Switcher */}
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

          <div className="flex items-center space-x-2.5">
            <CountryFlag
              countryId={countryData.countryId}
              countryName={countryData.countryName}
              size="md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {countryData.countryName}
                </h1>
                {isPlayerCountry ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Quốc gia của bạn</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Quốc gia do AI quản lý
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Giai đoạn 2: Hệ thống chính trị và bộ máy nhà nước (Mốc lịch sử: 1925)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Country Switcher (Player can view own country or inspected country) */}
        {availableCountries.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Xem quốc gia:</span>
            <select
              value={countryData.countryId}
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

      {/* KHU VỰC A: THỂ CHẾ CHÍNH TRỊ (Political Regime) */}
      <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Khu vực A: Thể chế chính trị
              </h2>
              <p className="text-xs text-slate-400">
                Mỗi quốc gia có đúng một thể chế chính trị duy nhất, cố định trong dữ liệu game.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono text-slate-300">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-[11px] uppercase tracking-wide">TRẠNG THÁI CỐ ĐỊNH</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Thể chế chính */}
          <div className={`p-4 rounded-xl border ${theme.bg} flex flex-col justify-between space-y-2`}>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                Thể chế hiện hành
              </span>
              <div className="text-2xl font-black tracking-wide mt-1">
                {countryData.politicalRegime}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-700/40">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${theme.badge}`}>
                1 trong 5 thể chế chuẩn
              </span>
            </div>
          </div>

          {/* Card Định nghĩa thể chế */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-2 md:col-span-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center space-x-1">
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span>Đặc điểm & Phân loại</span>
              </span>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                {regimeInfo?.description || 'Phân loại thể chế trong hệ thống chính trị WORLD LEADER.'}
              </p>
            </div>

            {/* Historical basis note */}
            <div className="pt-2 border-t border-slate-800 flex items-start space-x-2 text-xs text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-300 font-medium">Căn cứ lịch sử mốc 1925: </span>
                <span className="text-slate-400 italic">
                  {countryData.historicalBasis || 'Theo dữ liệu lịch sử đầu thế kỷ 20.'}
                </span>
                {countryData.isVerified ? (
                  <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Đã xác minh lịch sử
                  </span>
                ) : (
                  <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Chưa có tư liệu xác minh 1925
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quy tắc thể chế */}
        <div className="px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Quy tắc GĐ2: Người chơi và AI không được thay đổi thể chế. Không có cơ chế bầu cử, cách mạng hoặc đảo chính. Thể chế lưu cố định.
          </span>
        </div>
      </section>

      {/* KHU VỰC B: BỘ MÁY NHÀ NƯỚC (State Apparatus / Government) */}
      <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Khu vực B: Bộ máy nhà nước
              </h2>
              <p className="text-xs text-slate-400">
                Gồm đúng 3 chức vụ nhân sự: Thủ tướng, Bộ trưởng Bộ Tài chính, Bộ trưởng Bộ Quốc phòng.
              </p>
            </div>
          </div>

          {!canManage && (
            <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Chế độ chỉ xem — AI đang quản lý quốc gia này</span>
            </div>
          )}
        </div>

        {/* 3 Chức vụ Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {positionsConfig.map((pos) => {
            const Icon = pos.icon;
            const personnel = countryData.government[pos.id];
            const isVacant = personnel === null;

            return (
              <div
                key={pos.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 hover:border-slate-700/80 transition-all shadow-lg relative overflow-hidden"
              >
                {/* Header chức vụ */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl border ${pos.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        {pos.title}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isVacant ? 'Vị trí đang bỏ trống' : 'Nhân sự chính thức'}
                      </span>
                    </div>
                  </div>

                  {/* Trạng thái Bổ nhiệm / Chưa bổ nhiệm */}
                  {isVacant ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      CHƯA BỔ NHIỆM
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                      <UserCheck className="w-3 h-3" />
                      <span>ĐÃ BỔ NHIỆM</span>
                    </span>
                  )}
                </div>

                {/* Thông tin nhân sự hoặc Trạng thái trống */}
                {isVacant ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                    <UserX className="w-8 h-8 text-slate-600" />
                    <p className="text-xs text-slate-400 font-medium">
                      Chức vụ hiện chưa có người đảm nhiệm.
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs px-2">
                      Nhấn nút bên dưới để chọn và bổ nhiệm ứng viên từ danh sách ứng viên hư cấu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Họ và tên
                      </div>
                      <div className="text-base font-black text-white truncate">
                        {personnel.fullName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">Quốc tịch</span>
                        <span className="font-bold text-slate-200 truncate block">
                          {personnel.nationality}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">Tuổi</span>
                        <span className="font-bold text-slate-200 block font-mono">
                          {personnel.age} tuổi
                        </span>
                      </div>
                    </div>

                    {/* Chỉ số năng lực quản lý (0 - 100) */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-slate-300 flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Năng lực quản lý</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {personnel.managementAbility} / 100
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, personnel.managementAbility))}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 italic mt-0.5 block">
                        * Chỉ số cố định, không tạo hiệu ứng kinh tế/quân sự ở GĐ2.
                      </span>
                    </div>
                  </div>
                )}

                {/* Nút thao tác: Thuê hoặc Sa thải */}
                <div className="pt-2">
                  {canManage ? (
                    isVacant ? (
                      <button
                        type="button"
                        onClick={() => handleOpenHireModal(pos.id)}
                        className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>THUÊ NHÂN SỰ</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenFireModal(pos.id)}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sa thải nhân sự</span>
                      </button>
                    )
                  ) : (
                    <div className="text-center py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-500 font-mono">
                      Quyền bổ nhiệm thuộc AI
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DANH SÁCH ỨNG VIÊN */}
      {candidateModalPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-2xl w-full max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Bổ nhiệm chức vụ
                </span>
                <h3 className="text-lg font-black text-white">
                  Danh sách ứng viên: {POSITION_LABELS[candidateModalPosition]}
                </h3>
                <p className="text-xs text-slate-400">
                  Các ứng viên hư cấu được hệ thống tự động tạo cho quốc gia {countryData.countryName}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCandidateModalPosition(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
              >
                Đóng
              </button>
            </div>

            {/* Sort Controls (Đúng 4 tiêu chí quy định: Họ tên, Quốc tịch, Tuổi, Năng lực quản lý) */}
            <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-medium">Sắp xếp theo:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { field: 'managementAbility', label: 'Năng lực quản lý' },
                    { field: 'fullName', label: 'Họ tên' },
                    { field: 'age', label: 'Tuổi' },
                    { field: 'nationality', label: 'Quốc tịch' },
                  ] as { field: CandidateSortField; label: string }[]
                ).map((item) => (
                  <button
                    key={item.field}
                    type="button"
                    onClick={() => toggleSort(item.field)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      sortField === item.field
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    {sortField === item.field && (
                      <span className="text-[10px] font-mono ml-0.5">
                        ({sortOrder === 'asc' ? '↑' : '↓'})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate List Body */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {sortedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white text-base">
                        {candidate.fullName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Ứng viên hư cấu
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>Quốc tịch: <strong className="text-slate-300">{candidate.nationality}</strong></span>
                      <span>Tuổi: <strong className="text-slate-300">{candidate.age}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Management Ability indicator */}
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Năng lực quản lý
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="font-mono font-bold text-amber-400 text-base">
                          {candidate.managementAbility}
                        </span>
                        <span className="text-xs text-slate-500">/ 100</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConfirmHire(candidate)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      Thuê
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setCandidateModalPosition(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN SA THẢI */}
      {fireModalPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Xác nhận sa thải?
                </h3>
                <p className="text-xs text-slate-400">
                  Miễn nhiệm chức vụ {POSITION_LABELS[fireModalPosition]}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>
                Bạn có chắc chắn muốn sa thải{' '}
                <strong className="text-rose-400 font-bold">
                  {countryData.government[fireModalPosition]?.fullName}
                </strong>{' '}
                khỏi vị trí{' '}
                <strong className="text-white font-bold">
                  {POSITION_LABELS[fireModalPosition]}
                </strong>?
              </p>
              <p className="text-slate-400 pt-1">
                Sau khi sa thải, vị trí này sẽ chuyển sang trạng thái <strong>&quot;CHƯA BỔ NHIỆM&quot;</strong>. Hệ thống <strong>không tự động tuyển người thay thế</strong>. Bạn sẽ cần chủ động thuê nhân sự mới khi sẵn sàng.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setFireModalPosition(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmFire}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-500/20"
              >
                Xác nhận sa thải
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
