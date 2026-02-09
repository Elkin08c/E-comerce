'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, MapPin } from 'lucide-react';
import { type Zone } from '../../services';
import { type MeetingPoint } from '../../services/logisticsService';

interface ZoneFilterProps {
  zones: Zone[];
  meetingPoints: MeetingPoint[];
  selectedZoneId: string | null;
  onZoneSelect: (zoneId: string | null) => void;
}

export default function ZoneFilter({
  zones,
  meetingPoints,
  selectedZoneId,
  onZoneSelect
}: ZoneFilterProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);

  const provinces = useMemo(() => {
    const provinceMap = new Map<string, { id: string; name: string }>();
    zones.forEach(zone => {
      if (zone.city?.province) {
        provinceMap.set(zone.city.province.id, {
          id: zone.city.province.id,
          name: zone.city.province.name
        });
      }
    });
    return Array.from(provinceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [zones]);

  const filteredZones = useMemo(() => {
    if (!selectedProvinceId) return zones;
    return zones.filter(zone => zone.city?.province?.id === selectedProvinceId);
  }, [zones, selectedProvinceId]);

  const zoneStats = useMemo(() => {
    return filteredZones.map(zone => {
      const points = meetingPoints.filter(p => p.zoneId === zone.id);
      const activePoints = points.filter(p => p.isAvailable);

      return {
        zone,
        totalPoints: points.length,
        activePoints: activePoints.length,
        hasPoints: points.length > 0
      };
    });
  }, [filteredZones, meetingPoints]);

  const { withPoints, withoutPoints } = useMemo(() => {
    const withP = zoneStats.filter(z => z.hasPoints);
    const withoutP = zoneStats.filter(z => !z.hasPoints);
    return { withPoints: withP, withoutPoints: withoutP };
  }, [zoneStats]);

  const getStatusBadge = (stat: typeof zoneStats[0]) => {
    if (!stat.hasPoints) {
      return (
        <Badge variant="destructive" className="text-xs">
          Sin puntos
        </Badge>
      );
    }

    if (stat.activePoints === 0) {
      return (
        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 bg-yellow-50">
          {stat.totalPoints} inactivos
        </Badge>
      );
    }

    if (stat.activePoints < stat.totalPoints) {
      return (
        <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 bg-blue-50">
          {stat.activePoints}/{stat.totalPoints} activos
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
        {stat.totalPoints} activos
      </Badge>
    );
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#1559ED]" />
          <h3 className="text-sm font-semibold text-gray-900">
            Filtrar por Zona Peligrosa
          </h3>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-600">
            <span>{withPoints.length} con puntos</span>
            <span className="text-gray-300">•</span>
            <span>{withoutPoints.length} sin puntos</span>
          </div>
        </div>

        {provinces.length > 1 && (
          <div className="mb-3">
            <select
              value={selectedProvinceId || ''}
              onChange={(e) => setSelectedProvinceId(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1559ED] focus:border-transparent"
            >
              <option value="">Todas las provincias</option>
              {provinces.map(province => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedZoneId && (
          <button
            onClick={() => onZoneSelect(null)}
            className="mb-3 text-xs text-[#1559ED] hover:text-[#1559ED]/80 font-medium transition-colors"
          >
            Limpiar filtro de zona
          </button>
        )}

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {withoutPoints.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Requieren atención
              </p>
              {withoutPoints.map(({ zone, totalPoints, activePoints }) => (
                <button
                  key={zone.id}
                  onClick={() => onZoneSelect(zone.id === selectedZoneId ? null : zone.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md border transition-all ${
                    selectedZoneId === zone.id
                      ? 'border-[#1559ED] bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">{zone.name}</span>
                  </div>
                  {getStatusBadge({ zone, totalPoints, activePoints, hasPoints: totalPoints > 0 })}
                </button>
              ))}
            </div>
          )}

          {withPoints.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-3">
                Con puntos asignados
              </p>
              {withPoints.map(({ zone, totalPoints, activePoints }) => (
                <button
                  key={zone.id}
                  onClick={() => onZoneSelect(zone.id === selectedZoneId ? null : zone.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md border transition-all ${
                    selectedZoneId === zone.id
                      ? 'border-[#1559ED] bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">{zone.name}</span>
                  </div>
                  {getStatusBadge({ zone, totalPoints, activePoints, hasPoints: totalPoints > 0 })}
                </button>
              ))}
            </div>
          )}

          {filteredZones.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">
                {selectedProvinceId
                  ? 'No hay zonas peligrosas en esta provincia'
                  : 'No hay zonas peligrosas disponibles'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
