'use client';

import { useState, useEffect } from 'react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Label } from '@/components/ui/label';
import { useGeographic, useCitiesByProvince } from '../../hooks/useGeographic';

interface LocationSelectorProps {
  selectedCityId: string;
  onCityChange: (cityId: string) => void;
}

// Los datos ahora vienen del backend, no necesitamos datos de ejemplo

export default function LocationSelector({
  selectedCityId,
  onCityChange,
}: LocationSelectorProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  // Use Apollo-based hook for geographic data (with cache)
  const {
    provinces,
    provincesLoading,
  } = useGeographic();

  const { cities, loading: citiesLoading } = useCitiesByProvince(selectedProvinceId, { skip: !selectedProvinceId });

  // Determinar la provincia basada en la ciudad seleccionada
  useEffect(() => {
    if (selectedCityId && !selectedProvinceId && cities.length > 0) {
      const city = cities.find((c: any) => c.id === selectedCityId);
      if (city) {
        setSelectedProvinceId(city.provinceId);
      }
    }
  }, [selectedCityId, selectedProvinceId, cities]);

  // Filtrar ciudades por provincia seleccionada
  useEffect(() => {
    if (selectedProvinceId) {
      const filteredCities = cities.filter((city: any) => city.provinceId === selectedProvinceId);
      setAvailableCities(filteredCities);
      
      // Solo resetear si la ciudad actual no está en las ciudades disponibles
      const currentCityExists = filteredCities.find((city: any) => city.id === selectedCityId);
      if (!currentCityExists && selectedCityId) {
        onCityChange('');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedProvinceId, selectedCityId, onCityChange, cities]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="province">Provincia</Label>
        <SearchableSelect
          value={selectedProvinceId}
          onValueChange={setSelectedProvinceId}
          options={provinces.map(p => ({ value: p.id, label: p.name }))}
          placeholder={provincesLoading ? "Cargando..." : "Selecciona una provincia"}
          searchPlaceholder="Buscar provincia..."
          emptyMessage="No se encontraron provincias"
          disabled={provincesLoading}
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad *</Label>
        <SearchableSelect
          value={selectedCityId}
          onValueChange={onCityChange}
          options={availableCities.map(c => ({ value: c.id, label: c.name }))}
          placeholder={citiesLoading ? "Cargando..." : availableCities.length === 0 && !selectedProvinceId ? "Selecciona primero una provincia" : "Selecciona una ciudad"}
          searchPlaceholder="Buscar ciudad..."
          emptyMessage={selectedProvinceId ? "No hay ciudades disponibles" : "Selecciona primero una provincia"}
          disabled={!selectedProvinceId || citiesLoading}
        />
      </div>

    </div>
  );
}
