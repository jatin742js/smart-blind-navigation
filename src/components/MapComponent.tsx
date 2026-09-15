import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink, Navigation, LocateFixed, AlertTriangle } from 'lucide-react';
import { LocationRecord } from '../types.ts';

interface MapComponentProps {
  currentLocation: LocationRecord | null;
  historyLocations?: LocationRecord[];
  isEmergency?: boolean;
  onCenter?: () => void;
  className?: string;
  isLiveTracking?: boolean;
}

export default function MapComponent({
  currentLocation,
  historyLocations = [],
  isEmergency = false,
  className = '',
  isLiveTracking = true,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const lat = currentLocation?.latitude ?? 37.7764;
  const lng = currentLocation?.longitude ?? -122.4163;
  const accuracy = currentLocation?.accuracy ?? 4.0;
  const isAvailable = currentLocation && currentLocation.gpsStatus !== 'unavailable';

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update marker and paths
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Create custom pin HTML
    const iconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full ${
          isEmergency ? 'bg-rose-500 animate-ping opacity-75' : 'bg-blue-500 animate-pulse opacity-40'
        }"></div>
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full shadow-lg ${
          isEmergency ? 'bg-rose-600 text-white ring-4 ring-rose-300' : 'bg-blue-600 text-white ring-4 ring-blue-200'
        }">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2v20m10-10H2" />
          </svg>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-stick-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(customIcon);
    }

    // Accuracy circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: isEmergency ? '#e11d48' : '#2563eb',
        fillColor: isEmergency ? '#f43f5e' : '#3b82f6',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setRadius(accuracy);
      accuracyCircleRef.current.setStyle({
        color: isEmergency ? '#e11d48' : '#2563eb',
        fillColor: isEmergency ? '#f43f5e' : '#3b82f6',
      });
    }

    // History trail polyline
    if (historyLocations.length > 1) {
      const latlngs: [number, number][] = historyLocations.map((p) => [p.latitude, p.longitude]);
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 3.5,
          dashArray: '5, 8',
          opacity: 0.7,
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latlngs);
      }
    }

    // Pan smoothly to current location
    map.panTo([lat, lng], { animate: true });
  }, [lat, lng, accuracy, isEmergency, historyLocations]);

  const handleCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-0" />

      {/* Top Overlays: Status Pill & Action Buttons */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center">
          {isAvailable ? (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-sm border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-800">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate max-w-[120px] xs:max-w-none">GPS Active (±{accuracy.toFixed(1)}m)</span>
              {isLiveTracking && (
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold">
                  LIVE
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 shadow-sm text-[11px] sm:text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="truncate max-w-[140px] xs:max-w-none">GPS unavailable</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCenter}
            title="Recenter Map"
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white/95 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 text-xs font-medium transition active:scale-95 min-h-[36px]"
          >
            <LocateFixed className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-xs font-medium transition active:scale-95 min-h-[36px]"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Maps</span>
          </a>
        </div>
      </div>

      {/* Bottom Coordinates Bar */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm border border-slate-200 text-[11px] sm:text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
          <span className="font-mono font-medium">
            {lat.toFixed(5)}° N, {lng.toFixed(5)}° W
          </span>
        </div>
        {currentLocation?.speed !== undefined && (
          <div className="text-slate-500 font-medium whitespace-nowrap">
            Speed: <span className="font-bold text-slate-800">{currentLocation.speed.toFixed(1)} km/h</span>
          </div>
        )}
      </div>
    </div>
  );
}
