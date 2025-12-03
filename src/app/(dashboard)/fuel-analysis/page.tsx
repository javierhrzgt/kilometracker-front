"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVehicle } from "@/contexts/VehicleContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Car, TrendingUp } from "lucide-react";

export default function FuelAnalysisLandingPage() {
  const { vehicles, selectedVehicle, isLoading } = useVehicle();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (isLoading) return;

    // If a vehicle is selected, redirect to its fuel analysis
    if (selectedVehicle) {
      router.push(`/fuel-analysis/${selectedVehicle.alias}`);
      return;
    }

    // If no vehicle is selected but vehicles exist, redirect to first vehicle
    if (vehicles.length > 0) {
      router.push(`/fuel-analysis/${vehicles[0].alias}`);
    }
  }, [vehicles, selectedVehicle, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  // If redirecting to a vehicle, show loading
  if (vehicles.length > 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Redirigiendo...</div>
      </div>
    );
  }

  // No vehicles - show empty state with CTA
  return (
    <>
      <PageHeader
        title="Análisis de Combustible"
        description="Analiza el consumo de combustible de tus vehículos"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center border border-border rounded-lg bg-card p-8 sm:p-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Car className="h-16 w-16 text-muted-foreground/40" />
              <TrendingUp className="h-8 w-8 text-muted-foreground/60 absolute -bottom-1 -right-1" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">
            No hay vehículos registrados
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Para ver el análisis de combustible, primero necesitas agregar un vehículo a tu cuenta.
          </p>

          <Button
            onClick={() => router.push("/add-vehicle")}
            size="lg"
            className="gap-2"
          >
            <Car className="h-4 w-4" />
            Agregar Vehículo
          </Button>
        </div>
      </main>
    </>
  );
}
