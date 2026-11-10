/**
 * WORLD LEADER - Giai đoạn 4: Trang Quản Lý Hệ Thống Nhà Máy (Factory Management Page)
 * Đơn vị xây dựng: TỈNH (Province).
 * Đúng 3 loại nhà máy: Dầu (4 cấp), Lương thực (4 cấp), Uranium (1 cấp, cần mỏ).
 * Hiển thị tổng sản lượng (số 0 nếu chưa có, không dùng '-').
 */

import React, { useState, useMemo } from 'react';
import {
  Factory,
  Wheat,
  Fuel,
  Atom,
  DollarSign,
  Clock,
  ArrowUpCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Shield,
  Layers,
  Sparkles,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import {
  FactoryInstance,
  FactoryType,
  Province,
} from '../types/factory';
import { PlayerCountry, SelectedCountry } from '../types/game';
import {
  getFactorySpec,
  OIL_FACTORY_SPECS,
  FOOD_FACTORY_SPECS,
  URANIUM_FACTORY_SPEC,
} from '../data/factorySpecs';
import {
  checkCanBuildFactory,
  checkCanUpgradeFactory,
} from '../systems/factoryConstructionSystem';
import { calculateCountryFactorySummary } from '../systems/factoryProductionSystem';

interface FactoryPageProps {
  countryId: string;
  countryName: string;
  provinces: Province[];
  factories: FactoryInstance[];
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  onSelectCountryView: (countryId: string) => void;
  onBuildFactory: (provinceId: string, type: FactoryType) => void;
  onUpgradeFactory: (factoryId: string) => void;
  onBackToMap: () => void;
  availableCountries?: { id: string; name: string; nameVi: string }[];
}

export const FactoryPage: React.FC<FactoryPageProps> = ({
  countryId,
  countryName,
  provinces,
  factories,
  playerCountry,
  onSelectCountryView,
  onBuildFactory,
  onUpgradeFactory,
  onBackToMap,
  availableCountries = [],
}) => {
  // Tỉnh đang được chọn để xem chi tiết
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);

  // Modal xác nhận xây dựng / nâng cấp
  const [confirmBuildTarget, setConfirmBuildTarget] = useState<{
    provinceId: string;
    provinceName: string;
    type: FactoryType;
  } | null>(null);

  const [confirmUpgradeTarget, setConfirmUpgradeTarget] = useState<{
    factory: FactoryInstance;
    provinceName: string;
  } | null>(null);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isPlayerCountry = playerCountry?.id === countryId;
  const canManage = isPlayerCountry || !playerCountry; // Nếu chưa chọn quốc gia khởi đầu, cho phép trải nghiệm

  // 1. Tính toán tổng sản lượng và chi phí của quốc gia đang xem
  const summary = useMemo(() => {
    return calculateCountryFactorySummary(factories, countryId);
  }, [factories, countryId]);

  // Các nhà máy của quốc gia đang xem
  const countryFactories = useMemo(() => {
    return factories.filter((f) => f.countryId === countryId);
  }, [factories, countryId]);

  // Tỉnh hiện đang được chọn xem chi tiết
  const selectedProvince = useMemo(() => {
    return provinces.find((p) => p.id === selectedProvinceId) || null;
  }, [provinces, selectedProvinceId]);

  // Danh sách nhà máy tại tỉnh đang chọn
  const factoriesInSelectedProvince = useMemo(() => {
    if (!selectedProvinceId) return [];
    return countryFactories.filter((f) => f.provinceId === selectedProvinceId);
  }, [countryFactories, selectedProvinceId]);

  // Thực hiện xây dựng sau khi xác nhận
  const handleConfirmBuild = () => {
    if (!confirmBuildTarget) return;
    onBuildFactory(confirmBuildTarget.provinceId, confirmBuildTarget.type);
    const spec = getFactorySpec(confirmBuildTarget.type, 1);
    showToast(`Đã bắt đầu khởi công ${spec.name} tại tỉnh ${confirmBuildTarget.provinceName}!`);
    setConfirmBuildTarget(null);
  };

  // Thực hiện nâng cấp sau khi xác nhận
  const handleConfirmUpgrade = () => {
    if (!confirmUpgradeTarget) return;
    const { factory, provinceName } = confirmUpgradeTarget;
    onUpgradeFactory(factory.id);
    const nextLevel = (factory.currentLevel + 1) as 2 | 3 | 4;
    const spec = getFactorySpec(factory.type, nextLevel);
    showToast(`Đã bắt đầu nâng cấp lên ${spec.name} tại tỉnh ${provinceName}!`);
    setConfirmUpgradeTarget(null);
  };

  // Hiển thị trạng thái nhà máy bằng nhãn màu sắc
  const renderStatusBadge = (factory: FactoryInstance) => {
    if (factory.status === 'building') {
      const progressPercent = Math.round((factory.daysElapsed / factory.totalDurationDays) * 100);
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
          <Clock className="w-3 h-3 animate-spin" />
          <span>ĐANG XÂY ({progressPercent}% - {factory.daysElapsed}/{factory.totalDurationDays} ngày)</span>
        </span>
      );
    }
    if (factory.status === 'upgrading') {
      const progressPercent = Math.round((factory.daysElapsed / factory.totalDurationDays) * 100);
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center space-x-1">
          <ArrowUpCircle className="w-3 h-3 animate-pulse" />
          <span>ĐANG NÂNG CẤP ({progressPercent}% - {factory.daysElapsed}/{factory.totalDurationDays} ngày)</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
        <CheckCircle2 className="w-3 h-3" />
        <span>ĐANG HOẠT ĐỘNG</span>
      </span>
    );
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
                <Factory className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Hệ thống Nhà máy – {countryName}
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
              Giai đoạn 4: Quản lý xây dựng, nâng cấp và sản lượng nhà máy theo đơn vị Tỉnh
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

      {/* MỤC IV.2: THANH SẢN LƯỢNG TỔNG QUÁT (Không dùng '-', hiển thị 0 nếu chưa có) */}
      <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tổng sản lượng & Chi phí vận hành mỗi ngày
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Chỉ tính các nhà máy đã hoàn thành và đang hoạt động
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Lương thực (Tấn/ngày) */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Wheat className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Lương thực</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {summary.foodOutput.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-emerald-400/80">tấn/ngày</span>
              </div>
            </div>
          </div>

          {/* Dầu (Thùng/ngày) */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Fuel className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Dầu mỏ</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-sky-300">
                  {summary.oilOutput.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-sky-400/80">thùng/ngày</span>
              </div>
            </div>
          </div>

          {/* Uranium (Kg/ngày) */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Atom className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Uranium</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-purple-300">
                  {summary.uraniumOutput.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-purple-400/80">kg/ngày</span>
              </div>
            </div>
          </div>

          {/* Tổng chi phí duy trì (USD/ngày) */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium text-slate-400 block">Chi phí duy trì</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-amber-300">
                  {summary.totalMaintenanceUSD.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-mono text-amber-400/80">USD/ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin số lượng cơ sở */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
          <span>Tổng số tỉnh: <strong className="text-slate-200">{provinces.length}</strong></span>
          <span>•</span>
          <span>Đang hoạt động: <strong className="text-emerald-400">{summary.operatingFactoriesCount}</strong></span>
          <span>•</span>
          <span>Đang xây dựng: <strong className="text-amber-400">{summary.buildingFactoriesCount}</strong></span>
          <span>•</span>
          <span>Đang nâng cấp: <strong className="text-sky-400">{summary.upgradingFactoriesCount}</strong></span>
        </div>
      </section>

      {/* MỤC IV.3: DANH SÁCH TỈNH (Provinces List) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Danh sách Tỉnh – Đơn vị xây dựng</span>
            </h2>
            <p className="text-xs text-slate-400">
              Nhấn vào từng tỉnh để xem chi tiết nhà máy, tiến độ, hoặc chọn xây dựng mới và nâng cấp.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {provinces.length} Tỉnh
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {provinces.map((prov) => {
            const provFactories = countryFactories.filter((f) => f.provinceId === prov.id);
            const oilOrFood = provFactories.find((f) => f.type === 'oil' || f.type === 'food');
            const uranium = provFactories.find((f) => f.type === 'uranium');

            return (
              <div
                key={prov.id}
                onClick={() => setSelectedProvinceId(prov.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-lg space-y-3.5 relative overflow-hidden ${
                  selectedProvinceId === prov.id
                    ? 'bg-slate-900 border-amber-500 shadow-amber-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Header Tỉnh */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">{prov.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {prov.id} • {countryName}
                    </span>
                  </div>

                  {prov.hasUraniumDeposit && (
                    <span
                      title={`Tỉnh có mỏ Uranium: ${prov.uraniumDepositInfo?.depositName || 'Đã xác minh'}`}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1"
                    >
                      <Atom className="w-3 h-3 text-purple-400" />
                      <span>CÓ MỎ URANIUM</span>
                    </span>
                  )}
                </div>

                {/* Danh sách nhà máy trong tỉnh */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  {/* Slot 1: Dầu hoặc Lương thực */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 font-medium">Nhóm Dầu/Lương thực:</span>
                    {oilOrFood ? (
                      <div className="text-right">
                        <span className="font-bold text-slate-200 block">
                          {oilOrFood.type === 'oil' ? '🛢️ Nhà máy dầu' : '🌾 Nhà máy lương thực'}{' '}
                          <span className="text-amber-400 font-mono">Cấp {oilOrFood.currentLevel}</span>
                        </span>
                        <div className="mt-0.5">{renderStatusBadge(oilOrFood)}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Chưa xây dựng</span>
                    )}
                  </div>

                  {/* Slot 2: Uranium */}
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 font-medium">Nhà máy Uranium:</span>
                    {uranium ? (
                      <div className="text-right">
                        <span className="font-bold text-purple-300 block">
                          ⚛️ Nhà máy Uranium (1 Cấp)
                        </span>
                        <div className="mt-0.5">{renderStatusBadge(uranium)}</div>
                      </div>
                    ) : prov.hasUraniumDeposit ? (
                      <span className="text-purple-400/80 font-medium text-[11px]">Đủ điều kiện xây</span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">Không có mỏ</span>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
                  <span>Nhấn để quản lý tỉnh này</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BẢNG CHI TIẾT TỈNH & KHỞI TẠO XÂY DỰNG / NÂNG CẤP (Drawer / Modal) */}
      {selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="max-w-2xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Quản lý tỉnh
                </span>
                <h3 className="text-xl font-black text-white">
                  Tỉnh {selectedProvince.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedProvince.hasUraniumDeposit
                    ? `Mỏ Uranium: ${selectedProvince.uraniumDepositInfo?.depositName || 'Đã xác minh 2026'}`
                    : 'Không có mỏ Uranium'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProvinceId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Quản lý 2 slot công trình */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* SLOT 1: NHÓM DẦU VÀ LƯƠNG THỰC */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Công trình 1: Nhóm Dầu / Lương thực
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Tối đa 1 nhà máy/tỉnh
                  </span>
                </div>

                {(() => {
                  const existing = factoriesInSelectedProvince.find(
                    (f) => f.type === 'oil' || f.type === 'food'
                  );

                  if (existing) {
                    const upgradeCheck = checkCanUpgradeFactory(existing);
                    const nextSpec = upgradeCheck.nextLevel
                      ? getFactorySpec(existing.type, upgradeCheck.nextLevel)
                      : null;

                    return (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-base font-black text-white">
                              {existing.type === 'oil' ? 'Nhà máy dầu' : 'Nhà máy lương thực'} – Cấp {existing.currentLevel}
                            </span>
                            <div className="mt-1">{renderStatusBadge(existing)}</div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400 block font-mono">
                              Sản lượng hiện tại: <strong className="text-white">{existing.status === 'operating' ? existing.dailyOutput : 0} {existing.outputUnit}</strong>
                            </span>
                            <span className="text-xs text-slate-400 block font-mono">
                              Chi phí duy trì: <strong className="text-amber-400">{existing.status === 'operating' ? existing.dailyMaintenanceUSD : 0} USD/ngày</strong>
                            </span>
                          </div>
                        </div>

                        {/* Nâng cấp */}
                        {upgradeCheck.canUpgrade && nextSpec && canManage && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <div className="text-xs text-slate-300">
                              <span>Nâng cấp lên <strong>Cấp {upgradeCheck.nextLevel}</strong>: </span>
                              <span className="font-mono text-amber-400 font-bold">{nextSpec.buildCostUSD.toLocaleString('vi-VN')} USD</span>
                              <span className="text-slate-400"> • {nextSpec.buildTimeDays} ngày</span>
                              <span className="text-emerald-400 font-semibold"> • Sản lượng mới: {nextSpec.dailyOutput} {nextSpec.outputUnit}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirmUpgradeTarget({
                                  factory: existing,
                                  provinceName: selectedProvince.name,
                                })
                              }
                              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-sky-500/20"
                            >
                              Nâng cấp
                            </button>
                          </div>
                        )}

                        {!upgradeCheck.canUpgrade && (
                          <p className="text-[11px] text-slate-500 italic">
                            * {upgradeCheck.reason}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Chưa có nhà máy nào -> Cho phép chọn xây Dầu hoặc Lương thực
                  const canBuildOil = checkCanBuildFactory(selectedProvince, 'oil', factoriesInSelectedProvince);
                  const canBuildFood = checkCanBuildFactory(selectedProvince, 'food', factoriesInSelectedProvince);

                  return (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">
                        Tỉnh này hiện chưa có nhà máy. Hãy chọn xây dựng <strong>Nhà máy Dầu</strong> hoặc <strong>Nhà máy Lương thực</strong> (Cấp I).
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option 1: Nhà máy dầu */}
                        <div className="p-3 rounded-lg border border-sky-500/30 bg-sky-500/5 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Fuel className="w-4 h-4 text-sky-400" />
                            <span className="font-bold text-white text-xs">Nhà máy dầu Cấp I</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                            <div>Chi phí: <strong className="text-amber-400 font-bold">{OIL_FACTORY_SPECS[1].buildCostUSD.toLocaleString('vi-VN')} USD</strong></div>
                            <div>Thời gian: <strong>{OIL_FACTORY_SPECS[1].buildTimeDays} ngày</strong></div>
                            <div>Sản lượng: <strong className="text-sky-300 font-bold">{OIL_FACTORY_SPECS[1].dailyOutput} thùng/ngày</strong></div>
                            <div>Duy trì: <strong>{OIL_FACTORY_SPECS[1].dailyMaintenanceUSD} USD/ngày</strong></div>
                          </div>
                          {canManage && canBuildOil.canBuild && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmBuildTarget({
                                  provinceId: selectedProvince.id,
                                  provinceName: selectedProvince.name,
                                  type: 'oil',
                                })
                              }
                              className="w-full mt-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                              Xây nhà máy dầu
                            </button>
                          )}
                        </div>

                        {/* Option 2: Nhà máy lương thực */}
                        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Wheat className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white text-xs">Nhà máy lương thực Cấp I</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                            <div>Chi phí: <strong className="text-amber-400 font-bold">{FOOD_FACTORY_SPECS[1].buildCostUSD.toLocaleString('vi-VN')} USD</strong></div>
                            <div>Thời gian: <strong>{FOOD_FACTORY_SPECS[1].buildTimeDays} ngày</strong></div>
                            <div>Sản lượng: <strong className="text-emerald-300 font-bold">{FOOD_FACTORY_SPECS[1].dailyOutput} tấn/ngày</strong></div>
                            <div>Duy trì: <strong>{FOOD_FACTORY_SPECS[1].dailyMaintenanceUSD} USD/ngày</strong></div>
                          </div>
                          {canManage && canBuildFood.canBuild && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmBuildTarget({
                                  provinceId: selectedProvince.id,
                                  provinceName: selectedProvince.name,
                                  type: 'food',
                                })
                              }
                              className="w-full mt-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                              Xây nhà máy lương thực
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SLOT 2: NHÀ MÁY URANIUM */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Atom className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Công trình 2: Nhà máy Uranium
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Chỉ dành cho tỉnh có mỏ
                  </span>
                </div>

                {(() => {
                  const existingUranium = factoriesInSelectedProvince.find((f) => f.type === 'uranium');

                  if (existingUranium) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-base font-black text-purple-300">
                              Nhà máy tinh chế Uranium
                            </span>
                            <div className="mt-1">{renderStatusBadge(existingUranium)}</div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-slate-400 block font-mono">
                              Sản lượng: <strong className="text-purple-300">{existingUranium.status === 'operating' ? existingUranium.dailyOutput : 0} kg/ngày</strong>
                            </span>
                            <span className="text-xs text-slate-400 block font-mono">
                              Duy trì: <strong className="text-amber-400">{existingUranium.status === 'operating' ? existingUranium.dailyMaintenanceUSD : 0} USD/ngày</strong>
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 italic pt-1">
                          * Nhà máy uranium chỉ có 1 cấp độ duy nhất, không có nâng cấp.
                        </p>
                      </div>
                    );
                  }

                  if (!selectedProvince.hasUraniumDeposit) {
                    return (
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2.5">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>
                          Tỉnh <strong>{selectedProvince.name}</strong> không có mỏ Uranium theo dữ liệu địa chất 2026. Không thể xây dựng nhà máy uranium tại đây.
                        </span>
                      </div>
                    );
                  }

                  // Có mỏ Uranium và chưa xây
                  return (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300 text-xs">
                            Đủ điều kiện xây Nhà máy Uranium (Mỏ: {selectedProvince.uraniumDepositInfo?.depositName || 'Đã xác minh'})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 grid grid-cols-2 gap-1">
                          <div>Chi phí: <strong className="text-amber-400 font-bold">{URANIUM_FACTORY_SPEC.buildCostUSD.toLocaleString('vi-VN')} USD</strong></div>
                          <div>Thời gian: <strong>{URANIUM_FACTORY_SPEC.buildTimeDays} ngày</strong></div>
                          <div>Sản lượng: <strong className="text-purple-300 font-bold">{URANIUM_FACTORY_SPEC.dailyOutput} kg/ngày</strong></div>
                          <div>Duy trì: <strong>{URANIUM_FACTORY_SPEC.dailyMaintenanceUSD} USD/ngày</strong></div>
                        </div>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmBuildTarget({
                                provinceId: selectedProvince.id,
                                provinceName: selectedProvince.name,
                                type: 'uranium',
                              })
                            }
                            className="w-full mt-2 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-purple-600/20"
                          >
                            Xây nhà máy Uranium
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setSelectedProvinceId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN BẮT ĐẦU XÂY DỰNG MỚI */}
      {confirmBuildTarget && (() => {
        const spec = getFactorySpec(confirmBuildTarget.type, 1);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Xác nhận khởi công
                  </h3>
                  <p className="text-xs text-slate-400">
                    Xây dựng tại tỉnh {confirmBuildTarget.provinceName}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Loại nhà máy:</span>
                  <span className="font-bold text-white">{spec.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cấp độ khởi đầu:</span>
                  <span className="font-bold text-amber-400">Cấp 1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chi phí đầu tư (USD):</span>
                  <span className="font-bold text-amber-400">{spec.buildCostUSD.toLocaleString('vi-VN')} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian thi công:</span>
                  <span className="font-bold text-slate-200">{spec.buildTimeDays} ngày game</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Sản lượng sau hoàn thành:</span>
                  <span className="font-bold text-emerald-400">{spec.dailyOutput} {spec.outputUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chi phí duy trì hàng ngày:</span>
                  <span className="font-bold text-amber-400">{spec.dailyMaintenanceUSD} USD/ngày</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Trong thời gian xây dựng, nhà máy chưa phát sinh sản lượng và chưa tính chi phí duy trì.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmBuildTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBuild}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
                >
                  Xác nhận bắt đầu xây dựng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL XÁC NHẬN NÂNG CẤP */}
      {confirmUpgradeTarget && (() => {
        const { factory, provinceName } = confirmUpgradeTarget;
        const nextLevel = (factory.currentLevel + 1) as 2 | 3 | 4;
        const nextSpec = getFactorySpec(factory.type, nextLevel);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <ArrowUpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Xác nhận nâng cấp
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nâng cấp tại tỉnh {provinceName}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Công trình:</span>
                  <span className="font-bold text-white">{factory.type === 'oil' ? 'Nhà máy dầu' : 'Nhà máy lương thực'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nâng cấp từ:</span>
                  <span className="text-slate-300">Cấp {factory.currentLevel} → <strong className="text-sky-400 font-bold">Cấp {nextLevel}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chi phí nâng cấp (USD):</span>
                  <span className="font-bold text-amber-400">{nextSpec.buildCostUSD.toLocaleString('vi-VN')} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian nâng cấp:</span>
                  <span className="font-bold text-slate-200">{nextSpec.buildTimeDays} ngày game</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Sản lượng mới sau hoàn thành:</span>
                  <span className="font-bold text-emerald-400">{nextSpec.dailyOutput} {nextSpec.outputUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chi phí duy trì mới:</span>
                  <span className="font-bold text-amber-400">{nextSpec.dailyMaintenanceUSD} USD/ngày</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Trong thời gian nâng cấp, nhà máy tạm ngừng tính sản lượng và chi phí duy trì của cấp cũ cho đến khi hoàn thành cấp mới.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmUpgradeTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20"
                >
                  Xác nhận bắt đầu nâng cấp
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MỤC VIII: BẢNG TRA CỨU ĐỐI CHIẾU CÔNG THỨC CHUẨN */}
      <section className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Quy chuẩn tính toán sản lượng và chi phí GĐ4 (Mục VIII)</span>
        </div>
        <p className="leading-relaxed">
          - <strong>Nhà máy dầu</strong>: Cấp I (50 thùng, 250$), Cấp II (100 thùng, 400$), Cấp III (180 thùng, 650$), Cấp IV (300 thùng, 1.000$).<br />
          - <strong>Nhà máy lương thực</strong>: Cấp I (100 tấn, 150$), Cấp II (250 tấn, 250$), Cấp III (500 tấn, 400$), Cấp IV (900 tấn, 650$).<br />
          - <strong>Nhà máy uranium</strong>: 20 kg/ngày, chi phí duy trì 1.500 USD/ngày (chỉ xây tại tỉnh có mỏ uranium).<br />
          - <em>Dữ liệu kiểm thử bắt buộc</em>: 2 dầu Lv.I + 1 dầu Lv.III = <strong>280 thùng/ngày</strong> • 2 lương thực Lv.II = <strong>500 tấn/ngày</strong> • 1 uranium = <strong>20 kg/ngày</strong> • Tổng duy trì = <strong>3.150 USD/ngày</strong>.
        </p>
      </section>
    </div>
  );
};
