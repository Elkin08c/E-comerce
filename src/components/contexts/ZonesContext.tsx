"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  logisticsService,
  type Zone,
  type CreateZoneDto,
  type UpdateZoneDto,
} from "@/lib/services/logistics.service";

interface ZonesContextValue {
  zones: Zone[];
  loading: boolean;
  loadZones: () => Promise<void>;
  createZone: (data: CreateZoneDto) => Promise<Zone>;
  updateZone: (id: string, data: UpdateZoneDto) => Promise<Zone>;
  deleteZone: (id: string) => Promise<void>;
}

const ZonesContext = createContext<ZonesContextValue | undefined>(undefined);

export function ZonesProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);

  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logisticsService.getZones();
      setZones(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Precargar zonas cuando se monta el provider
    void loadZones();
  }, [loadZones]);

  const createZone = useCallback(
    async (data: CreateZoneDto) => {
      const created = await logisticsService.createZone(data);
      // Refrescar lista en memoria
      setZones((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateZone = useCallback(
    async (id: string, data: UpdateZoneDto) => {
      const updated = await logisticsService.updateZone(id, data);
      setZones((prev) =>
        prev.map((z) => (z.id === id ? { ...z, ...updated } : z)),
      );
      return updated;
    },
    [],
  );

  const deleteZone = useCallback(async (id: string) => {
    await logisticsService.deleteZone(id);
    setZones((prev) => prev.filter((z) => z.id !== id));
  }, []);

  const value: ZonesContextValue = {
    zones,
    loading,
    loadZones,
    createZone,
    updateZone,
    deleteZone,
  };

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

export function useZones(): ZonesContextValue {
  const ctx = useContext(ZonesContext);
  if (!ctx) {
    throw new Error("useZones debe usarse dentro de ZonesProvider");
  }
  return ctx;
}
