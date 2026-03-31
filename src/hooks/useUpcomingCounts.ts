import { useState, useEffect } from "react";

interface UpcomingCounts {
  maintenanceCount: number;
  expensesCount: number;
  maintenanceByVehicle: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export function useUpcomingCounts(): UpcomingCounts {
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [expensesCount, setExpensesCount] = useState(0);
  const [maintenanceByVehicle, setMaintenanceByVehicle] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both counts in parallel
      const [maintenanceRes, expensesRes] = await Promise.all([
        fetch("/api/maintenance/upcoming", { credentials: "include" }),
        fetch("/api/expenses/upcoming", { credentials: "include" }),
      ]);

      // Handle maintenance response
      if (maintenanceRes.ok) {
        const maintenanceData = await maintenanceRes.json();
        const maintenanceItems: Array<{ vehicleAlias?: string }> = maintenanceData.data || [];
        setMaintenanceCount(maintenanceItems.length);
        const byVehicle: Record<string, number> = {};
        for (const item of maintenanceItems) {
          const alias = item.vehicleAlias ?? "";
          if (alias) byVehicle[alias] = (byVehicle[alias] ?? 0) + 1;
        }
        setMaintenanceByVehicle(byVehicle);
      } else {
        console.warn("Failed to fetch upcoming maintenance");
        setMaintenanceCount(0);
        setMaintenanceByVehicle({});
      }

      // Handle expenses response
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        const expensesItems = expensesData.data || [];
        setExpensesCount(expensesItems.length);
      } else {
        console.warn("Failed to fetch upcoming expenses");
        setExpensesCount(0);
      }
    } catch (err) {
      console.error("Error fetching upcoming counts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch counts");
      setMaintenanceCount(0);
      setExpensesCount(0);
      setMaintenanceByVehicle({});
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch counts on mount
  useEffect(() => {
    fetchCounts();

    // Refresh every 5 minutes to keep counts up-to-date
    const intervalId = setInterval(fetchCounts, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    maintenanceCount,
    expensesCount,
    maintenanceByVehicle,
    isLoading,
    error,
  };
}
