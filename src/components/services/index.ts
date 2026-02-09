import type {
  Zone as ApiZone,
  CreateZoneDto as ApiCreateZoneDto,
  MeetingPoint as ApiMeetingPoint,
  CreateMeetingPointDto as ApiCreateMeetingPointDto,
  TransportCompany as ApiTransportCompany,
  ZoneShippingMethod as ApiZoneShippingMethod,
  ShippingMethod as ApiShippingMethod,
} from "@/lib/services/logistics.service";

/**
 * Barrel de tipos para los componentes de mapas.
 *
 * Reenlazamos los tipos del `logisticsService` actual para que los
 * componentes de mapas puedan importar desde aquí.
 */

export type ShippingMethod = ApiShippingMethod;
export type ZoneShippingMethod = ApiZoneShippingMethod;
export type TransportCompany = ApiTransportCompany;

export type ZoneType = ApiZone["type"];

export type Zone = ApiZone;

export type CreateZoneDto = ApiCreateZoneDto & {
  transportCompanyId?: string;
};

export type MeetingPoint = ApiMeetingPoint;
export type CreateMeetingPointDto = ApiCreateMeetingPointDto;

// Tipos simples para datos geográficos usados en los formularios de zonas.

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  provinceId: string;
}
