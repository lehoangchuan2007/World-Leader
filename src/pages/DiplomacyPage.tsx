import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const DiplomacyPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="diplomacy"
    title="Ngoại giao"
    plannedPhase="GIAI ĐOẠN 6: NGOẠI GIAO"
    description="Quan hệ quốc tế, hiệp ước và hoạt động ngoại giao sẽ được triển khai chính thức tại Giai đoạn 6 của WORLD LEADER."
    onBackToMap={onBackToMap}
  />
);
