import { Zone, logisticsService } from '@/lib/services/logistics.service';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LocationStatus = 'idle' | 'requesting' | 'loading' | 'resolved' | 'denied' | 'unavailable' | 'error';

const ZONE_TYPE_PRIORITY: Record<string, number> = {
  SECURE: 0,
  RESTRICTED: 1,
  DANGER: 2,
};

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  zones: Zone[];
  primaryZone: Zone | null;
  status: LocationStatus;
  errorMessage: string | null;
  lastDetectedAt: number | null;
  detectLocation: () => void;
  checkCoverage: (latitude: number, longitude: number) => Promise<void>;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      zones: [],
      primaryZone: null,
      status: 'idle',
      errorMessage: null,
      lastDetectedAt: null,

      detectLocation: () => {
        if (!navigator.geolocation) {
          set({ status: 'unavailable', errorMessage: 'Tu navegador no soporta geolocalización' });
          return;
        }

        set({ status: 'requesting', errorMessage: null });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            get().checkCoverage(latitude, longitude);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              set({ status: 'denied', errorMessage: 'Permiso de ubicación denegado. Actívalo en la configuración de tu navegador.' });
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              set({ status: 'unavailable', errorMessage: 'No se pudo determinar tu ubicación' });
            } else {
              set({ status: 'error', errorMessage: 'Tiempo de espera agotado al obtener tu ubicación' });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );
      },

      checkCoverage: async (latitude: number, longitude: number) => {
        set({ latitude, longitude, status: 'loading', errorMessage: null });

        try {
          const response = await logisticsService.getZonesByLocation(latitude, longitude);
          const zones = Array.isArray(response) ? response : [];

          const sorted = [...zones].sort(
            (a, b) => (ZONE_TYPE_PRIORITY[a.type] ?? 99) - (ZONE_TYPE_PRIORITY[b.type] ?? 99)
          );

          set({
            zones: sorted,
            primaryZone: sorted[0] ?? null,
            status: 'resolved',
            lastDetectedAt: Date.now(),
          });
        } catch (error: any) {
          console.error("Error checking coverage:", error);
          const message = error instanceof Error ? error.message : String(error);

          // Check for common "not found" indicators from backend or HTTP status
          const isNoZoneFound =
            message.includes('No se encontró una zona') ||
            message.includes('not found') ||
            message.includes('404');

          if (isNoZoneFound) {
            // Sin cobertura: permitir continuar en el ecommerce
            set({
              zones: [],
              primaryZone: null,
              status: 'resolved',
              lastDetectedAt: Date.now(),
            });
          } else {
            set({ status: 'error', errorMessage: message || 'Error al consultar zonas de cobertura' });
          }
        }
      },

      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          zones: [],
          primaryZone: null,
          status: 'idle',
          errorMessage: null,
          lastDetectedAt: null,
        }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        zones: state.zones,
        primaryZone: state.primaryZone,
        status: state.status === 'requesting' || state.status === 'loading' ? 'idle' : state.status,
        errorMessage: state.errorMessage,
        lastDetectedAt: state.lastDetectedAt,
      }),
    }
  )
);
