import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const MilitaryPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="military"
    title="Quân sự"
    plannedPhase="GIAI ĐOẠN 7: QUÂN SỰ"
    description="Mô hình lực lượng vũ trang, trang bị và hệ thống tác chiến sẽ được triển khai chính thức tại Giai đoạn 7 của WORLD LEADER."
    onBackToMap={onBackToMap}
  />
);
