'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair } from 'lucide-react';
import { type MeetingPoint, type CreateMeetingPointDto, type Zone } from '../../services';
import { useLogisticsZones } from '../../hooks/useLogisticsZones';

interface MeetingPointFormProps {
  meetingPoint?: MeetingPoint | null;
  onSave: (data: CreateMeetingPointDto) => void;
  onCancel: () => void;
  isEditing?: boolean;
  batchMode?: boolean;
  batchCount?: number;
  onCoordinateSelect: (lat: number, lng: number) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
  autoDetectedAddress?: string;
  onZoneSelect?: (zoneId: string) => void;
  preSelectedZoneId?: string | null;
  zones?: Zone[];  // Zonas peligrosas pre-cargadas desde MeetingPointsPage
}

export default function MeetingPointForm({
  meetingPoint,
  onSave,
  onCancel,
  isEditing = false,
  batchMode = false,
  batchCount = 0,
  onCoordinateSelect,
  selectedCoordinates,
  //autoDetectedAddress,
  onZoneSelect,
  preSelectedZoneId,
  zones: zonesFromProps
}: MeetingPointFormProps) {
  const [formData, setFormData] = useState<CreateMeetingPointDto>({
    name: meetingPoint?.name || '',
    address: meetingPoint?.address || '',
    latitude: meetingPoint?.latitude || 0,
    longitude: meetingPoint?.longitude || 0,
    zoneId: meetingPoint?.zoneId || preSelectedZoneId || '',
    description: meetingPoint?.description || '',
    reference: meetingPoint?.reference || '',
    contactPhone: meetingPoint?.contactPhone || '',
    openingHours: meetingPoint?.openingHours || '',
    capacity: meetingPoint?.capacity || undefined,
    priority: meetingPoint?.priority || 0,
    isAvailable: meetingPoint?.isAvailable ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasLoadedZoneRef = useRef(false);

  // Usar hook con cache compartido para zonas (solo si no se pasan como prop)
  const { zones: hookZones, loading: loadingZonesHook } = useLogisticsZones({
    onlyDanger: true,
    onlyActive: true
  });

  // Usar zonas del prop si están disponibles, sino del hook
  const zones = useMemo(() => {
    if (zonesFromProps && zonesFromProps.length > 0) {
      return zonesFromProps;
    }
    return hookZones;
  }, [zonesFromProps, hookZones]);

  const loadingZones = !zonesFromProps?.length && loadingZonesHook;

  // Actualizar coordenadas si el usuario selecciona en el mapa
  useEffect(() => {
    if (selectedCoordinates) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedCoordinates.lat,
        longitude: selectedCoordinates.lng
      }));
    }
  }, [selectedCoordinates]);

  // Actualizar datos si se edita un punto existente
  useEffect(() => {
    if (meetingPoint) {
      setFormData({
        name: meetingPoint.name || '',
        address: meetingPoint.address || '',
        latitude: meetingPoint.latitude || 0,
        longitude: meetingPoint.longitude || 0,
        zoneId: meetingPoint.zoneId || '',
        description: meetingPoint.description || '',
        reference: meetingPoint.reference || '',
        contactPhone: meetingPoint.contactPhone || '',
        openingHours: meetingPoint.openingHours || '',
        capacity: meetingPoint.capacity || undefined,
        priority: meetingPoint.priority || 0,
        isAvailable: meetingPoint.isAvailable ?? true
      });

      // Cuando se edita, cargar la zona en el mapa solo una vez
      if (isEditing && meetingPoint.zoneId && onZoneSelect && !hasLoadedZoneRef.current) {
        hasLoadedZoneRef.current = true;
        onZoneSelect(meetingPoint.zoneId);
      }
    } else {
      // Resetear cuando no hay punto seleccionado
      hasLoadedZoneRef.current = false;
    }
  }, [meetingPoint, isEditing, onZoneSelect]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.zoneId) {
      newErrors.zoneId = 'Debes seleccionar una zona';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.coordinates = 'Debes seleccionar una ubicación en el mapa';
    }

    if (formData.contactPhone && formData.contactPhone.length < 7) {
      newErrors.contactPhone = 'El teléfono debe tener al menos 7 dígitos';
    }

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'La capacidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const cleanData: any = {
        name: formData.name,
        address: formData.address,
        latitude: typeof formData.latitude === 'string' ? parseFloat(formData.latitude) : formData.latitude,
        longitude: typeof formData.longitude === 'string' ? parseFloat(formData.longitude) : formData.longitude,
        ...(formData.description && { description: formData.description }),
        ...(formData.reference && { reference: formData.reference }),
        ...(formData.contactPhone && { contactPhone: formData.contactPhone }),
        ...(formData.openingHours && { openingHours: formData.openingHours }),
        ...(formData.capacity && typeof formData.capacity === 'number' && { capacity: formData.capacity }),
        ...(formData.priority && typeof formData.priority === 'number' && { priority: formData.priority }),
        ...(formData.isAvailable !== undefined && { isAvailable: formData.isAvailable })
      };

      // Solo incluir zoneId al crear, no al editar
      if (!isEditing) {
        cleanData.zoneId = formData.zoneId;
      }

      onSave(cleanData);
    }
  };

  const handleInputChange = (field: keyof CreateMeetingPointDto, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSelectCoordinates = () => {
    // Hacer scroll al mapa para que el usuario pueda hacer clic
    const mapElement = document.querySelector('.leaflet-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Destacar visualmente el mapa por 3 segundos con animación
      const mapContainer = mapElement.closest('.bg-white.rounded-lg.shadow-sm');
      if (mapContainer) {
        mapContainer.classList.add('ring-4', 'ring-[#FE9124]', 'ring-opacity-70', 'transition-all', 'duration-300');
        
        // Agregar mensaje temporal sobre el mapa
        const existingMessage = document.getElementById('map-click-instruction');
        if (!existingMessage) {
          const message = document.createElement('div');
          message.id = 'map-click-instruction';
          message.className = 'absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#FE9124] text-white px-6 py-3 rounded-lg shadow-lg font-medium text-sm animate-bounce';
          message.innerHTML = '👆 Haz clic en cualquier punto del mapa';
          mapContainer.appendChild(message);
          
          setTimeout(() => {
            message.remove();
          }, 3000);
        }
        
        setTimeout(() => {
          mapContainer.classList.remove('ring-4', 'ring-[#FE9124]', 'ring-opacity-70');
        }, 3000);
      }
    }
    
    // Si ya hay coordenadas, centrar en ellas
    if (formData.latitude && formData.longitude) {
      onCoordinateSelect(formData.latitude, formData.longitude);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-[#1559ED]">
          {isEditing 
            ? 'Editar Punto de Encuentro' 
            : batchMode 
              ? ` Crear Múltiples Puntos (${batchCount} agregados)` 
              : 'Crear Nuevo Punto de Encuentro'}
        </CardTitle>
        {batchMode && (
          <p className="text-xs text-gray-600 mt-2">
            Completa el formulario y presiona "Agregar". Puedes agregar varios puntos antes de guardar todos.
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zona */}
          <div>
            <Label htmlFor="zoneId">Zona (Solo zonas PELIGROSAS) *</Label>
            <Select
              value={formData.zoneId}
              onValueChange={(value) => {
                handleInputChange('zoneId', value);
                if (onZoneSelect) onZoneSelect(value);
              }}
              disabled={loadingZones || isEditing}
            >
              <SelectTrigger className={errors.zoneId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingZones ? "Cargando zonas..." : "Selecciona una zona peligrosa"} />
              </SelectTrigger>
              <SelectContent>
                {zones.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                No se puede cambiar la zona al editar un punto existente
              </p>
            )}
            {errors.zoneId && <p className="text-red-500 text-xs mt-1">{errors.zoneId}</p>}
          </div>

          {/* Nombre */}
          <div>
            <Label htmlFor="name">Nombre del Lugar *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Farmacia San Juan"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Dirección */}
          <div>
            <Label htmlFor="address">Dirección Exacta *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ej: Rocafuerte y García Moreno"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Referencia */}
          <div>
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              value={formData.reference || ''}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="Ej: Frente al parque central"
            />
          </div>

          {/* Coordenadas */}
          <div className={`p-4 border-2 rounded-lg transition-all ${
            formData.latitude && formData.longitude 
              ? 'bg-green-50 border-green-300' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-[#1559ED]">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación en el Mapa *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectCoordinates}
                className="text-[#FE9124] border-[#FE9124] hover:bg-orange-50"
                title="Resaltar el mapa para hacer clic y seleccionar coordenadas"
              >
                <Crosshair className="w-4 h-4 mr-1" />
                Seleccionar en Mapa
              </Button>
            </div>
            {!formData.latitude && !formData.longitude && (
              <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                👆 Haz clic en el botón "Seleccionar en Mapa" y luego en cualquier punto del mapa
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Latitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-xs">Longitud</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                  readOnly
                />
              </div>
            </div>
            {errors.coordinates && <p className="text-red-500 text-xs mt-2">{errors.coordinates}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <Label htmlFor="contactPhone">
              Teléfono de Contacto <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone || ''}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="Ej: 0999999999"
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
          </div>

          {/* Horario */}
          <div>
            <Label htmlFor="openingHours">
              Horario de Atención <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <Input
              id="openingHours"
              value={formData.openingHours || ''}
              onChange={(e) => handleInputChange('openingHours', e.target.value)}
              placeholder="Ej: Lun-Vie 8:00-18:00, Sáb 9:00-13:00"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description">Descripción del Lugar</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Breve descripción o instrucciones para llegar al punto"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className={`flex-1 text-white ${
                batchMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-[#FE9124] hover:bg-[#FE9124]/90'
              }`}
            >
              {isEditing ? 'Actualizar' : batchMode ? '➕ Agregar Punto' : 'Crear'}
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
