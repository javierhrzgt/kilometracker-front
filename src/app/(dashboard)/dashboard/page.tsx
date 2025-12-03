"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/Types";
import { useVehicle } from "@/contexts/VehicleContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/features/vehicles/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/vehicle-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Car } from "lucide-react";

export default function Dashboard() {
  const { vehicles, isLoading, error: vehicleError, refreshVehicles } = useVehicle();
  const [error, setError] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (vehicleError) {
      setError(vehicleError);
    }
  }, [vehicleError]);

  const handleDelete = async (alias: string): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${alias}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el vehículo");
      }

      refreshVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Vehículos"
          description="Gestiona y visualiza tus vehículos registrados"
          actions={
            <Button onClick={() => router.push("/add-vehicle")}>
              + Agregar Vehículo
            </Button>
          }
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </div>
        </main>
      </>
    );
  }

  // Filter vehicles based on active status
  const filteredVehicles = showInactive
    ? vehicles
    : vehicles.filter((vehicle) => vehicle.isActive);

  return (
    <>
      <PageHeader
        title="Vehículos"
        description={`Gestiona y visualiza tus ${vehicles.length} vehículos registrados`}
        actions={
          <Button onClick={() => router.push("/add-vehicle")}>
            + Agregar Vehículo
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Count & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {filteredVehicles.length}{" "}
            {filteredVehicles.length === 1 ? "vehículo" : "vehículos"}
            {!showInactive &&
              vehicles.filter((v: Vehicle) => !v.isActive).length > 0 && (
                <span className="text-muted-foreground/60">
                  {" "}
                  ({vehicles.filter((v: Vehicle) => !v.isActive).length} inactivo
                  {vehicles.filter((v: Vehicle) => !v.isActive).length !== 1
                    ? "s"
                    : ""}{" "}
                  oculto
                  {vehicles.filter((v: Vehicle) => !v.isActive).length !== 1 ? "s" : ""})
                </span>
              )}
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-foreground">Mostrar inactivos</span>
          </label>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <EmptyState
            icon={<Car className="h-12 w-12" />}
            title={vehicles.length === 0 ? "No hay vehículos registrados" : "No hay vehículos activos"}
            description={vehicles.length === 0 ? "Agrega tu primer vehículo para empezar a hacer seguimiento de rutas, combustible y mantenimiento." : "Todos los vehículos están inactivos. Activa un vehículo o ajusta los filtros."}
            action={vehicles.length === 0 ? {
              label: "Agregar Vehículo",
              onClick: () => router.push("/add-vehicle")
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
