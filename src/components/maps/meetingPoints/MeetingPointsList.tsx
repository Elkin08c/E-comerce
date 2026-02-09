'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2, Search, Edit, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type MeetingPoint } from '../../services/logisticsService';

interface MeetingPointsListProps {
  meetingPoints: MeetingPoint[];
  selectedPointId: string | null;
  onPointSelect: (point: MeetingPoint) => void;
  onPointDelete: (pointId: string) => void;
  onPointEdit?: (point: MeetingPoint) => void;
  onToggleAvailability?: (pointId: string) => void;
  filteredZoneId?: string | null;
}

export default function MeetingPointsList({
  meetingPoints,
  selectedPointId,
  onPointSelect,
  onPointDelete,
  onPointEdit,
  // onToggleAvailability,
  filteredZoneId
}: MeetingPointsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar puntos por término de búsqueda y zona
  const filteredPoints = useMemo(() => {
    let points = meetingPoints;

    // Filtrar por zona si está seleccionada
    if (filteredZoneId) {
      points = points.filter(point => point.zoneId === filteredZoneId);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      points = points.filter(point =>
        point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        point.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        point.zone?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return points;
  }, [meetingPoints, searchTerm, filteredZoneId]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredPoints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPoints = filteredPoints.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (meetingPoints.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#1559ED] mb-4">Puntos de Encuentro</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">No hay puntos de encuentro creados</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primer punto de encuentro</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1559ED]">Puntos de Encuentro</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-32 h-8 px-3 py-1 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredPoints.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">No se encontraron puntos de encuentro</p>
            </div>
          ) : (
            paginatedPoints.map((point) => (
              <div
                key={point.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPointId === point.id
                    ? 'border-[#1559ED] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onPointSelect(point)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className={`w-5 h-5 mt-0.5 ${point.isAvailable ? 'text-[#FE9124]' : 'text-red-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900">{point.name}</div>
                        {point.zone && (
                          <Badge
                            variant="outline"
                            className="text-xs border-red-500 text-red-700 bg-red-50"
                          >
                            {point.zone.name}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {point.address}
                      </div>
                      {(point.contactPhone || point.openingHours) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {point.contactPhone && <span>☎ {point.contactPhone}</span>}
                          {point.contactPhone && point.openingHours && <span> • </span>}
                          {point.openingHours && <span>🕒 {point.openingHours}</span>}
                        </div>
                      )}
                      <div className="text-xs mt-2">
                        {point.isAvailable ? (
                          <span className="text-green-600 font-medium">● Disponible</span>
                        ) : (
                          <span className="text-red-600 font-medium">● No disponible</span>
                        )}
                        {point.capacity && (
                          <span className="text-gray-500 ml-2">• Cap: {point.capacity}/día</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onPointEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPointEdit(point);
                        }}
                        title="Editar punto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPointDelete(point.id);
                      }}
                      title="Eliminar punto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de paginación */}
        {filteredPoints.length > itemsPerPage && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredPoints.length)} de {filteredPoints.length}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${
                        currentPage === page
                          ? 'bg-[#1559ED] text-white'
                          : 'text-gray-600 hover:text-[#1559ED]'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
