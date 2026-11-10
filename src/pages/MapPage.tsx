import React from 'react';
import { WorldMap } from '../components/WorldMap';
import { SelectedCountry, PlayerCountry } from '../types/game';
import { CountryEconomy } from '../types/economy';

interface MapPageProps {
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  selectedCountryEconomy?: CountryEconomy | null;
  onSelectCountry: (country: SelectedCountry | null) => void;
  isSelectingStartingCountry?: boolean;
  onConfirmPlayerCountry?: (country: SelectedCountry) => void;
  onOpenPolitics?: (country: SelectedCountry) => void;
  onOpenEconomy?: (country: SelectedCountry) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  playerCountry,
  selectedCountry,
  selectedCountryEconomy,
  onSelectCountry,
  isSelectingStartingCountry = false,
  onConfirmPlayerCountry,
  onOpenPolitics,
  onOpenEconomy,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <WorldMap
        playerCountry={playerCountry}
        selectedCountry={selectedCountry}
        onSelectCountry={onSelectCountry}
        isSelectingStartingCountry={isSelectingStartingCountry}
        onConfirmPlayerCountry={onConfirmPlayerCountry}
        onOpenPolitics={onOpenPolitics}
        onOpenEconomy={onOpenEconomy}
        selectedCountryEconomy={selectedCountryEconomy}
      />
    </div>
  );
};
