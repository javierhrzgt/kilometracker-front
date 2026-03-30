"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Vehicle, VehicleStats } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatCard } from "@/components/features/stats/StatCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiData } from "@/hooks/useApiData";
import { KmAreaChart } from "@/components/charts/KmAreaChart";
import { MaintenanceCostBarChart } from "@/components/charts/MaintenanceCostBarChart";

interface AnalyticsData {
  series: {
    distancia: Array<{ period: string; label: string; value: number }>;
    costoMantenimiento: Array<{ period: string; label: string; value: number }>;
  };
}

export default function VehicleStatsPage() {
  const params = useParams<{ alias: string }>();
  const alias: string = params.alias;
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: analyticsRaw } = useApiData<{ success: boolean; data: AnalyticsData }>(
    alias ? `/api/vehicles/${alias}/analytics?period=6m` : null
  );
  const analytics = analyticsRaw?.data ?? null;

  useEffect(() => {
    if (alias) {
      fetchStats();
    }
  }, [alias]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/vehicles/${alias}/stats`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar estadísticas");
      }

      const data = await response.json();
      const statsData = data.data;
      setStats(statsData);
      setVehicle(statsData.vehicle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <CardSkeleton rows={5} />
      </main>
    );
  }

  return (
    <>
      <PageHeader
        title={alias}
        description={vehicle ? `${vehicle.marca} ${vehicle.modelo} · ${vehicle.plates}` : "Estadísticas del vehículo"}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => router.push(`/add-route?vehicle=${alias}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ruta
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/add-refuel?vehicle=${alias}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Recarga
            </Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {stats ? (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Rutas"
                value={stats.statistics.totalRoutes}
              />
              <StatCard
                label="Distancia"
                value={stats.statistics.totalDistancia.toLocaleString()}
                unit="km"
              />
              <StatCard
                label="Promedio"
                value={stats.efficiency.promedioDistanciaPorRuta.toFixed(1)}
                unit="km"
              />
              <StatCard
                label="Recargas"
                value={stats.statistics.totalRefuels}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                label="Gasto en combustible"
                value={`Q ${stats.costs.combustible.toFixed(2)}`}
                size="md"
              />
              <StatCard
                label="Kilometraje actual"
                value={(vehicle?.kilometrajeTotal || 0).toLocaleString()}
                unit="km"
                size="md"
              />
            </div>

            {/* Info del Vehículo */}
            <div className="border border-border rounded-lg p-4 sm:p-6 bg-card">
              <h3 className="text-base sm:text-lg font-medium mb-4 text-foreground">
                Información del vehículo
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Alias</p>
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {vehicle?.alias}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Marca</p>
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {vehicle?.marca}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Modelo</p>
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {vehicle?.modelo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Kilometraje</p>
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {(vehicle?.kilometrajeTotal || 0).toLocaleString()} km
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">Costos</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Combustible" value={`Q ${stats.costs.combustible.toFixed(2)}`} size="sm" accent="info" />
                <StatCard label="Mantenimiento" value={`Q ${stats.costs.mantenimiento.toFixed(2)}`} size="sm" accent="warning" />
                <StatCard label="Otros Gastos" value={`Q ${stats.costs.gastosOtros.toFixed(2)}`} size="sm" accent="purple" />
                <StatCard label="Total" value={`Q ${stats.costs.total.toFixed(2)}`} size="sm" />
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">Eficiencia</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="km/Litro" value={stats.efficiency.kmPorLitro.toFixed(2)} size="sm" accent="success" />
                <StatCard label="km/Galón" value={stats.efficiency.kmPorGalon.toFixed(2)} size="sm" accent="success" />
                <StatCard label="Promedio/Ruta" value={stats.efficiency.promedioDistanciaPorRuta.toFixed(1)} unit="km" size="sm" accent="info" />
                <StatCard label="Costo por km" value={`Q ${stats.costs.costoPorKm.toFixed(3)}`} size="sm" accent="warning" />
              </div>
            </div>

            {/* Charts — Histórico 6 meses */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Kilómetros por mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <KmAreaChart data={analytics.series.distancia} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Costo de mantenimiento por mes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceCostBarChart
                      data={analytics.series.costoMantenimiento.map((d) => ({
                        label: d.label,
                        value: d.value,
                      }))}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Resumen */}
            {stats.statistics.totalRoutes > 0 && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-muted">
                <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">Resumen</h3>
                <div className="space-y-2 text-sm text-foreground">
                  <p>
                    Has registrado <span className="font-medium">{stats.statistics.totalRoutes}</span> rutas
                    con un total de <span className="font-medium">{stats.statistics.totalDistancia} km</span> recorridos.
                  </p>
                  <p>
                    Promedio de <span className="font-medium">{stats.efficiency.promedioDistanciaPorRuta.toFixed(1)} km</span> por ruta.
                    {stats.statistics.totalRefuels > 0 && (
                      <> Has realizado <span className="font-medium">{stats.statistics.totalRefuels}</span> recargas de combustible.</>
                    )}
                  </p>
                  <p>
                    Total de gastos registrados: <span className="font-medium">{stats.statistics.totalExpenses}</span>
                    {stats.statistics.totalMaintenances > 0 && (
                      <> (incluyendo <span className="font-medium">{stats.statistics.totalMaintenances}</span> de mantenimiento)</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground">No hay estadísticas disponibles</p>
          </div>
        )}
      </main>
    </>
  );
}