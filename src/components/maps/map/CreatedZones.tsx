'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trash2, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Zone } from '../../services';

interface CreatedZonesProps {
  zones: Zone[];
  selectedZoneId: string | null;
  onZoneSelect: (zone: Zone) => void;
  onZoneDelete: (zoneId: string) => void;
  onZoneEdit?: (zone: Zone) => void;
  navigateToZone?: (zoneId: string) => void; // Nueva prop para navegar a una zona específica
}

export default function CreatedZones({ 
  zones, 
  selectedZoneId, 
  onZoneSelect, 
  onZoneDelete,
  onZoneEdit,
  navigateToZone
}: CreatedZonesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Configuración de paginación

  // Filtrar zonas por término de búsqueda
  const filteredZones = useMemo(() => 
    zones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.type?.toLowerCase().includes(searchTerm.toLowerCase()) 
    ), [zones, searchTerm]
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, endIndex);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Función para navegar a la página de una zona específica
  const navigateToZonePage = (zoneId: string) => {
    const zoneIndex = filteredZones.findIndex(zone => zone.id === zoneId);
    if (zoneIndex !== -1) {
      const targetPage = Math.ceil((zoneIndex + 1) / itemsPerPage);
      setCurrentPage(targetPage);
      console.log(`📄 Navegando a página ${targetPage} para zona ${zoneId} (índice ${zoneIndex})`);
    }
  };

  // Exponer la función de navegación al componente padre
  useEffect(() => {
    if (navigateToZone) {
      // Crear una función que el padre puede llamar
      (window as any).navigateToZonePage = navigateToZonePage;
    }
  }, [navigateToZone, filteredZones, itemsPerPage]);

  const getZoneColor = (zoneType: string) => {
    switch (zoneType) {
      case 'SECURE':
        return 'bg-[#10B981]';
      case 'RESTRICTED':
        return 'bg-yellow-500';
      case 'DANGER':
        return 'bg-red-500';
      default:
        return 'bg-[#10B981]';
    }
  };

  const getZoneTypeLabel = (zoneType: string) => {
    switch (zoneType) {
      case 'SECURE':
        return 'Segura';
      case 'RESTRICTED':
        return 'Restringida';
      case 'DANGER':
        return 'Peligro';
      default:
        return 'Segura';
    }
  };

  const formatArea = (areaKm2: number) => {
    if (areaKm2 < 1) {
      return `${(areaKm2 * 1000).toFixed(0)} m²`;
    }
    return `${areaKm2.toFixed(2)} km²`;
  };

  if (zones.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#1559ED] mb-4">Zonas Creadas</h3>
          <div className="text-left text-gray-500 py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm">No hay zonas creadas</p>
            <p className="text-xs text-gray-400 mt-1">Crea tu primera zona dibujando en el mapa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1559ED]">Zonas Creadas</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-32 h-8 px-3 py-1 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredZones.length === 0 ? (
            <div className="text-left text-gray-500 py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm">
                {searchTerm ? 'No se encontraron zonas que coincidan con la búsqueda' : 'No hay zonas creadas'}
              </p>
              {!searchTerm && (
                <p className="text-xs text-gray-400 mt-1">Crea tu primera zona dibujando en el mapa</p>
              )}
            </div>
          ) : (
            paginatedZones.map((zone) => (
              <div
                key={zone.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedZoneId === zone.id
                    ? 'border-[#1559ED] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onZoneSelect(zone)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getZoneColor(zone.type || 'SECURE')}`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{zone.name}</div>
                      <div className="text-sm text-gray-600">
                        {zone.polygon?.length || 0} puntos • {formatArea(zone.areaKm2 || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Tipo: {getZoneTypeLabel(zone.type || 'SECURE')} 
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {onZoneEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onZoneEdit(zone);
                        }}
                        title="Editar zona"
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
                        onZoneDelete(zone.id);
                      }}
                      title="Eliminar zona"
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
        {filteredZones.length > itemsPerPage && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredZones.length)} de {filteredZones.length} zonas
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