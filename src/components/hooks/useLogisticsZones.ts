import { useEffect, useState } from "react";
import {
  logisticsService,
  type Zone,
} from "@/lib/services/logistics.service";

interface UseLogisticsZonesOptions {
  onlyDanger?: boolean;
  onlyActive?: boolean;
}

/**
 * Hook ligero para obtener zonas logísticas desde la API REST.
 *
 * Los componentes de mapas lo usan para:
 * - Validar nombres de zonas (lista completa en `allZones`)
 * - Listar solo algunas zonas (por ejemplo solo DANGER) en `zones`
 */
export function useLogisticsZones(
  options: UseLogisticsZonesOptions = {},
) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchZones = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await logisticsService.getZones();

        if (cancelled) return;

        let filtered = data;

        if (options.onlyActive) {
          filtered = filtered.filter((z) => z.isActive);
        }

        if (options.onlyDanger) {
          filtered = filtered.filter((z) => z.type === "DANGER");
        }

        setZones(filtered);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Error cargando zonas");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchZones();

    return () => {
      cancelled = true;
    };
  }, [options.onlyActive, options.onlyDanger]);

  return {
    zones,
    allZones: zones,
    loading,
    error,
  };
}

