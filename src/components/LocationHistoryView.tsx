import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Filter,
  ExternalLink,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { LocationRecord } from '../types.ts';
import MapComponent from './MapComponent.tsx';

interface LocationHistoryViewProps {
  locations: LocationRecord[];
  isLiveTracking: boolean;
  onFilterDate: (date: string) => void;
}

export default function LocationHistoryView({
  locations,
  isLiveTracking,
  onFilterDate,
}: LocationHistoryViewProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [activeLoc, setActiveLoc] = useState<LocationRecord | null>(locations[0] || null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    onFilterDate(val);
  };

  const handleClear = () => {
    setSelectedDate('');
    onFilterDate('');
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">GPS Trail & Location Telemetry</h3>
          <p className="text-xs text-slate-500">
            Waypoints recorded when blind user is navigating with the smart stick.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {selectedDate && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Map of selected/active point with trail */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <span>Trail Map Projection</span>
          <span className="text-[11px] font-normal text-slate-400">
            {locations.length} coordinates plotted
          </span>
        </h4>
        <div className="h-64 sm:h-80">
          <MapComponent
            currentLocation={activeLoc || locations[0] || null}
            historyLocations={locations}
            isLiveTracking={isLiveTracking}
          />
        </div>
      </div>

      {/* List of GPS coordinates: Mobile Cards for < sm, Table for >= sm */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Mobile Cards View */}
        <div className="sm:hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between">
            <span>Waypoints Log</span>
            <span>Tap to View</span>
          </div>
          {locations.map((loc) => {
            const isSelected = activeLoc?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setActiveLoc(loc)}
                className={`p-3.5 transition cursor-pointer ${
                  isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs py-1 px-2 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {loc.address || 'Navigation Waypoint'}
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 pt-1 border-t border-slate-100">
                  <span>{loc.latitude.toFixed(5)}°, {loc.longitude.toFixed(5)}°</span>
                  <span>±{loc.accuracy.toFixed(1)}m • {loc.speed !== undefined ? `${loc.speed.toFixed(1)} km/h` : '0 km/h'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Nearest Address</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {locations.map((loc) => {
                const isSelected = activeLoc?.id === loc.id;
                return (
                  <tr
                    key={loc.id}
                    onClick={() => setActiveLoc(loc)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-blue-50/80 font-semibold text-blue-950' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {new Date(loc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {loc.latitude.toFixed(6)}°, {loc.longitude.toFixed(6)}°
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      ±{loc.accuracy.toFixed(1)}m
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {loc.speed !== undefined ? `${loc.speed.toFixed(1)} km/h` : '—'}
                    </td>
                    <td className="py-3 px-4 font-sans max-w-xs truncate text-slate-700">
                      {loc.address || 'Navigation Waypoint'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-sans">
                      <a
                        href={`https://www.google.com/maps?q=${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
