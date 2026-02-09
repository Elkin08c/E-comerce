import {
  logisticsService,
  type Zone,
  type CreateZoneDto,
  type UpdateZoneDto,
  type MeetingPoint,
  type CreateMeetingPointDto,
  type UpdateMeetingPointDto,
  type TransportCompany,
  type ZoneShippingMethod,
  type ShippingMethod,
  type LogisticsStats,
} from "@/lib/services/logistics.service";

/**
 * Bridge file para que los componentes de mapas del antiguo proyecto
 * puedan reutilizar el `logisticsService` y sus tipos usando la ruta
 * relativa `../../services/logisticsService`.
 *
 * No añade lógica nueva, solo reexporta todo desde `@/lib/services/logistics.service`.
 */

export {
  logisticsService,
  type Zone,
  type CreateZoneDto,
  type UpdateZoneDto,
  type MeetingPoint,
  type CreateMeetingPointDto,
  type UpdateMeetingPointDto,
  type TransportCompany,
  type ZoneShippingMethod,
  type ShippingMethod,
  type LogisticsStats,
};

