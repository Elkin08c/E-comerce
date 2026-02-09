"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { type CreateZoneDto, type Zone } from '../../services';
import {
  useGeographic,
  useCitiesByProvince,
} from '../../hooks/useGeographic';

type Province = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
  provinceId: string;
};
import { useLogisticsZones } from '../../hooks/useLogisticsZones';
import { toast } from 'sonner';
import TransportCompanySelector from './TransportCompanySelector';

interface ZoneFormProps {
  zone?: Zone | null;
  polygon: [number, number][];
  onSave: (zoneData: CreateZoneDto) => void;
  onCancel: () => void;
  isEditing?: boolean;
  onZoneTypeChange?: (zoneType: 'SECURE' | 'RESTRICTED' | 'DANGER') => void;     
  selectedCityId?: string;
  autoDetectedLocation?: {
    province?: { id: string; name: string };
    city?: { id: string; name: string };
  };
  onRecalculateLocation?: () => void;
  onEditLocationManually?: () => void;
}

export default function ZoneForm({ 
  zone, 
  polygon, 
  onSave, 
  onCancel, 
  isEditing = false,
  onZoneTypeChange,
  selectedCityId,
  autoDetectedLocation,
  onRecalculateLocation,
  onEditLocationManually
}: ZoneFormProps) {
  const [formData, setFormData] = useState<CreateZoneDto>({
    name: zone?.name || '',
    description: zone?.description || '',
    cityId: zone?.cityId || selectedCityId || autoDetectedLocation?.city?.id || '',
    polygon: polygon,
    type: zone?.type || 'SECURE',
    ...(zone?.shippingPrice && { shippingPrice: zone.shippingPrice }),
    ...(zone?.areaKm2 && { areaKm2: zone.areaKm2 }),
    ...(zone?.transportCompanyId && { transportCompanyId: zone.transportCompanyId })
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para los selects de ubicación
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [isEditingLocationManually, setIsEditingLocationManually] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [zoneLocationInfo, setZoneLocationInfo] = useState<{
    province?: { id: string; name: string };
    city?: { id: string; name: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Usar hook con cache compartido para zonas existentes (para validación de nombres)
  const { allZones: existingZones } = useLogisticsZones();

  // Estado para controlar carga lazy de provincias
  const [loadProvincesFlag, setLoadProvincesFlag] = useState(false);

  // Apollo hooks for geographic data
  const {
    provinces: apolloProvinces,
    provincesLoading,
  } = useGeographic({ skip: !loadProvincesFlag });

  // Lazy load cities by province
  const { cities: apolloCities, loading: citiesLoading } = useCitiesByProvince(
    selectedProvinceId,
    { skip: !selectedProvinceId }
  );

  // Sync Apollo data with local state
  useEffect(() => {
    setProvinces(apolloProvinces);
  }, [apolloProvinces]);

  useEffect(() => {
    setCities(apolloCities);
  }, [apolloCities]);

  // Actualizar formulario cuando se detecte automáticamente la ubicación
  useEffect(() => {
    if (autoDetectedLocation) {
      setFormData(prev => ({
        ...prev,
        cityId: autoDetectedLocation.city?.id || prev.cityId
      }));
    }
  }, [autoDetectedLocation]);

  // Cuando se recibe una zona para editar, cargar su provincia y ciudad
  useEffect(() => {
    if (zone && isEditing && !autoDetectedLocation) {
      loadZoneLocation(zone);
      buildZoneLocationInfo(zone);
    }
  }, [zone, isEditing, autoDetectedLocation]);

  // Actualizar formData cuando cambie la zona
  useEffect(() => {
    if (zone) {
      setFormData(prev => ({
        ...prev,
        name: zone.name || '',
        description: zone.description || '',
        cityId: zone.cityId || '',
        type: zone.type || 'SECURE',
        ...(zone.shippingPrice && { shippingPrice: zone.shippingPrice }),
        ...(zone.areaKm2 && { areaKm2: zone.areaKm2 }),
        ...(zone.transportCompanyId && { transportCompanyId: zone.transportCompanyId })
      }));
    }
  }, [zone]);

  // Función para cargar la ubicación de una zona existente
  const loadZoneLocation = async (zoneData: Zone) => {
    try {
      setLoading(true);
      setFormData(prev => ({ ...prev, cityId: zoneData.cityId }));

      if (apolloCities.length > 0) {
        const zoneCity = apolloCities.find((c: any) => c.id === zoneData.cityId);
        if (zoneCity) {
          setSelectedProvinceId(zoneCity.provinceId);
        }
      }
    } catch (error) {
      console.error('Error cargando ubicación de la zona:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar provincias (usando Apollo hook con lazy loading)
  const loadProvinces = () => {
    if (!loadProvincesFlag) {
      setLoadProvincesFlag(true);
    }
  };

  // Cities are automatically loaded by useCitiesByProvince hook when selectedProvinceId changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setCities([]);
    }
  }, [selectedProvinceId]);

  // Validar nombre cuando cambie la ciudad
  useEffect(() => {
    if (formData.name && formData.cityId && existingZones.length > 0) {
      const trimmedName = formData.name.trim();
      const duplicateZone = existingZones.find(existingZone => 
        existingZone.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (duplicateZone) {
        setErrors(prev => ({
          ...prev,
          name: 'Ya existe una zona con este nombre en esta ciudad'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.name === 'Ya existe una zona con este nombre en esta ciudad') {
            delete newErrors.name;
          }
          return newErrors;
        });
      }
    }
  }, [formData.cityId, formData.name, existingZones, zone]);

  // Establecer provincia inicial si hay ciudad seleccionada
  useEffect(() => {
    if (formData.cityId && cities.length > 0) {
      const city = cities.find((c: City) => c.id === formData.cityId);
      if (city) {
        setSelectedProvinceId(city.provinceId);
      }
    }
  }, [formData.cityId, cities]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      polygon: polygon
    }));
  }, [polygon]);

  // Calcular automáticamente el área cuando cambie el polígono
  useEffect(() => {
    if (polygon.length >= 3) {
      const calculatedArea = calculateArea();
      setFormData(prev => ({
        ...prev,
        areaKm2: calculatedArea
      }));
    }
  }, [polygon]);

  // Actualizar IDs cuando cambien las selecciones
  useEffect(() => {
    if (selectedCityId && !zone?.cityId) {
      setFormData(prev => ({
        ...prev,
        cityId: selectedCityId
      }));
    }
  }, [selectedCityId, zone?.cityId]);

  // Función para verificar si la detección automática es completa
  const isAutoDetectionComplete = (): boolean => {
    const location = autoDetectedLocation || zoneLocationInfo;
    if (!location) return true;
    
    return !!(location.province && location.city);
  };

  // Función para obtener los campos faltantes en la detección automática
  const getMissingDetectionFields = (): string[] => {
    const location = autoDetectedLocation || zoneLocationInfo;
    if (!location) return [];
    
    const missing: string[] = [];
    if (!location.province) missing.push('Provincia');
    if (!location.city) missing.push('Ciudad');
    
    return missing;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede tener más de 100 caracteres';
    } else {
      // Validar que no exista una zona con el mismo nombre en la misma ciudad
      const duplicateZone = existingZones.find(existingZone => 
        existingZone.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      
      if (duplicateZone) {
        newErrors.name = 'Ya existe una zona con este nombre en esta ciudad';
      }
    }

    // Validación de la descripción
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La descripción no puede tener más de 1000 caracteres';
    }

    // En modo edición, permitir guardar aunque no haya cityId si ya existía
    if (!formData.cityId && !zone?.cityId) {
      newErrors.cityId = 'La ciudad es requerida';
    }

    if (polygon.length < 3) {
      newErrors.polygon = 'Se requieren al menos 3 puntos para crear una zona';
    }

    if (formData.shippingPrice !== undefined && formData.shippingPrice < 0) {
      newErrors.shippingPrice = 'El precio de envío debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 handleSubmit ejecutado', { formData, isEditing, zone: zone?.id });

    // Si estamos editando y falta cityId, usar el de la zona original
    const finalData = { ...formData };
    if (isEditing && zone) {
      if (!finalData.cityId && zone.cityId) {
        finalData.cityId = zone.cityId;
      }
    }

    const isValid = validateForm();
    console.log('🔵 validateForm resultado:', isValid, 'Errores:', errors);

    if (isValid) {
      console.log('✅ Llamando onSave con:', finalData);
      onSave(finalData);
    } else {
      console.log('❌ Formulario NO válido. Errores:', errors);
    }
  };

  const handleInputChange = (field: keyof CreateZoneDto, value: string | number | boolean | undefined) => {
    setFormData(prev => {
      const newData = { ...prev } as CreateZoneDto;
      if (value === null || value === undefined || value === '') {
        delete newData[field];
      } else {
        (newData as any)[field] = value;
      }
      return newData;
    });

    // Validación en tiempo real para el nombre
    if (field === 'name') {
      const trimmedValue = String(value).trim();
      if (trimmedValue && trimmedValue.length < 3) {
        setErrors(prev => ({
          ...prev,
          [field]: 'El nombre debe tener al menos 3 caracteres'
        }));
      } else if (trimmedValue && trimmedValue.length > 100) {
        setErrors(prev => ({
          ...prev,
          [field]: 'El nombre no puede tener más de 100 caracteres'
        }));
      } else if (trimmedValue && formData.cityId) {
        // Validar duplicado solo si ya se seleccionó una ciudad
        const duplicateZone = existingZones.find(existingZone => 
          existingZone.name.toLowerCase() === trimmedValue.toLowerCase() 
        );
        
        if (duplicateZone) {
          setErrors(prev => ({
            ...prev,
            [field]: 'Ya existe una zona con este nombre en esta ciudad'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            [field]: ''
          }));
        }
      } else {
        // Limpiar error si es válido
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    } else {
      // Limpiar error del campo para otros campos
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    }

    // Si cambia el tipo de zona, notificar al componente padre
    if (field === 'type' && onZoneTypeChange) {
      onZoneTypeChange(value as 'SECURE' | 'RESTRICTED' | 'DANGER');
    }
  };

  // Función para manejar la edición manual de la ubicación
  const handleEditLocationManually = async () => {
    setIsEditingLocationManually(true);
    
    if (autoDetectedLocation) {
      await loadAutoDetectedLocation(autoDetectedLocation);
    } else if (zoneLocationInfo) {
      await loadAutoDetectedLocation(zoneLocationInfo);
    }
    
    if (onEditLocationManually) {
      onEditLocationManually();
    }
  };

  // Función para construir la información de ubicación de una zona existente
  const buildZoneLocationInfo = async (zoneData: Zone) => {
    try {
      const zoneCity = apolloCities.find((c: any) => c.id === zoneData.cityId);

      if (zoneCity) {
        const zoneProvince = apolloProvinces.find((p: any) => p.id === zoneCity.provinceId);

        const locationInfo = {
          province: zoneProvince ? { id: zoneProvince.id, name: zoneProvince.name } : undefined,
          city: { id: zoneCity.id, name: zoneCity.name }
        };

        setZoneLocationInfo(locationInfo);
      }
    } catch (error) {
      console.error('Error construyendo información de ubicación de la zona:', error);
    }
  };

  // Función para cargar la ubicación desde autoDetectedLocation
  const loadAutoDetectedLocation = async (location: {
    province?: { id: string; name: string };
    city?: { id: string; name: string };
  }) => {
    try {
      setLoading(true);

      if (location.province && location.city) {
        setSelectedProvinceId(location.province.id);
        setFormData(prev => ({ ...prev, cityId: location.city!.id }));
      }
    } catch (error) {
      console.error('Error cargando ubicación automática:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    // Limpiar ciudad cuando cambie la provincia
    setFormData(prev => ({
      ...prev,
      cityId: ''
    }));
    // Limpiar lista
    setCities([]);
  };

  const handleCityChange = (cityId: string) => {
    setFormData(prev => ({
      ...prev,
      cityId
    }));
  };

  const calculateArea = useCallback((): number => {
    if (polygon.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i][0] * polygon[j][1];
      area -= polygon[j][0] * polygon[i][1];
    }
    area = Math.abs(area) / 2;

    // Convertir a km² (aproximado)
    return parseFloat((area * 111 * 111).toFixed(2));
  }, [polygon]);

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-[#1559ED]">
          {isEditing ? 'Editar Zona' : 'Crear Nueva Zona'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success banner */}
          {successBanner && (
            <div className="p-2 rounded bg-green-50 border border-green-200 text-green-800 text-sm">
              {successBanner}
            </div>
          )}

          {/* Nombre */}
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Zona Norte - Quito"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción opcional de la zona"
              rows={3}
            />
          </div>

          {/* Información de ubicación - Automática o Manual */}
          {(autoDetectedLocation || zoneLocationInfo) && !isEditingLocationManually ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-800">
                    📍 {autoDetectedLocation ? 'Ubicación detectada automáticamente:' : 'Ubicación de la zona:'}
                  </p>
                  <div className="flex items-center gap-1">
                    {onRecalculateLocation && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRecalculateLocation}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                        title="Recalcular ubicación"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                          <path d="M21 3v5h-5"/>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                          <path d="M3 21v-5h5"/>
                        </svg>
                      </Button>
                    )}
                    {onEditLocationManually && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleEditLocationManually}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        title="Editar ubicación manualmente"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  {(autoDetectedLocation?.province || zoneLocationInfo?.province) && (
                    <p><span className="font-medium">Provincia:</span> {(autoDetectedLocation?.province || zoneLocationInfo?.province)?.name}</p>
                  )}
                  {(autoDetectedLocation?.city || zoneLocationInfo?.city) && (
                    <p><span className="font-medium">Ciudad:</span> {(autoDetectedLocation?.city || zoneLocationInfo?.city)?.name}</p>
                  )}
                </div>
                
                {/* Mensaje de detección incompleta */}
                {!isAutoDetectionComplete() && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="text-yellow-800 font-medium mb-1">⚠️ Detección incompleta</p>
                    <p className="text-yellow-700">
                      No se logró detectar: <span className="font-medium">{getMissingDetectionFields().join(', ')}</span>
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Se recomienda usar el modo manual para completar la información.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Mostrar selects manuales
            <>
              {/* Provincia */}
              <div>
                <Label htmlFor="province">Provincia *</Label>
                <SearchableSelect
                  value={selectedProvinceId}
                  onValueChange={handleProvinceChange}
                  options={provinces.map((p: any) => ({ value: p.id, label: p.name }))}
                  placeholder={provincesLoading ? "Cargando provincias..." : "Selecciona una provincia"}
                  searchPlaceholder="Buscar provincia..."
                  emptyMessage="No se encontraron provincias"
                  disabled={provincesLoading}
                  onOpenChange={(open) => {
                    if (open && provinces.length === 0) {
                      loadProvinces();
                    }
                  }}
                />
              </div>

              {/* Ciudad */}
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <SearchableSelect
                  value={formData.cityId}
                  onValueChange={handleCityChange}
                  options={cities.map((c: any) => ({ value: c.id, label: c.name }))}
                  placeholder={citiesLoading ? "Cargando ciudades..." : !selectedProvinceId ? "Selecciona primero una provincia" : "Selecciona una ciudad"}
                  searchPlaceholder="Buscar ciudad..."
                  emptyMessage={selectedProvinceId ? "No hay ciudades disponibles" : "Selecciona primero una provincia"}
                  disabled={!selectedProvinceId || citiesLoading}
                />
                {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>}
              </div>
            </>
          )}

          {/* Tipo de zona */}
          <div>
            <Label htmlFor="type">Tipo de Zona *</Label>
            <SearchableSelect
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              options={[
                { value: 'SECURE', label: 'Zona Segura' },
                { value: 'RESTRICTED', label: 'Zona Restringida' },
                { value: 'DANGER', label: 'Zona Peligrosa' }
              ]}
              placeholder="Selecciona el tipo de zona"
            />
          </div>

          {/* Precio de envío */}
          <div>
            <Label htmlFor="shippingPrice">Precio de Envío (Opcional)</Label>
            <Input
              id="shippingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.shippingPrice || ''}
              onChange={(e) => handleInputChange('shippingPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              className={errors.shippingPrice ? 'border-red-500' : ''}
            />
            {errors.shippingPrice && <p className="text-red-500 text-xs mt-1">{errors.shippingPrice}</p>}
          </div>

          {/* Empresa de transporte */}
          <div>
            <TransportCompanySelector
              value={formData.transportCompanyId || ''}
              onChange={(value) => handleInputChange('transportCompanyId', value)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#FE9124] hover:bg-[#FE9124]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}