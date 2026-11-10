import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { geoGraticule } from 'd3-geo';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Flag } from 'lucide-react';
import { CountryInfoPanel } from './CountryInfoPanel';
import { CountryMapFeature, getLoadedMapFeatures } from '../data/mapData';
import { MAP_THEME } from '../data/countryColors';
import {
  BASE_MAP_WIDTH,
  BASE_MAP_HEIGHT,
  MIN_ZOOM,
  MAX_ZOOM,
  createMapProjection,
  createPathGenerator,
  clampViewport,
  zoomToPoint,
} from '../systems/mapInteraction';
import { MapViewport, SelectedCountry, PlayerCountry } from '../types/game';

interface WorldMapProps {
  playerCountry: PlayerCountry | null;
  selectedCountry: SelectedCountry | null;
  onSelectCountry: (country: SelectedCountry | null) => void;
  isSelectingStartingCountry?: boolean;
  onConfirmPlayerCountry?: (country: SelectedCountry) => void;
}

interface PrecomputedFeature {
  feature: CountryMapFeature;
  path: string;
  centroid: [number, number] | null;
  area: number;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  playerCountry,
  selectedCountry,
  onSelectCountry,
  isSelectingStartingCountry = false,
  onConfirmPlayerCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport zoom & pan state
  const [viewport, setViewport] = useState<MapViewport>({
    x: 0,
    y: 0,
    k: 1.0,
  });

  // Keep a ref to latest viewport for RAF loops
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const viewportStartRef = useRef<MapViewport>({ x: 0, y: 0, k: 1 });
  const hasMovedRef = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Animation frame throttle
  const rafIdRef = useRef<number | null>(null);

  // Hovered country state for tooltip (suppressed during dragging)
  const [hoveredCountry, setHoveredCountry] = useState<CountryMapFeature | null>(null);

  // 1. Prepare Projection & Path Generator
  const projection = useMemo(() => createMapProjection(), []);
  const pathGenerator = useMemo(() => createPathGenerator(projection), [projection]);

  // 2. Graticule lines (Latitude/Longitude grid at 30-degree intervals)
  const graticulePath = useMemo(() => {
    const graticule = geoGraticule().step([30, 30]);
    return pathGenerator(graticule()) || '';
  }, [pathGenerator]);

  // 3. Precompute SVG paths and centroids for all countries and archipelagos
  const precomputedFeatures: PrecomputedFeature[] = useMemo(() => {
    const features = getLoadedMapFeatures();
    return features.map((f) => {
      const path = pathGenerator(f) || '';
      const c = pathGenerator.centroid(f);
      const centroid: [number, number] | null =
        c && !isNaN(c[0]) && !isNaN(c[1]) ? [c[0], c[1]] : null;
      const area = pathGenerator.area(f) || 0;

      return {
        feature: f,
        path,
        centroid,
        area,
      };
    });
  }, [pathGenerator]);

  // Map from country id to feature for quick centroid lookup
  const featureById = useMemo(() => {
    const map = new Map<string, PrecomputedFeature>();
    precomputedFeatures.forEach((item) => {
      map.set(item.feature.properties.id, item);
    });
    return map;
  }, [precomputedFeatures]);

  // Center camera smoothly onto a country
  const focusOnCountry = useCallback(
    (countryId: string, zoomLevel: number = 3.5) => {
      const item = featureById.get(countryId);
      if (item && item.centroid) {
        const [cx, cy] = item.centroid;
        const targetK = Math.min(Math.max(zoomLevel, MIN_ZOOM), MAX_ZOOM);
        const targetX = BASE_MAP_WIDTH / 2 - cx * targetK;
        const targetY = BASE_MAP_HEIGHT / 2 - cy * targetK;

        setViewport(
          clampViewport(
            { x: targetX, y: targetY, k: targetK },
            BASE_MAP_WIDTH,
            BASE_MAP_HEIGHT
          )
        );
      }
    },
    [featureById]
  );

  // Center camera when player country changes
  useEffect(() => {
    if (playerCountry) {
      focusOnCountry(playerCountry.id, 3.2);
    }
  }, [playerCountry?.id, focusOnCountry]);

  // Center camera when selectedCountry changes (e.g. from search bar)
  useEffect(() => {
    if (selectedCountry) {
      focusOnCountry(selectedCountry.id, 3.2);
    }
  }, [selectedCountry?.id, focusOnCountry]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Handle Wheel Zoom (Lag-free RAF accumulator)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const scaleFactorX = BASE_MAP_WIDTH / rect.width;
    const scaleFactorY = BASE_MAP_HEIGHT / rect.height;
    const focalX = cursorX * scaleFactorX;
    const focalY = cursorY * scaleFactorY;

    const zoomFactor = e.deltaY < 0 ? 1.18 : 0.85;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setViewport((prev) => {
        const next = zoomToPoint(prev, zoomFactor, { x: focalX, y: focalY });
        return clampViewport(next, BASE_MAP_WIDTH, BASE_MAP_HEIGHT);
      });
      rafIdRef.current = null;
    });
  }, []);

  // Drag Pan Handlers (Ultra-smooth 60/120 FPS via RAF)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    viewportStartRef.current = viewportRef.current;
    setIsGrabbing(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;

    if (Math.hypot(dx, dy) > 4) {
      hasMovedRef.current = true;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const scaleFactorX = BASE_MAP_WIDTH / rect.width;
    const scaleFactorY = BASE_MAP_HEIGHT / rect.height;

    const newX = viewportStartRef.current.x + dx * scaleFactorX;
    const newY = viewportStartRef.current.y + dy * scaleFactorY;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      setViewport({
        k: viewportStartRef.current.k,
        x: newX,
        y: newY,
      });
      rafIdRef.current = null;
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsGrabbing(false);
  }, []);

  // Global pointerup listener
  useEffect(() => {
    const handleGlobalUp = () => {
      isDraggingRef.current = false;
      setIsGrabbing(false);
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  // Zoom Button Controls
  const handleZoomIn = () => {
    setViewport((prev) => {
      const next = zoomToPoint(prev, 1.35, {
        x: BASE_MAP_WIDTH / 2,
        y: BASE_MAP_HEIGHT / 2,
      });
      return clampViewport(next, BASE_MAP_WIDTH, BASE_MAP_HEIGHT);
    });
  };

  const handleZoomOut = () => {
    setViewport((prev) => {
      const next = zoomToPoint(prev, 0.74, {
        x: BASE_MAP_WIDTH / 2,
        y: BASE_MAP_HEIGHT / 2,
      });
      return clampViewport(next, BASE_MAP_WIDTH, BASE_MAP_HEIGHT);
    });
  };

  const handleResetView = () => {
    setViewport({
      x: 0,
      y: 0,
      k: 1.0,
    });
  };

  // Focus specifically on Southeast Asia / Vietnam / East Sea
  const handleFocusVietnam = () => {
    focusOnCountry('704', 3.8);
  };

  // Focus on player country
  const handleFocusPlayerCountry = () => {
    if (playerCountry) {
      focusOnCountry(playerCountry.id, 3.8);
    }
  };

  // Country Click Selection
  const handleCountryClick = (
    e: React.MouseEvent,
    item: PrecomputedFeature
  ) => {
    e.stopPropagation();
    if (hasMovedRef.current) return;

    const props = item.feature.properties;
    onSelectCountry({
      id: props.id,
      name: props.name,
      nameVi: props.nameVi,
    });
  };

  // Ocean Click Deselection (strictly never creates country)
  const handleOceanClick = () => {
    if (hasMovedRef.current) return;
    onSelectCountry(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleOceanClick}
    >
      {/* 2D Flat Political Map SVG */}
      <svg
        viewBox={`0 0 ${BASE_MAP_WIDTH} ${BASE_MAP_HEIGHT}`}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ocean Background */}
        <rect
          x="0"
          y="0"
          width={BASE_MAP_WIDTH}
          height={BASE_MAP_HEIGHT}
          fill={MAP_THEME.ocean}
        />

        {/* Scaled & Translated Map Group (Direct GPU transform, no laggy CSS transition) */}
        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.k})`}
          style={{ willChange: 'transform' }}
        >
          {/* Latitude & Longitude Graticule Grid */}
          <path
            d={graticulePath}
            fill="none"
            stroke={MAP_THEME.graticule}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 3"
            opacity={0.35}
            pointerEvents="none"
          />

          {/* All Country Polygons */}
          {precomputedFeatures.map((item) => {
            const { feature, path } = item;
            const props = feature.properties;
            const isSelected = selectedCountry?.id === props.id;
            const isPlayer = playerCountry?.id === props.id;
            const isHovered = hoveredCountry?.properties.id === props.id;

            // Highlight color
            let fillColor = props.color;
            if (isSelected) {
              fillColor = '#d97706'; // Vibrant amber
            } else if (isPlayer) {
              fillColor = props.color;
            }

            // High performance border stroke styling using non-scaling-stroke
            let strokeColor = MAP_THEME.border;
            let strokeWidth = 0.6;

            if (isSelected) {
              strokeColor = '#fbbf24'; // Golden amber outline
              strokeWidth = 2.5;
            } else if (isPlayer) {
              strokeColor = '#38bdf8'; // Sky blue border for player country
              strokeWidth = 2.0;
            } else if (isHovered) {
              strokeColor = '#e2e8f0';
              strokeWidth = 1.2;
            }

            return (
              <path
                key={props.id}
                d={path}
                fill={fillColor}
                fillOpacity={isSelected ? 0.95 : isPlayer ? 0.92 : isHovered ? 0.88 : 0.78}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="cursor-pointer"
                onClick={(e) => handleCountryClick(e, item)}
                onMouseEnter={() => {
                  if (!isDraggingRef.current) {
                    setHoveredCountry(feature);
                  }
                }}
                onMouseLeave={() => {
                  if (!isDraggingRef.current) {
                    setHoveredCountry(null);
                  }
                }}
              />
            );
          })}

          {/* Country Names & Labels on the 2D Map */}
          {precomputedFeatures.map((item) => {
            const { feature, centroid, area } = item;
            if (!centroid) return null;

            const props = feature.properties;
            const isSelected = selectedCountry?.id === props.id;
            const isPlayer = playerCountry?.id === props.id;
            const isSpecialArchipelago = props.isArchipelago;

            const effectiveArea = area * viewport.k * viewport.k;
            const isVisible =
              isSelected ||
              isPlayer ||
              isSpecialArchipelago ||
              effectiveArea > 450 ||
              (viewport.k > 2.0 && effectiveArea > 100) ||
              viewport.k > 4.5;

            if (!isVisible) return null;

            const baseFontSize = isSpecialArchipelago
              ? Math.max(3.2, 5.5 / Math.sqrt(viewport.k))
              : Math.max(3.0, Math.min(10.5, 7.5 / Math.sqrt(viewport.k)));

            return (
              <g
                key={`label-${props.id}`}
                transform={`translate(${centroid[0]}, ${centroid[1]})`}
                pointerEvents="none"
              >
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={baseFontSize}
                  fontWeight={isSelected || isPlayer || isSpecialArchipelago ? 'bold' : '600'}
                  fill={
                    isSelected
                      ? '#ffffff'
                      : isPlayer
                      ? '#38bdf8'
                      : isSpecialArchipelago
                      ? '#fef08a'
                      : MAP_THEME.countryLabel
                  }
                  stroke="#020617"
                  strokeWidth={0.5}
                  paintOrder="stroke fill"
                  className="font-sans select-none tracking-wider"
                  opacity={isSelected || isPlayer ? 1.0 : 0.88}
                >
                  {props.nameVi || props.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Zoom & Map Controls */}
      <div className="absolute right-4 bottom-6 flex flex-col space-y-1.5 z-20">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Phóng to bản đồ (+)"
          className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Thu nhỏ bản đồ (-)"
          className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          title="Đặt lại góc nhìn toàn cầu"
          className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Quick jump to player country */}
        {playerCountry && (
          <button
            type="button"
            onClick={handleFocusPlayerCountry}
            title={`Tập trung vào quốc gia của bạn (${playerCountry.nameVi})`}
            className="p-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 shadow-lg backdrop-blur-md transition-colors"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}

        {/* Quick jump to Vietnam & East Sea */}
        <button
          type="button"
          onClick={handleFocusVietnam}
          title="Tập trung khu vực Việt Nam & Biển Đông"
          className="p-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-lg backdrop-blur-md transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Country Information Panel (Cờ, Tên, Dân số, Tiền, Lương thực, Dầu, Uranium) */}
      {selectedCountry && (
        <CountryInfoPanel
          country={selectedCountry}
          playerCountry={playerCountry}
          isSelectingStartingCountry={isSelectingStartingCountry}
          onConfirmAsPlayerCountry={(country) => {
            onConfirmPlayerCountry?.(country);
          }}
          onClose={() => onSelectCountry(null)}
        />
      )}
    </div>
  );
};
