"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

/**
 * Hook genérico para fetch de datos desde los BFF routes.
 * Reemplaza el patrón repetido de:
 *   useState(null) + useState(true) + useState("") + useEffect(() => fetchData(), [url])
 *
 * @example
 * const { data, loading, error, refetch } = useApiData<VehicleStats>(
 *   alias ? `/api/vehicles/${alias}/stats` : null
 * );
 *
 * @param url - URL del BFF route. Pasar null para no hacer fetch (carga diferida).
 */
export function useApiData<T>(url: string | null): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string>("");
  const [trigger, setTrigger] = useState<number>(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(url);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Error al obtener datos");
        }

        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, trigger]);

  return { data, loading, error, refetch };
}
