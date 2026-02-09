import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logisticsService, Zone } from '@/lib/services/logistics.service';

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
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
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
            set({ latitude, longitude, status: 'loading' });

            try {
              const zones = await logisticsService.getZonesByLocation(latitude, longitude);

              const sorted = [...zones].sort(
                (a, b) => (ZONE_TYPE_PRIORITY[a.type] ?? 99) - (ZONE_TYPE_PRIORITY[b.type] ?? 99)
              );

              set({
                zones: sorted,
                primaryZone: sorted[0] ?? null,
                status: 'resolved',
                lastDetectedAt: Date.now(),
              });
            } catch {
              set({ status: 'error', errorMessage: 'Error al consultar zonas de cobertura' });
            }
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
