import React from 'react';
import { PlaceholderPage } from './PlaceholderPage';

export const TechnologyPage: React.FC<{ onBackToMap: () => void }> = ({ onBackToMap }) => (
  <PlaceholderPage
    pageId="technology"
    title="Công nghệ"
    plannedPhase="GIAI ĐOẠN 5: CÂY CÔNG NGHỆ"
    description="Cây công nghệ, nghiên cứu và phát triển khoa học kỹ thuật sẽ được triển khai chính thức tại Giai đoạn 5 của WORLD LEADER."
    onBackToMap={onBackToMap}
  />
);
