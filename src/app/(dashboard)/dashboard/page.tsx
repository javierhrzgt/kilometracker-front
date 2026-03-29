"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/Types";
import { useVehicle } from "@/contexts/VehicleContext";
import { useUser } from "@/contexts/UserContext";
import { useApiData } from "@/hooks/useApiData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleCard } from "@/components/features/vehicles/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/vehicle-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/MetricCard";
import { KmAreaChart } from "@/components/charts/KmAreaChart";
import { Car, Route, Fuel, Wrench, Bell } from "lucide-react";

interface DashboardSummary {
  totalVehicles: number;
  totalKmAllVehicles: number;
  totalSpentLast30Days: number;
  kmThisMonth: number;
}

interface DashboardVehicle {
  alias: string;
  marca: string;
  modelo: string;
  kilometrajeTotal: number;
  spentThisMonth: number;
  efficiency: { kmPorLitro: number };
}

interface DashboardAlert {
  type: string;
  vehicleAlias: string;
  message: string;
}

interface DashboardData {
  summary: DashboardSummary;
  vehicles: DashboardVehicle[];
  alerts: DashboardAlert[];
}

interface AnalyticsData {
  vehicle: { alias: string; marca: string; modelo: string };
  period: string;
  series: {
    distancia: Array<{ period: string; label: string; value: number }>;
    costoCombustible: Array<{ period: string; label: string; value: number }>;
    costoMantenimiento: Array<{ period: string; label: string; value: number }>;
    eficiencia: Array<{ period: string; label: string; kmPorLitro: number; costoPorKm: number }>;
  };
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function Dashboard() {
  const { vehicles, isLoading, error: vehicleError, refreshVehicles } = useVehicle();
  const { user } = useUser();
  const [error, setError] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const router = useRouter();

  const activeVehicles = vehicles.filter((v) => v.isActive);
  const firstAlias = activeVehicles[0]?.alias ?? null;

  const { data: dashboardRaw } = useApiData<{ success: boolean; data: DashboardData }>(
    "/api/dashboard"
  );
  const { data: analyticsRaw } = useApiData<{ success: boolean; data: AnalyticsData }>(
    firstAlias ? `/api/vehicles/${firstAlias}/analytics?period=6m` : null
  );

  useEffect(() => {
    if (vehicleError) setError(vehicleError);
  }, [vehicleError]);

  const handleDelete = async (alias: string): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${alias}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al eliminar el vehículo");
      refreshVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const dashboard = dashboardRaw?.data ?? null;
  const analytics = analyticsRaw?.data ?? null;
  const summary = dashboard?.summary;
  const alerts = dashboard?.alerts ?? [];
  const filteredVehicles = showInactive ? vehicles : activeVehicles;

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Vista general de tus vehículos"
          actions={
            <Button onClick={() => router.push("/add-vehicle")}>
              + Agregar Vehículo
            </Button>
          }
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
            <VehicleCardSkeleton />
          </div>
        </main>
      </>
    );
  }

  const userName = user?.username || user?.email?.split("@")[0] || "";

  return (
    <>
      <PageHeader
        title={`${getGreeting()}${userName ? `, ${userName}` : ""}`}
        description={
          firstAlias
            ? `Vehículo activo: ${activeVehicles[0].marca} ${activeVehicles[0].modelo}`
            : "Gestiona y visualiza tus vehículos"
        }
        actions={
          <Button onClick={() => router.push("/add-vehicle")}>
            + Agregar Vehículo
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            title="Km este mes"
            value={`${(summary?.kmThisMonth ?? 0).toLocaleString()} km`}
            icon={<Route className="h-5 w-5" />}
          />
          <MetricCard
            title="Gasto últimos 30 días"
            value={`Q ${(summary?.totalSpentLast30Days ?? 0).toFixed(2)}`}
            icon={<Fuel className="h-5 w-5" />}
          />
          <MetricCard
            title="Eficiencia"
            value={
              dashboard?.vehicles[0]?.efficiency.kmPorLitro
                ? `${dashboard.vehicles[0].efficiency.kmPorLitro} km/L`
                : "—"
            }
            subtitle={firstAlias ? firstAlias : undefined}
            icon={<Car className="h-5 w-5" />}
          />
          <MetricCard
            title="Alertas"
            value={alerts.length}
            subtitle={alerts.length > 0 ? alerts[0].message : "Sin alertas"}
            icon={<Bell className="h-5 w-5" />}
          />
        </div>

        {/* Analytics + Sidebar Grid */}
        {firstAlias && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* KmAreaChart — 2/3 width */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Kilómetros por mes · {firstAlias}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KmAreaChart data={analytics?.series.distancia ?? []} />
              </CardContent>
            </Card>

            {/* Right column: alerts + quick actions */}
            <div className="space-y-4">
              {/* Alerts */}
              {alerts.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-warning" />
                      Próximos servicios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {alerts.slice(0, 4).map((alert, i) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium text-foreground">
                            {alert.vehicleAlias}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            — {alert.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Acciones rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/add-route")}
                  >
                    + Ruta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/add-refuel")}
                  >
                    + Recarga
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/add-maintenance")}
                  >
                    + Servicio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/add-expense")}
                  >
                    + Gasto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Vehicles Section */}
        <div>
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {filteredVehicles.length}{" "}
              {filteredVehicles.length === 1 ? "vehículo" : "vehículos"}
              {!showInactive &&
                vehicles.filter((v: Vehicle) => !v.isActive).length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({vehicles.filter((v: Vehicle) => !v.isActive).length} inactivo
                    {vehicles.filter((v: Vehicle) => !v.isActive).length !== 1 ? "s" : ""} oculto
                    {vehicles.filter((v: Vehicle) => !v.isActive).length !== 1 ? "s" : ""})
                  </span>
                )}
            </h2>
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

          {filteredVehicles.length === 0 ? (
            <EmptyState
              icon={<Car className="h-12 w-12" />}
              title={
                vehicles.length === 0
                  ? "No hay vehículos registrados"
                  : "No hay vehículos activos"
              }
              description={
                vehicles.length === 0
                  ? "Agrega tu primer vehículo para empezar a hacer seguimiento de rutas, combustible y mantenimiento."
                  : "Todos los vehículos están inactivos. Activa un vehículo o ajusta los filtros."
              }
              action={
                vehicles.length === 0
                  ? {
                      label: "Agregar Vehículo",
                      onClick: () => router.push("/add-vehicle"),
                    }
                  : undefined
              }
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
        </div>
      </main>
    </>
  );
}
