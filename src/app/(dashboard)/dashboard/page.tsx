"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, Route, Refuel } from "@/Types";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { useVehicle } from "@/contexts/VehicleContext";
import { useUser } from "@/contexts/UserContext";
import { useApiData } from "@/hooks/useApiData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleCard } from "@/components/features/vehicles/VehicleCard";
import { VehicleCardSkeleton } from "@/components/ui/vehicle-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/features/stats/StatCard";
import { KmAreaChart } from "@/components/charts/KmAreaChart";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, RouteIcon, Fuel, Wrench, Bell, TrendingUp, TrendingDown } from "lucide-react";
import { useUpcomingCounts } from "@/hooks/useUpcomingCounts";
import { Badge } from "@/components/ui/badge";

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

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
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
  const { maintenanceByVehicle } = useUpcomingCounts();
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
  const { data: recentRoutes } = useApiData<PaginatedResponse<Route>>("/api/routes?limit=5");
  const { data: recentRefuels } = useApiData<PaginatedResponse<Refuel>>("/api/refuels?limit=5");

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

  const efficiencyByVehicle = useMemo(
    () => Object.fromEntries((dashboard?.vehicles ?? []).map((v) => [v.alias, v.efficiency.kmPorLitro])),
    [dashboard]
  );

  const recentActivity = useMemo(() => {
    const routes = (recentRoutes?.data ?? []).map((r) => ({ ...r, type: "route" as const }));
    const refuels = (recentRefuels?.data ?? []).map((r) => ({ ...r, type: "refuel" as const }));
    return [...routes, ...refuels]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [recentRoutes, recentRefuels]);

  const distanceSeries = analytics?.series.distancia ?? [];
  const currentMonthKm = distanceSeries.at(-1)?.value ?? 0;
  const prevMonthKm = distanceSeries.at(-2)?.value ?? null;
  const deltaPercent =
    prevMonthKm !== null && prevMonthKm > 0
      ? Math.round(((currentMonthKm - prevMonthKm) / prevMonthKm) * 100)
      : null;

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Vista general de tus vehículos"
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
          <StatCard
            label="Km este mes"
            value={`${(summary?.kmThisMonth ?? 0).toLocaleString()} km`}
            icon={<RouteIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Gasto 30 días"
            value={`Q ${(summary?.totalSpentLast30Days ?? 0).toFixed(2)}`}
            icon={<Fuel className="h-5 w-5" />}
          />
          <StatCard
            label="Eficiencia"
            value={
              dashboard?.vehicles[0]?.efficiency.kmPorLitro
                ? `${dashboard.vehicles[0].efficiency.kmPorLitro} km/L`
                : "—"
            }
            subtitle={firstAlias ? firstAlias : undefined}
            icon={<Car className="h-5 w-5" />}
          />
          <StatCard
            label="Alertas"
            value={alerts.length}
            subtitle={alerts.length > 0 ? alerts[0].message : "Sin alertas"}
            accent={alerts.length > 0 ? "warning" : undefined}
            icon={<Bell className="h-5 w-5" />}
          />
        </div>

        {/* Analytics — móvil: sparkline + insight, desktop: gráfico completo + sidebar */}
        {firstAlias && (
          <>
            {/* Móvil: sparkline compacto */}
            <Card className="block lg:hidden">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Kilómetros · {firstAlias}
                </p>
                <KmAreaChart data={distanceSeries} compact />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold">
                    {currentMonthKm.toLocaleString()} km este mes
                  </p>
                  {deltaPercent !== null && (
                    <Badge variant={deltaPercent >= 0 ? "secondary" : "outline"} className="flex items-center gap-1">
                      {deltaPercent >= 0
                        ? <TrendingUp className="h-3 w-3 text-success" />
                        : <TrendingDown className="h-3 w-3 text-destructive" />}
                      {deltaPercent >= 0 ? "+" : ""}{deltaPercent}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Desktop: gráfico completo + sidebar */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Kilómetros por mes · {firstAlias}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KmAreaChart data={distanceSeries} />
                </CardContent>
              </Card>

              <div className="space-y-4">
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

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Acciones rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push("/add-route")}>
                      + Ruta
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/add-refuel")}>
                      + Recarga
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/add-maintenance")}>
                      + Servicio
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/add-expense")}>
                      + Gasto
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Actividad reciente */}
        {recentActivity.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-3">Actividad reciente</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              {recentActivity.map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border last:border-b-0">
                  <div className={`p-2 rounded-lg shrink-0 ${item.type === "route" ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}>
                    {item.type === "route"
                      ? <RouteIcon className="h-4 w-4" />
                      : <Fuel className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.vehicleAlias}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type === "route"
                        ? `${item.distanciaRecorrida} km recorridos`
                        : `Q ${Number(item.cantidadGastada).toFixed(2)}`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {formatDateForDisplay(item.fecha)}
                  </p>
                </div>
              ))}
            </div>
          </section>
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
              <Checkbox
                checked={showInactive}
                onCheckedChange={(val) => setShowInactive(val as boolean)}
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
                  upcomingMaintenanceCount={maintenanceByVehicle[vehicle.alias] ?? 0}
                  kmPorLitro={efficiencyByVehicle[vehicle.alias]}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
