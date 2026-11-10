import React from 'react';
import { WorldMap } from '../components/WorldMap';
import { SelectedCountry, PlayerCountry } from '../types/game';

interface MapPageProps {
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  onSelectCountry: (country: SelectedCountry | null) => void;
  isSelectingStartingCountry?: boolean;
  onConfirmPlayerCountry?: (country: SelectedCountry) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  playerCountry,
  selectedCountry,
  onSelectCountry,
  isSelectingStartingCountry = false,
  onConfirmPlayerCountry,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <WorldMap
        playerCountry={playerCountry}
        selectedCountry={selectedCountry}
        onSelectCountry={onSelectCountry}
        isSelectingStartingCountry={isSelectingStartingCountry}
        onConfirmPlayerCountry={onConfirmPlayerCountry}
      />
    </div>
  );
};
