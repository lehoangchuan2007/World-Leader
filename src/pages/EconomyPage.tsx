import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const EconomyPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="economy"
    title="Kinh tế"
    plannedPhase="GIAI ĐOẠN 3: KINH TẾ"
    description="Hệ thống tài chính, ngân sách, tiền tệ và tài nguyên sẽ được triển khai chính thức tại Giai đoạn 3 của WORLD LEADER."
    onBackToMap={onBackToMap}
  />
);
