import React, { useState } from 'react';
import { getCountryCode, getFlagUrl, getFlagEmoji } from '../data/countryFlags';

interface CountryFlagProps {
  countryId: string | number;
  countryName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryId,
  countryName,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);
  const code = getCountryCode(countryId, countryName);
  const flagUrl = getFlagUrl(code);
  const emoji = getFlagEmoji(code);

  const sizeStyles = {
    sm: 'w-5 h-3.5 text-xs',
    md: 'w-7 h-5 text-sm',
    lg: 'w-10 h-7 text-lg',
    xl: 'w-14 h-9 text-2xl',
  };

  if (hasError || code === 'un') {
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${sizeStyles[size]} ${className}`}
        title={countryName || 'Quốc gia'}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={countryName || 'Cờ quốc gia'}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`inline-block object-cover rounded-xs shadow-xs border border-slate-700/60 ${sizeStyles[size]} ${className}`}
    />
  );
};
