"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Vehicle, VehicleStats } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/features/stats/StatCard";

export default function VehicleStatsPage() {
  const params = useParams<{ alias: string }>();
  const alias: string = params.alias;
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

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
      const statsData = data.data || data;
      // Set the full statsData which contains statistics, costs, efficiency, etc.
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
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
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
              + Ruta
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/add-refuel?vehicle=${alias}`)}
            >
              + Recarga
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
                value={stats.statistics?.totalRoutes || stats.totalRoutes || 0}
              />
              <StatCard
                label="Distancia"
                value={(stats.statistics?.totalDistancia || stats.totalDistancia || 0).toLocaleString()}
                unit="km"
              />
              <StatCard
                label="Promedio"
                value={Number(stats.efficiency?.promedioDistanciaPorRuta || stats.promedioDistanciaPorRuta || 0).toFixed(1)}
                unit="km"
              />
              <StatCard
                label="Recargas"
                value={stats.statistics?.totalRefuels || stats.totalRefuels || 0}
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                label="Gasto en combustible"
                value={`Q ${(stats.costs?.combustible || stats.totalGastoCombustible || 0).toFixed(2)}`}
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

            {/* Enhanced Stats - Cost Breakdown */}
            {stats.costs && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-card">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-foreground">
                  Costos
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Combustible</p>
                    <p className="text-lg sm:text-xl font-semibold text-blue-600">
                      Q {stats.costs.combustible.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Mantenimiento</p>
                    <p className="text-lg sm:text-xl font-semibold text-orange-600">
                      Q {stats.costs.mantenimiento.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Otros Gastos</p>
                    <p className="text-lg sm:text-xl font-semibold text-purple-600">
                      Q {stats.costs.gastosOtros.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-lg sm:text-xl font-semibold text-foreground">
                      Q {stats.costs.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Stats - Efficiency Metrics */}
            {stats.efficiency && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-card">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-foreground">
                  Eficiencia
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">km/Litro</p>
                    <p className="text-lg sm:text-2xl font-semibold text-green-600">
                      {stats.efficiency.kmPorLitro.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">km/Galón</p>
                    <p className="text-lg sm:text-2xl font-semibold text-green-600">
                      {stats.efficiency.kmPorGalon.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Promedio/Ruta</p>
                    <p className="text-lg sm:text-2xl font-semibold text-blue-600">
                      {stats.efficiency.promedioDistanciaPorRuta.toFixed(1)}
                      <span className="text-sm text-muted-foreground ml-1">km</span>
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Costo por km</p>
                    <p className="text-lg sm:text-2xl font-semibold text-orange-600">
                      Q {stats.costs?.costoPorKm?.toFixed(3) || '0.000'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Cost of Ownership */}
            {stats.totalCostOfOwnership !== undefined && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  Costo Total de Propiedad
                </h3>
                <p className="text-3xl sm:text-4xl font-bold">
                  Q {stats.totalCostOfOwnership.toFixed(2)}
                </p>
                {stats.totalDistancia && stats.totalDistancia > 0 && stats.totalCostOfOwnership > 0 && (
                  <p className="text-sm text-gray-300 mt-2">
                    Costo promedio: Q {(stats.totalCostOfOwnership / stats.totalDistancia).toFixed(3)}/km
                  </p>
                )}
              </div>
            )}

            {/* Resumen */}
            {(stats.statistics?.totalRoutes || stats.totalRoutes || 0) > 0 && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-muted">
                <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">
                  Resumen
                </h3>
                <div className="space-y-2 text-sm text-foreground">
                  <p>
                    Has registrado <span className="font-medium text-foreground">{stats.statistics?.totalRoutes || stats.totalRoutes}</span> rutas
                    con un total de <span className="font-medium text-foreground">{stats.statistics?.totalDistancia || stats.totalDistancia} km</span> recorridos.
                  </p>
                  <p>
                    Promedio de <span className="font-medium text-foreground">{Number(stats.efficiency?.promedioDistanciaPorRuta || stats.promedioDistanciaPorRuta || 0).toFixed(1)} km</span> por ruta.
                    {(stats.statistics?.totalRefuels || stats.totalRefuels || 0) > 0 && (
                      <> Has realizado <span className="font-medium text-foreground">{stats.statistics?.totalRefuels || stats.totalRefuels}</span> recargas de combustible.</>
                    )}
                  </p>
                  {stats.statistics && (
                    <p>
                      Total de gastos registrados: <span className="font-medium text-foreground">{stats.statistics.totalExpenses}</span>
                      {stats.statistics.totalMaintenances > 0 && (
                        <> (incluyendo <span className="font-medium text-foreground">{stats.statistics.totalMaintenances}</span> de mantenimiento)</>
                      )}
                    </p>
                  )}
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