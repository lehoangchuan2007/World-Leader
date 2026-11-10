import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const PoliticsPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="politics"
    title="Chính trị"
    plannedPhase="GIAI ĐOẠN 2: CHÍNH TRỊ"
    description="Giao diện và hệ thống cơ chế Chính trị sẽ được triển khai chính thức tại Giai đoạn 2 của WORLD LEADER."
    onBackToMap={onBackToMap}
  />
);
