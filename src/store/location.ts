import { Zone, logisticsService } from '@/lib/services/logistics.service';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { client } from '@/lib/apollo';
import { CREATE_CUSTOMER_ADDRESS } from '@/graphql/extended-queries';
import { GET_CUSTOMER_ADDRESSES } from '@/graphql/queries';
import { useAuthStore } from '@/store/auth';

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

          let zones: Zone[] = [];
          if (Array.isArray(response)) {
            zones = response;
          } else if (response && typeof response === 'object' && 'zone' in response) {
            // Handle { zone: ..., restrictions: ... } format
            zones = [(response as any).zone];
          }

          const sorted = [...zones].sort(
            (a, b) => (ZONE_TYPE_PRIORITY[a.type] ?? 99) - (ZONE_TYPE_PRIORITY[b.type] ?? 99)
          );

          set({
            zones: sorted,
            primaryZone: sorted[0] ?? null,
            status: 'resolved',
            lastDetectedAt: Date.now(),
          });

          // Auto-guardar dirección si el usuario está autenticado
          const authState = useAuthStore.getState();
          if (authState.isAuthenticated && authState.user && sorted.length > 0) {
            const zone = sorted[0];
            const lat = get().latitude;
            const lon = get().longitude;

            // Reverse geocoding con Nominatim para obtener la dirección real
            let street = zone.name;
            if (lat && lon) {
              try {
                const geoRes = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
                  { headers: { 'Accept-Language': 'es' } }
                );
                const geoData = await geoRes.json();
                if (geoData.display_name) {
                  street = geoData.display_name;
                }
              } catch {
                // Fallback: usar nombre de zona
              }
            }

            try {
              const city = zone.city?.name || zone.name;
              const state = zone.city?.province?.name || '';

              // Verify if an identical address already exists for the user
              const { data: addrData } = await client.query<any>({
                query: GET_CUSTOMER_ADDRESSES,
                fetchPolicy: 'network-only' // Ensure we get fresh data
              });

              const addresses = addrData?.customersAddresses?.edges?.map((e: any) => e.node) || [];
              const addressExists = addresses.some(
                (a: any) => a.street === street && a.city === city && a.state === state
              );

              if (addressExists) {
                console.log('La dirección para la zona seleccionada ya existe, evadiendo duplicados.');
              } else {
                await client.mutate({
                  mutation: CREATE_CUSTOMER_ADDRESS,
                  variables: {
                    createCustomersAddressInput: {
                      customerId: authState.user.id,
                      recipientName: authState.user.name,
                      street,
                      city,
                      state,
                      isDefault: true,
                    },
                  },
                });
                console.log('Dirección guardada automáticamente para zona:', zone.name);
              }
            } catch (err) {
              console.warn('No se pudo validar/guardar la dirección automáticamente:', err);
            }
          }
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
