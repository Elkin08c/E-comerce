import { apiClient } from "@/lib/api-client";

/**
 * Servicio mínimo de geocodificación usado por los componentes de mapas.
 *
 * Se apoya en los endpoints REST del módulo `geography` / `geocoding`
 * del backend NestJS. La implementación es intencionalmente ligera para
 * evitar acoplar demasiado la integración.
 */

export interface ReverseGeocodeLocationInfo {
  province?: { id: string; name: string } | null;
  city?: { id: string; name: string } | null;
  parish?: { id: string; name: string } | null;
  sector?: { id: string; name: string } | null;
}

export const geocodingService = {
  /**
   * Devuelve true si las coordenadas caen dentro del rango aproximado de Ecuador.
   */
  isWithinEcuador(lat: number, lng: number): boolean {
    return lat >= -5 && lat <= 2 && lng >= -82 && lng <= -75;
  },

  /**
   * Stub simple para obtener coordenadas de una parroquia.
   * Por ahora solo usa forward geocoding con address+city.
   */
  async getParishCoordinates(
    parishName: string,
    _cityId?: string,
  ): Promise<[number, number]> {
    const data = await apiClient<any>("/geocoding/forward", {
      params: {
        address: parishName,
      },
    });

    const lat = typeof data.latitude === "number" ? data.latitude : 0;
    const lng = typeof data.longitude === "number" ? data.longitude : 0;

    return [lat, lng];
  },

  /**
   * Stub para límites de parroquia. La API actual no expone los polígonos,
   * así que devolvemos un array vacío para que el mapa funcione sin error.
   */
  async getParishBoundaries(
    _parishName: string,
    _cityId?: string,
  ): Promise<[number, number][]> {
    return [];
  },

  /**
   * Helper para geocodificación inversa usando el endpoint de Geography.
   * Devuelve solo nombres (sin IDs), útil para mostrar textos amigables.
   */
  async reverseGeocodeBasic(
    lat: number,
    lng: number,
  ): Promise<ReverseGeocodeLocationInfo> {
    const data = await apiClient<any>("/geography/reverse-geocode", {
      params: {
        lat: String(lat),
        lng: String(lng),
      },
    });

    return {
      province: data?.zone?.province
        ? { id: "", name: String(data.zone.province) }
        : null,
      city: data?.zone?.city
        ? { id: "", name: String(data.zone.city) }
        : null,
      parish: null,
      sector: null,
    };
  },
};

