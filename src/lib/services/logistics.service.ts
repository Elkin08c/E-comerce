import { apiClient } from "../api-client";

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  description?: string;
  cityId: string;
  polygon?: [number, number][];
  type: "SECURE" | "RESTRICTED" | "DANGER";
  isActive: boolean;
  transportCompanyId?: string;
  shippingPrice?: number;
  areaKm2?: number;
  createdAt: string;
  updatedAt: string;
  city?: {
    id: string;
    name: string;
    province?: {
      id: string;
      name: string;
    };
  };
  transportCompany?: {
    id: string;
    name: string;
  };
  shippingMethods?: ZoneShippingMethod[];
}

export interface ZoneShippingMethod {
  id: string;
  zoneId: string;
  shippingMethodId: string;
  price: number;
  estimatedDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shippingMethod: ShippingMethod;
}

export interface ShippingMethod {
  id: string;
  name: string;
  type: "HOME_DELIVERY" | "PICKUP_POINT" | "STORE_PICKUP";
  description?: string;
  basePrice: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransportCompany {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingPoint {
  id: string;
  zoneId: string;
  name: string;
  description?: string | null;
  address: string;
  reference?: string | null;
  latitude: number;
  longitude: number;
  contactPhone?: string | null;
  openingHours?: string | null;
  capacity?: number | null;
  isAvailable: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  zone?: {
    id: string;
    name: string;
    city?: { name: string };
  };
}

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateZoneDto {
  name: string;
  description?: string;
  cityId: string;
  polygon?: [number, number][];
  type?: "SECURE" | "RESTRICTED" | "DANGER";
  transportCompanyId?: string;
  shippingPrice?: number;
  areaKm2?: number;
}

export interface UpdateZoneDto {
  name?: string;
  description?: string;
  cityId?: string;
  polygon?: [number, number][];
  type?: "SECURE" | "RESTRICTED" | "DANGER";
  transportCompanyId?: string;
  isActive?: boolean;
  shippingPrice?: number;
  areaKm2?: number;
}

export interface CreateShippingMethodDto {
  name: string;
  type: "HOME_DELIVERY" | "PICKUP_POINT" | "STORE_PICKUP";
  description?: string;
  basePrice: number;
  estimatedDays: number;
}

export interface UpdateShippingMethodDto {
  name?: string;
  type?: "HOME_DELIVERY" | "PICKUP_POINT" | "STORE_PICKUP";
  description?: string;
  basePrice?: number;
  estimatedDays?: number;
  isActive?: boolean;
}

export interface CreateTransportCompanyDto {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateTransportCompanyDto {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface CreateMeetingPointDto {
  zoneId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  reference?: string;
  contactPhone?: string;
  openingHours?: string;
  capacity?: number;
  priority?: number;
  isAvailable?: boolean;
}

export interface UpdateMeetingPointDto {
  name?: string;
  description?: string;
  address?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  openingHours?: string;
  capacity?: number;
  priority?: number;
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface LogisticsStats {
  totalZones: number;
  activeZones: number;
  dangerousZones: number;
  totalShippingMethods: number;
  activeShippingMethods: number;
  totalTransportCompanies: number;
  activeTransportCompanies: number;
  totalMeetingPoints?: number;
  activeMeetingPoints?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  type: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

export const logisticsService = {
  // ── Stats / Overview ──────────────────────────────────────────────────────
  getOverview: () =>
    apiClient<any>("/logistics/overview"),

  getStats: () =>
    apiClient<LogisticsStats>("/logistics/stats"),

  // ── Zones ─────────────────────────────────────────────────────────────────
  getZones: () =>
    apiClient<Zone[]>("/zones"),

  getZoneById: (id: string) =>
    apiClient<Zone>(`/zones/${id}`),

  createZone: (data: CreateZoneDto) =>
    apiClient<Zone>("/zones", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateZone: (id: string, data: UpdateZoneDto) =>
    apiClient<Zone>(`/zones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteZone: (id: string) =>
    apiClient<void>(`/zones/${id}`, {
      method: "DELETE",
    }),

  // ── Zone ↔ Shipping Methods ───────────────────────────────────────────────
  assignShippingMethodToZone: (
    zoneId: string,
    shippingMethodId: string,
    price: number,
    estimatedDays?: number
  ) =>
    apiClient<ZoneShippingMethod>(`/zones/${zoneId}/shipping-methods`, {
      method: "POST",
      body: JSON.stringify({ shippingMethodId, price, estimatedDays }),
    }),

  removeShippingMethodFromZone: (zoneId: string, shippingMethodId: string) =>
    apiClient<void>(`/zones/${zoneId}/shipping-methods/${shippingMethodId}`, {
      method: "DELETE",
    }),

  getZonesByLocation: (latitude: number, longitude: number) =>
    apiClient<Zone[]>(`/zones/by-location/${latitude}/${longitude}`),

  // ── Shipping Methods ──────────────────────────────────────────────────────
  getShippingMethods: (zoneId?: string) =>
    zoneId
      ? apiClient<ShippingMethod[]>(`/logistics/zones/${zoneId}/shipping-methods`)
      : apiClient<ShippingMethod[]>("/logistics/shipping-methods"),

  getShippingMethodById: (id: string) =>
    apiClient<ShippingMethod>(`/logistics/shipping-methods/${id}`),

  createShippingMethod: (data: CreateShippingMethodDto) =>
    apiClient<ShippingMethod>("/logistics/shipping-methods", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateShippingMethod: (id: string, data: UpdateShippingMethodDto) =>
    apiClient<ShippingMethod>(`/logistics/shipping-methods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteShippingMethod: (id: string) =>
    apiClient<void>(`/logistics/shipping-methods/${id}`, {
      method: "DELETE",
    }),

  // ── Meeting Points ────────────────────────────────────────────────────────
  getMeetingPoints: () =>
    apiClient<MeetingPoint[]>("/logistics/meeting-points"),

  getMeetingPointById: (id: string) =>
    apiClient<MeetingPoint>(`/logistics/meeting-points/${id}`),

  getMeetingPointsByZone: (zoneId: string) =>
    apiClient<MeetingPoint[]>(`/logistics/meeting-points/zone/${zoneId}`),

  getAvailableMeetingPointsByZone: (zoneId: string) =>
    apiClient<MeetingPoint[]>(`/logistics/meeting-points/zone/${zoneId}/available`),

  createMeetingPoint: (data: CreateMeetingPointDto) =>
    apiClient<MeetingPoint>("/logistics/meeting-points", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMeetingPoint: (id: string, data: UpdateMeetingPointDto) =>
    apiClient<MeetingPoint>(`/logistics/meeting-points/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteMeetingPoint: (id: string) =>
    apiClient<void>(`/logistics/meeting-points/${id}`, {
      method: "DELETE",
    }),

  toggleMeetingPointAvailability: (id: string) =>
    apiClient<MeetingPoint>(`/logistics/meeting-points/${id}/toggle-availability`, {
      method: "PUT",
    }),

  // ── Transport Companies ───────────────────────────────────────────────────
  getTransportCompanies: () =>
    apiClient<TransportCompany[]>("/transport-companies"),

  getTransportCompanyById: (id: string) =>
    apiClient<TransportCompany>(`/transport-companies/${id}`),

  createTransportCompany: (data: CreateTransportCompanyDto) =>
    apiClient<TransportCompany>("/transport-companies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTransportCompany: (id: string, data: UpdateTransportCompanyDto) =>
    apiClient<TransportCompany>(`/transport-companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTransportCompany: (id: string) =>
    apiClient<void>(`/transport-companies/${id}`, {
      method: "DELETE",
    }),

  // ── Payment Methods (zone-scoped, read-only) ─────────────────────────────
  getPaymentMethods: (zoneId: string) =>
    apiClient<PaymentMethod[]>(`/logistics/zones/${zoneId}/payment-methods`),

  // ── Validation ────────────────────────────────────────────────────────────
  validateLogistics: (data: {
    zoneId: string;
    shippingMethodId: string;
    paymentMethodType: string;
  }) =>
    apiClient<any>("/zones/validate-logistics", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
