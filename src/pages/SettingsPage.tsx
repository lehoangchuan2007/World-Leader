import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const SettingsPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="settings"
    title="Cài đặt"
    plannedPhase="CÀI ĐẶT HỆ THỐNG"
    description="Các tùy chọn cấu hình âm thanh, đồ họa và hệ thống nâng cao sẽ được triển khai ở các giai đoạn hoàn thiện sau."
    onBackToMap={onBackToMap}
  />
);
