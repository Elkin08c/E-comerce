"use client";

import { useCallback, useEffect, useState } from "react";
import {
  logisticsService,
  type TransportCompany,
} from "@/lib/services/logistics.service";

export function useTransportCompanies() {
  const [companies, setCompanies] = useState<TransportCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logisticsService.getTransportCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return { companies, loading, error, refetch: fetchCompanies };
}
