"use client";

import { useQuery } from "@apollo/client/react";
import { GET_PROVINCES, GET_CITIES_BY_PROVINCE } from "@/graphql/queries";
import type { Province, City } from "../services";

interface CityWithActive extends City {
  isActive?: boolean;
  deletedAt?: string | null;
}

interface ProvinceWithCities {
  id: string;
  name: string;
  code?: string;
  cities?: CityWithActive[];
}

/**
 * Hook para obtener provincias (con sus ciudades incluidas).
 * Usa la query `allLocalizations` del backend GraphQL.
 */
export function useGeographic(_options?: { skip?: boolean }) {
  const { data, loading } = useQuery<{
    allLocalizations: ProvinceWithCities[];
  }>(GET_PROVINCES, { skip: _options?.skip });

  const raw = data?.allLocalizations ?? [];
  const provinces: Province[] = raw.map((p: ProvinceWithCities) => ({
    id: p.id,
    name: p.name,
  }));

  // Mapa rápido provincia → ciudades (ya vienen en la query)
  const citiesByProvince = (provinceId: string): City[] => {
    const prov = raw.find((p: ProvinceWithCities) => p.id === provinceId);
    return (prov?.cities ?? []).filter(
      (c: CityWithActive) => c.isActive !== false,
    );
  };

  // Todas las ciudades aplanadas (para backward compat con ZoneMap)
  const allCities: City[] = raw.flatMap(
    (p: ProvinceWithCities) =>
      (p.cities ?? []).filter((c: CityWithActive) => c.isActive !== false),
  );

  return {
    provinces,
    provincesLoading: loading,
    citiesByProvince,
    cities: allCities,
    loading,
  };
}

/**
 * Hook para cargar ciudades de una provincia bajo demanda.
 * Usa useQuery con skip para evitar llamadas innecesarias.
 */
export function useCitiesByProvince(
  provinceId: string,
  options?: { skip?: boolean },
) {
  const skip = options?.skip || !provinceId;

  const { data, loading } = useQuery<{
    cityByProvince: CityWithActive[];
  }>(GET_CITIES_BY_PROVINCE, {
    variables: { provinceId },
    skip,
  });

  const cities: City[] = (data?.cityByProvince ?? []).filter(
    (c: CityWithActive) => c.isActive !== false,
  );

  return { cities, loading };
}
