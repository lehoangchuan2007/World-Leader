import React from 'react';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { ActivePage } from '../types/game';

interface PlaceholderPageProps {
  pageId: ActivePage;
  title: string;
  plannedPhase: string;
  description: string;
  onBackToMap: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  plannedPhase,
  description,
  onBackToMap,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-block text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
            {plannedPhase}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Quy tắc phạm vi Giai đoạn 1:</p>
            <p>
              Hệ thống này chỉ được triển khai khi bước sang giai đoạn tương ứng. Không tạo nội dung giả hoặc cơ chế gameplay ngoài phạm vi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToMap}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bản đồ</span>
        </button>
      </div>
    </div>
  );
};
