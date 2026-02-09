"use client";

import { geocodingService } from "../services/geocodingService";

/**
 * Hook mínimo para que el componente `ZoneMap` pueda llamar a
 * `getLocationInfoFromCoordinates`. La implementación actual solo
 * devuelve nombres de provincia/ciudad a partir del endpoint
 * `/geography/reverse-geocode` y deja parroquia/sector vacíos.
 */

export function useGeocoding() {
  const getLocationInfoFromCoordinates = async (
    lat: number,
    lng: number,
  ): Promise<{
    province?: { id: string; name: string } | null;
    city?: { id: string; name: string } | null;
    parish?: { id: string; name: string } | null;
    sector?: { id: string; name: string } | null;
  }> => {
    try {
      const info = await geocodingService.reverseGeocodeBasic(lat, lng);
      return info;
    } catch {
      return {};
    }
  };

  return { getLocationInfoFromCoordinates };
}

