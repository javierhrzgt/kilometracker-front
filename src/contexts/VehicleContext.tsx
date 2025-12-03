"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Vehicle } from "@/Types";

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<void>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/vehicles", {
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }

      const data = await response.json();
      const activeVehicles = (data.data || []).filter((v: Vehicle) => v.isActive);
      setVehicles(activeVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Refresh function to manually refetch vehicles
  const refreshVehicles = async () => {
    await fetchVehicles();
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        setSelectedVehicle,
        isLoading,
        error,
        refreshVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return context;
}
