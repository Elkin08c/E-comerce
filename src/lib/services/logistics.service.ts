import { apiClient } from "../api-client";

export interface Zone {
  id: string;
  name: string;
  type: "SECURE" | "RESTRICTED" | "DANGER";
  isActive: boolean;
  // Add other fields as per backend ZoneResponseDto if possible
}

export interface ShippingMethod {
  id: string;
  name: string;
  type: "HOME_DELIVERY" | "PICKUP_POINT" | "STORE_PICKUP";
  description?: string;
  estimatedDays?: number;
  baseCost: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export interface MeetingPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  isActive: boolean;
}

export const logisticsService = {
  getOverview: async (): Promise<any> => {
    return apiClient("/logistics/overview");
  },

  getZones: async (): Promise<Zone[]> => {
    return apiClient("/zones");
  },

  getZoneById: async (id: string): Promise<Zone> => {
    return apiClient(`/zones/${id}`);
  },

  getZonesByLocation: async (latitude: number, longitude: number): Promise<Zone[]> => {
    return apiClient(`/zones/by-location/${latitude}/${longitude}`);
  },

  getShippingMethods: async (zoneId: string): Promise<ShippingMethod[]> => {
    return apiClient(`/logistics/zones/${zoneId}/shipping-methods`);
  },

  getPaymentMethods: async (zoneId: string): Promise<PaymentMethod[]> => {
    return apiClient(`/logistics/zones/${zoneId}/payment-methods`);
  },

  getMeetingPointsByZone: async (zoneId: string): Promise<MeetingPoint[]> => {
    return apiClient(`/logistics/meeting-points/zone/${zoneId}`);
  },

  getAvailableMeetingPointsByZone: async (zoneId: string): Promise<MeetingPoint[]> => {
    return apiClient(`/logistics/meeting-points/zone/${zoneId}/available`);
  },

  validateLogistics: async (data: {
    zoneId: string;
    shippingMethodId: string;
    paymentMethodType: string;
  }): Promise<any> => {
    return apiClient("/zones/validate-logistics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
};
