import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Compass, Globe } from 'lucide-react';
import { CountryFlag } from './CountryFlag';
import { CountryMapFeature, getLoadedMapFeatures } from '../data/mapData';
import { SelectedCountry } from '../types/game';

interface CountrySearchBarProps {
  isSelectingStartingCountry: boolean;
  onSelectCountry: (country: SelectedCountry) => void;
}

export const CountrySearchBar: React.FC<CountrySearchBarProps> = ({
  isSelectingStartingCountry,
  onSelectCountry,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load clean country list
  const countries = useMemo(() => {
    const features = getLoadedMapFeatures();
    const map = new Map<string, CountryMapFeature>();
    features.forEach((f) => {
      map.set(f.properties.id, f);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.properties.nameVi.localeCompare(b.properties.nameVi, 'vi')
    );
  }, []);

  // Filter countries by typed query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return countries
      .filter(
        (c) =>
          c.properties.nameVi.toLowerCase().includes(q) ||
          c.properties.name.toLowerCase().includes(q)
      )
      .slice(0, 8); // Top 8 matches
  }, [countries, query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickCountry = (country: CountryMapFeature) => {
    onSelectCountry({
      id: country.properties.id,
      name: country.properties.name,
      nameVi: country.properties.nameVi,
    });
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative z-30 flex flex-col items-center pointer-events-auto max-w-md w-full"
    >
      {/* Search Input Box */}
      <div className="w-full relative shadow-2xl rounded-2xl">
        <div className="relative flex items-center bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border border-slate-700/80 rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500">
          <div className="pl-3.5 pr-2 py-2.5 text-amber-400 flex items-center">
            {isSelectingStartingCountry ? (
              <Compass className="w-4 h-4 animate-spin-slow" />
            ) : (
              <Search className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              isSelectingStartingCountry
                ? 'Gõ tên hoặc nhấp trực tiếp trên bản đồ để chọn quốc gia...'
                : 'Tìm kiếm quốc gia trên bản đồ...'
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm py-2.5 pr-8 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="pr-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions with National Flags */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl overflow-hidden py-1 divide-y divide-slate-800/80 animate-in fade-in duration-150">
          {searchResults.map((c) => (
            <button
              key={c.properties.id}
              type="button"
              onClick={() => handlePickCountry(c)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <CountryFlag
                  countryId={c.properties.id}
                  countryName={c.properties.name}
                  size="md"
                />
                <div className="min-w-0">
                  <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 block truncate">
                    {c.properties.nameVi}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">
                    {c.properties.name}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-amber-400 shrink-0 ml-2">
                Chọn →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Prompt banner if in starting country selection mode */}
      {isSelectingStartingCountry && !query && (
        <div className="mt-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center space-x-1.5 shadow-md">
          <Globe className="w-3 h-3 text-amber-400" />
          <span>Bấm trực tiếp vào lãnh thổ bất kỳ trên bản đồ để chọn</span>
        </div>
      )}
    </div>
  );
};
