import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DesignLocation, ReferenceDesign } from '../types.ts';
import { INITIAL_LOCATIONS } from '../data/mockData.ts';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Camera, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowUpRight,
  LocateFixed,
  Building2,
  Coffee,
  Palette,
  Flower2,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Map as MapIcon,
  List,
  Columns,
  Eye,
  ExternalLink
} from 'lucide-react';

interface GoogleMapsLocationsViewProps {
  onSelectReference?: (ref: ReferenceDesign) => void;
  allReferences: ReferenceDesign[];
  initialSelectedLocationId?: string | null;
}

const CATEGORIES = [
  'All',
  'Cafe & Dining',
  'Architecture & Studio',
  'Art Gallery & Museum',
  'Craft & Workshop',
  'Botanical & Nature',
  'Co-working & Library'
];

const CITIES = [
  { id: 'all', name: 'ทุกเมือง (All)', center: { lat: 13.7563, lng: 100.5018 }, zoom: 6 },
  { id: 'bangkok', name: 'กรุงเทพฯ (Bangkok)', center: { lat: 13.7367, lng: 100.5600 }, zoom: 12 },
  { id: 'chiangmai', name: 'เชียงใหม่ (Chiang Mai)', center: { lat: 18.7953, lng: 98.9850 }, zoom: 13 },
  { id: 'copenhagen', name: 'Copenhagen (เดนมาร์ก)', center: { lat: 55.6792, lng: 12.5815 }, zoom: 13 },
];

type MapTileStyle = 'voyager' | 'streets' | 'satellite' | 'dark';

const MAP_LAYERS: Record<MapTileStyle, { name: string; url: string; subdomains?: string; maxZoom: number; attribution: string }> = {
  voyager: {
    name: 'แผนที่สว่าง สบายตา (Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  streets: {
    name: 'แผนที่ถนนละเอียด (Standard Streets)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    name: 'ภาพถ่ายดาวเทียมจริง (Satellite Hybrid)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  dark: {
    name: 'โหมดเข้ม มินิมอล (Dark Minimal)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

export const GoogleMapsLocationsView: React.FC<GoogleMapsLocationsViewProps> = ({
  onSelectReference,
  allReferences,
  initialSelectedLocationId
}) => {
  const [locations] = useState<DesignLocation[]>(INITIAL_LOCATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<DesignLocation | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('voyager');
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showGoogleEmbedModal, setShowGoogleEmbedModal] = useState<DesignLocation | null>(null);

  // Leaflet map container refs
  const leafletMapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstanceRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCategory = selectedCategory === 'All' || loc.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || 
        (selectedCity === 'bangkok' && loc.city.toLowerCase().includes('bangkok')) ||
        (selectedCity === 'chiangmai' && loc.city.toLowerCase().includes('chiang mai')) ||
        (selectedCity === 'copenhagen' && loc.city.toLowerCase().includes('copenhagen'));
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        loc.title.toLowerCase().includes(q) ||
        loc.subtitle.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.aestheticTags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesCity && matchesSearch;
    });
  }, [locations, selectedCategory, selectedCity, searchQuery]);

  // Invalidate map size whenever viewMode changes or window resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [viewMode]);

  // Handle initial selected location from external navigation
  useEffect(() => {
    if (initialSelectedLocationId) {
      const found = locations.find(l => l.id === initialSelectedLocationId || l.referenceId === initialSelectedLocationId);
      if (found) {
        setSelectedLocation(found);
        if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.flyTo([found.lat, found.lng], 15, { duration: 1.2 });
        }
      }
    }
  }, [initialSelectedLocationId, locations]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!leafletMapContainerRef.current) return;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(leafletMapContainerRef.current, {
        center: [13.7367, 100.5600],
        zoom: 12,
        zoomControl: false, // Custom controls
        attributionControl: true
      });

      const initialLayerConfig = MAP_LAYERS[mapStyle];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom,
        subdomains: initialLayerConfig.subdomains || 'abc'
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      const markersGroup = L.layerGroup().addTo(map);
      leafletMarkersRef.current = markersGroup;
      leafletMapInstanceRef.current = map;

      // Invalidate size immediately
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const layerConfig = MAP_LAYERS[mapStyle];
    const newTileLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abc'
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update Markers
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    const markersGroup = leafletMarkersRef.current;

    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      
      // Determine category color and icon
      let categoryColor = '#3A6360';
      let categoryEmoji = '📍';
      if (loc.category.includes('Cafe')) {
        categoryColor = '#A97C50';
        categoryEmoji = '☕';
      } else if (loc.category.includes('Architecture')) {
        categoryColor = '#324C54';
        categoryEmoji = '🏛️';
      } else if (loc.category.includes('Art')) {
        categoryColor = '#7A5C61';
        categoryEmoji = '🎨';
      } else if (loc.category.includes('Botanical')) {
        categoryColor = '#2F6652';
        categoryEmoji = '🌿';
      }

      const pinBg = isSelected ? '#1E2E31' : categoryColor;
      const ringStyle = isSelected ? 'box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9), 0 8px 20px rgba(0,0,0,0.35); transform: scale(1.18);' : 'box-shadow: 0 4px 12px rgba(0,0,0,0.2);';

      const iconHtml = `
        <div class="cursor-pointer transition-all duration-200" style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: ${pinBg}; color: #ffffff; border: 2.5px solid #ffffff; ${ringStyle} border-radius: 9999px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s ease;">
            <span>${categoryEmoji}</span>
          </div>
          <div style="background-color: #1E2E31; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-top: 4px; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); display: ${isSelected ? 'block' : 'none'}; pointer-events: none;">
            ${loc.title}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon });

      // Custom HTML Popup
      const popupHtml = `
        <div style="width: 260px; font-family: 'Outfit', 'Prompt', sans-serif; background: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="height: 120px; width: 100%; position: relative; overflow: hidden; background: #CBDAD5;">
            <img src="${loc.imageUrl}" alt="${loc.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 8px; left: 8px; background: rgba(30, 46, 49, 0.85); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
              ${loc.category}
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0, 0, 0, 0.7); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ★ ${loc.rating || 4.8}
            </div>
          </div>
          <div style="padding: 12px 14px;">
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #1E2E31; line-height: 1.2;">
              ${loc.title}
            </h4>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #5C7276; font-weight: 500;">
              ${loc.subtitle}
            </p>
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #7A938E; line-height: 1.3;">
              📍 ${loc.address}
            </p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #EBF1F0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; font-weight: 700; color: #3A6360;">${loc.city}</span>
              <a 
                href="${loc.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.title + ' ' + loc.address)}`}" 
                target="_blank" 
                rel="noopener noreferrer" 
                style="display: inline-flex; align-items: center; gap: 4px; background: #3A6360; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 8px; text-decoration: none;"
              >
                เปิดใน Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        offset: [0, -10]
      });

      marker.on('click', () => {
        setSelectedLocation(loc);
        map.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
      });

      markersGroup.addLayer(marker);
    });

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(59, 130, 246, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #2563EB; width: 14px; height: 14px; border-radius: 9999px; border: 2.5px solid white; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
          </div>
        `,
        className: 'user-loc-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup('<div style="padding: 6px 10px; font-weight: 700; font-size: 12px; color: #1E2E31;">📍 ตำแหน่งปัจจุบันของคุณ</div>');
      markersGroup.addLayer(userMarker);
    }
  }, [filteredLocations, selectedLocation, userLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to location
  const handleSelectLocation = (loc: DesignLocation) => {
    setSelectedLocation(loc);
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1 });
    }
  };

  // Change City Center
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const cityConfig = CITIES.find(c => c.id === cityId);
    if (cityConfig && leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([cityConfig.center.lat, cityConfig.center.lng], cityConfig.zoom, { duration: 1 });
    }
  };

  // Zoom to fit all markers
  const handleFitAllMarkers = () => {
    const map = leafletMapInstanceRef.current;
    if (!map || filteredLocations.length === 0) return;

    const bounds = L.latLngBounds(filteredLocations.map(l => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1 });
  };

  // Zoom In / Out
  const handleZoomIn = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.zoomOut();
    }
  };

  // Get User Current Location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setUserLocation(userPos);
          if (leafletMapInstanceRef.current) {
            leafletMapInstanceRef.current.flyTo([userPos.lat, userPos.lng], 14, { duration: 1.2 });
          }
        },
        (err) => {
          console.warn('Geolocation error:', err);
        }
      );
    }
  };

  // Copy GPS Coordinates
  const copyCoordinates = (loc: DesignLocation) => {
    const coordStr = `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordStr);
    setCopiedCoords(loc.id);
    setTimeout(() => setCopiedCoords(null), 2000);
  };

  // Copy Color Hex
  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Open linked reference
  const handleViewReference = (refId?: string) => {
    if (!refId || !onSelectReference) return;
    const ref = allReferences.find(r => r.id === refId);
    if (ref) {
      onSelectReference(ref);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cafe & Dining':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Art Gallery & Museum':
        return <Palette className="w-3.5 h-3.5" />;
      case 'Craft & Workshop':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Botanical & Nature':
        return <Flower2 className="w-3.5 h-3.5" />;
      default:
        return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F7F6]" id="google-maps-locations-view">
      {/* Top Header & Search Controls */}
      <div className="p-3 sm:p-5 border-b border-[#D1DDD9] bg-[#EBF1F0] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 bg-[#3A6360] text-white rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Real Locations & Architecture
              </span>
              <span className="text-xs text-[#7A938E] font-medium hidden sm:inline">
                • {filteredLocations.length} สถานที่สร้างแรงบันดาลใจ
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Google Maps Direct Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] tracking-tight">
              สำรวจสถานที่จริง & พิกัดบนแผนที่
            </h1>
            <p className="text-xs text-[#5C7276]">
              ตามรอยสถาปัตยกรรม คาเฟ่มินิมอล สตูดิโอคราฟต์ และแสงธรรมชาติสำหรับถ่ายงานออกแบบ
            </p>
          </div>

          {/* View Mode & Map Utility Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-[#D1DDD9] shadow-2xs">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-[#3A6360] text-white shadow-xs' : 'text-[#5C7276] hover:text-[#1E2E31]'
                }`}
                title="โหมดแบ่งหน้าจอ"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แบ่งหน้าจอ</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#3A6360] text-white shadow-xs' : 'text-[#5C7276] hover:text-[#1E2E31]'
                }`}
                title="โหมดแผนที่เต็มจอ"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แผนที่เต็มจอ</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#3A6360] text-white shadow-xs' : 'text-[#5C7276] hover:text-[#1E2E31]'
                }`}
                title="โหมดรายการ"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">รายการ</span>
              </button>
            </div>

            {/* Locate Me */}
            <button
              onClick={handleGetLocation}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#DDE5E4] text-[#1E2E31] rounded-xl text-xs font-semibold border border-[#D1DDD9] shadow-2xs transition-all cursor-pointer"
              title="หาตำแหน่งของฉัน"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#3A6360]" />
              <span className="hidden md:inline">ตำแหน่งของฉัน</span>
            </button>
          </div>
        </div>

        {/* Search, City & Category Filters */}
        <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A938E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสถานที่ สไตล์ โทนสี หรือที่อยู่..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs border border-[#D1DDD9] focus:outline-hidden focus:ring-2 focus:ring-[#3A6360] text-[#1E2E31] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A938E] hover:text-[#1E2E31]"
              >
                ✕
              </button>
            )}
          </div>

          {/* City Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCityChange(city.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city.id
                    ? 'bg-[#1E2E31] text-white shadow-xs'
                    : 'bg-white text-[#5C7276] hover:bg-[#DDE5E4] border border-[#D1DDD9]'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = locations.filter((loc) => cat === 'All' || loc.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3A6360] text-white shadow-2xs font-semibold'
                    : 'bg-white/80 text-[#5C7276] hover:bg-white hover:text-[#1E2E31] border border-[#D1DDD9]/80'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat === 'All' ? 'ทั้งหมดทุกประเภท' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#EBF1F0] text-[#3A6360]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map & List Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel: Location List */}
        <div 
          className={`w-full md:w-[380px] lg:w-[420px] border-r border-[#D1DDD9] bg-[#F4F7F6] flex flex-col overflow-y-auto scrollbar-none shrink-0 ${
            viewMode === 'map' ? 'hidden' : 'flex'
          } ${viewMode === 'list' ? 'md:w-full max-w-5xl mx-auto border-r-0' : ''}`}
        >
          {filteredLocations.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center my-auto">
              <div className="w-12 h-12 rounded-full bg-[#EBF1F0] flex items-center justify-center text-[#7A938E] mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#1E2E31] text-sm">ไม่พบสถานที่ตรงกับเงื่อนไข</p>
              <p className="text-xs text-[#7A938E] mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะ</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-[#3A6360] text-white rounded-xl text-xs font-bold hover:bg-[#2E4F4C] transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className={`p-4 space-y-3 ${viewMode === 'list' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0' : ''}`}>
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className={`rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white border-[#3A6360] shadow-md ring-2 ring-[#3A6360]/20'
                        : 'bg-white/95 hover:bg-white border-[#D1DDD9] shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Photo & Main Info */}
                    <div className="flex gap-3">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#CBDAD5] shrink-0 border border-black/5 relative">
                        <img
                          src={loc.imageUrl}
                          alt={loc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold">
                          ★ {loc.rating || 4.8}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-[#3A6360] bg-[#EBF1F0] px-2 py-0.5 rounded-md">
                              {loc.category}
                            </span>
                            <span className="text-[10px] text-[#7A938E] font-medium truncate">
                              📍 {loc.city}
                            </span>
                          </div>

                          <h3 className="text-sm font-serif italic font-bold text-[#1E2E31] leading-tight mt-1 line-clamp-1">
                            {loc.title}
                          </h3>
                          <p className="text-[11px] text-[#5C7276] font-medium line-clamp-1 mt-0.5">
                            {loc.subtitle}
                          </p>
                        </div>

                        {/* Palette Swatches */}
                        {loc.palette && loc.palette.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {loc.palette.slice(0, 5).map((hex, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                            <span className="text-[9px] text-[#7A938E] ml-1 font-mono">Palette</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address & Quick Direct Links */}
                    <div className="mt-2.5 pt-2 border-t border-[#D1DDD9]/60 flex items-center justify-between text-xs">
                      <p className="text-[10px] text-[#7A938E] truncate max-w-[200px]">
                        {loc.address}
                      </p>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowGoogleEmbedModal(loc);
                          }}
                          className="px-2 py-1 rounded-lg bg-[#EBF1F0] hover:bg-[#DDE5E4] text-[#1E2E31] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="ดู Street Map"
                        >
                          <Eye className="w-3 h-3 text-[#3A6360]" />
                          <span>ดูแผนที่</span>
                        </button>

                        <a
                          href={loc.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.title + ' ' + loc.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-[#3A6360] hover:bg-[#2E4F4C] text-white transition-colors cursor-pointer"
                          title="เปิดใน Google Maps"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Interactive Map Container */}
        <div 
          className={`flex-1 h-full min-h-[380px] relative flex flex-col ${
            viewMode === 'list' ? 'hidden' : 'flex'
          }`}
        >
          {/* Leaflet Map Stage */}
          <div ref={leafletMapContainerRef} className="w-full h-full z-0" />

          {/* Top Left: Map Style & Layer Switcher */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className="relative">
              <button
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-[#D1DDD9] flex items-center gap-2 text-xs font-bold text-[#1E2E31] hover:bg-white transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#3A6360]" />
                <span>{MAP_LAYERS[mapStyle].name.split(' ')[0]}</span>
                <span className="text-[10px] text-[#7A938E]">▼</span>
              </button>

              {showStyleMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-[#D1DDD9] p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-[#7A938E] px-2 py-1 uppercase tracking-wider">
                    เลือกสไตล์แผนที่
                  </div>
                  {(Object.keys(MAP_LAYERS) as MapTileStyle[]).map((styleKey) => (
                    <button
                      key={styleKey}
                      onClick={() => {
                        setMapStyle(styleKey);
                        setShowStyleMenu(false);
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        mapStyle === styleKey
                          ? 'bg-[#3A6360] text-white font-bold'
                          : 'hover:bg-[#EBF1F0] text-[#1E2E31]'
                      }`}
                    >
                      <span>{MAP_LAYERS[styleKey].name}</span>
                      {mapStyle === styleKey && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Right: Zoom & Fit Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#D1DDD9] flex items-center justify-center text-[#1E2E31] hover:bg-[#3A6360] hover:text-white transition-all cursor-pointer font-bold"
              title="ซูมเข้า"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#D1DDD9] flex items-center justify-center text-[#1E2E31] hover:bg-[#3A6360] hover:text-white transition-all cursor-pointer font-bold"
              title="ซูมออก"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitAllMarkers}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#D1DDD9] flex items-center justify-center text-[#3A6360] hover:bg-[#3A6360] hover:text-white transition-all cursor-pointer font-bold"
              title="แสดงสถานที่ทั้งหมด"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Location Detail Drawer (Bottom Overlay) */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 z-20 max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#D1DDD9] shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#CBDAD5] shrink-0 border border-black/5">
                    <img
                      src={selectedLocation.imageUrl}
                      alt={selectedLocation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#3A6360] bg-[#EBF1F0] px-2 py-0.5 rounded-md">
                        {selectedLocation.category}
                      </span>
                      <span className="text-xs text-[#7A938E] font-medium">
                        📍 {selectedLocation.city}, {selectedLocation.country}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-serif italic font-bold text-[#1E2E31] mt-0.5 leading-snug">
                      {selectedLocation.title}
                    </h3>
                    <p className="text-xs text-[#5C7276] line-clamp-1 mt-0.5">
                      {selectedLocation.address}
                    </p>
                    {selectedLocation.aestheticTags && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selectedLocation.aestheticTags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-[#DDE5E4] text-[#3A6360] px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 text-[#7A938E] hover:text-[#1E2E31] rounded-lg hover:bg-[#EBF1F0] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Best Angle Tip & Photography Highlights */}
              {selectedLocation.bestAngleTip && (
                <div className="mt-3 p-2.5 bg-[#EBF1F0] rounded-xl text-xs text-[#2C3E42] flex items-start gap-2 border border-[#D1DDD9]/60">
                  <Camera className="w-4 h-4 text-[#3A6360] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1E2E31]">ทริคการถ่ายรูป & มุมแสง: </span>
                    <span>{selectedLocation.bestAngleTip}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-[#D1DDD9] flex flex-wrap items-center justify-between gap-2">
                {/* Palette Colors with copy */}
                {selectedLocation.palette && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#7A938E]">Palette:</span>
                    <div className="flex -space-x-1">
                      {selectedLocation.palette.map((hex, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyHex(hex)}
                          className="w-4 h-4 rounded-full border border-white shadow-xs hover:scale-125 transition-transform cursor-pointer"
                          style={{ backgroundColor: hex }}
                          title={`คัดลอก ${hex}`}
                        />
                      ))}
                    </div>
                    {copiedHex && (
                      <span className="text-[9px] text-emerald-600 font-bold animate-in fade-in">
                        คัดลอกแล้ว!
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyCoordinates(selectedLocation)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EBF1F0] hover:bg-[#DDE5E4] text-[#1E2E31] text-xs font-semibold transition-colors cursor-pointer"
                    title="คัดลอกพิกัด GPS"
                  >
                    {copiedCoords === selectedLocation.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#7A938E]" />
                    )}
                    <span>{copiedCoords === selectedLocation.id ? 'คัดลอกแล้ว' : 'พิกัด GPS'}</span>
                  </button>

                  <button
                    onClick={() => setShowGoogleEmbedModal(selectedLocation)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DDE5E4] hover:bg-[#CBDAD5] text-[#1E2E31] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#3A6360]" />
                    <span>Google Maps Live</span>
                  </button>

                  {selectedLocation.referenceId && onSelectReference && (
                    <button
                      onClick={() => handleViewReference(selectedLocation.referenceId)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DDE5E4] hover:bg-[#CBDAD5] text-[#3A6360] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#3A6360]" />
                      <span>ดูมู้ดบอร์ด</span>
                    </button>
                  )}

                  <a
                    href={selectedLocation.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#3A6360] hover:bg-[#2E4F4C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>นำทางบน Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Live Iframe Preview Modal */}
      {showGoogleEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#D1DDD9] flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-4 bg-[#1E2E31] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#B8CAC4]" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {showGoogleEmbedModal.title}
                  </h3>
                  <p className="text-xs text-[#B8CAC4]">
                    {showGoogleEmbedModal.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={showGoogleEmbedModal.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showGoogleEmbedModal.title + ' ' + showGoogleEmbedModal.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#3A6360] hover:bg-[#2E4F4C] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>เปิด Google Maps เต็มจอ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setShowGoogleEmbedModal(null)}
                  className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded Google Maps View */}
            <div className="w-full h-[460px] bg-[#EBF1F0] relative">
              <iframe
                title="Google Maps Location View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${showGoogleEmbedModal.lat},${showGoogleEmbedModal.lng}&hl=th&z=16&output=embed`}
              />
            </div>

            <div className="p-4 bg-[#F4F7F6] border-t border-[#D1DDD9] flex items-center justify-between text-xs text-[#5C7276]">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-white px-2 py-1 rounded-md border border-[#D1DDD9]">
                  GPS: {showGoogleEmbedModal.lat.toFixed(6)}, {showGoogleEmbedModal.lng.toFixed(6)}
                </span>
                <span>{showGoogleEmbedModal.city}, {showGoogleEmbedModal.country}</span>
              </div>
              <button
                onClick={() => setShowGoogleEmbedModal(null)}
                className="px-4 py-1.5 bg-[#1E2E31] text-white font-bold rounded-xl hover:bg-black"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
