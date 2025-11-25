"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Vehicle, VehicleStats } from "@/Types";

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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  ← Volver
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-light text-gray-900 truncate">{alias}</h1>
                  {vehicle && (
                    <p className="text-sm text-gray-500 truncate">
                      {vehicle.marca} {vehicle.modelo} · {vehicle.plates}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/add-route?vehicle=${alias}`)}
                  className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
                >
                  + Ruta
                </button>
                <button
                  onClick={() => router.push(`/add-refuel?vehicle=${alias}`)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  + Recarga
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {stats ? (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Rutas */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Rutas</p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {stats.statistics?.totalRoutes || stats.totalRoutes || 0}
                </p>
              </div>

              {/* Distancia Total */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Distancia</p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {(stats.statistics?.totalDistancia || stats.totalDistancia || 0).toLocaleString()}
                  <span className="text-sm sm:text-xl text-gray-500 ml-1">km</span>
                </p>
              </div>

              {/* Promedio por Ruta */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Promedio</p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {Number(stats.efficiency?.promedioDistanciaPorRuta || stats.promedioDistanciaPorRuta || 0).toFixed(1)}
                  <span className="text-sm sm:text-xl text-gray-500 ml-1">km</span>
                </p>
              </div>

              {/* Total Recargas */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Recargas</p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {stats.statistics?.totalRefuels || stats.totalRefuels || 0}
                </p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Gasto en Combustible */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Gasto en combustible</p>
                <p className="text-2xl sm:text-3xl font-light text-gray-900">
                  Q {(stats.costs?.combustible || stats.totalGastoCombustible || 0).toFixed(2)}
                </p>
              </div>

              {/* Kilometraje Actual */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Kilometraje actual</p>
                <p className="text-2xl sm:text-3xl font-light text-gray-900">
                  {(vehicle?.kilometrajeTotal || 0).toLocaleString()}
                  <span className="text-lg sm:text-xl text-gray-500 ml-1">km</span>
                </p>
              </div>
            </div>

            {/* Info del Vehículo */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
              <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
                Información del vehículo
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Alias</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {vehicle?.alias}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Marca</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {vehicle?.marca}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Modelo</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {vehicle?.modelo}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Kilometraje</p>
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {(vehicle?.kilometrajeTotal || 0).toLocaleString()} km
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Stats - Cost Breakdown */}
            {stats.costs && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
                  Costos
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Combustible</p>
                    <p className="text-lg sm:text-xl font-semibold text-blue-600">
                      Q {stats.costs.combustible.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Mantenimiento</p>
                    <p className="text-lg sm:text-xl font-semibold text-orange-600">
                      Q {stats.costs.mantenimiento.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Otros Gastos</p>
                    <p className="text-lg sm:text-xl font-semibold text-purple-600">
                      Q {stats.costs.gastosOtros.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      Q {stats.costs.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Stats - Efficiency Metrics */}
            {stats.efficiency && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
                  Eficiencia
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">km/Litro</p>
                    <p className="text-lg sm:text-2xl font-semibold text-green-600">
                      {stats.efficiency.kmPorLitro.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">km/Galón</p>
                    <p className="text-lg sm:text-2xl font-semibold text-green-600">
                      {stats.efficiency.kmPorGalon.toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Promedio/Ruta</p>
                    <p className="text-lg sm:text-2xl font-semibold text-blue-600">
                      {stats.efficiency.promedioDistanciaPorRuta.toFixed(1)}
                      <span className="text-sm text-gray-500 ml-1">km</span>
                    </p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Costo por km</p>
                    <p className="text-lg sm:text-2xl font-semibold text-orange-600">
                      Q {stats.costs?.costoPorKm?.toFixed(3) || '0.000'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Cost of Ownership */}
            {stats.totalCostOfOwnership !== undefined && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
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
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                <h3 className="text-base sm:text-lg font-medium mb-3 text-gray-900">
                  Resumen
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Has registrado <span className="font-medium text-gray-900">{stats.statistics?.totalRoutes || stats.totalRoutes}</span> rutas
                    con un total de <span className="font-medium text-gray-900">{stats.statistics?.totalDistancia || stats.totalDistancia} km</span> recorridos.
                  </p>
                  <p>
                    Promedio de <span className="font-medium text-gray-900">{Number(stats.efficiency?.promedioDistanciaPorRuta || stats.promedioDistanciaPorRuta || 0).toFixed(1)} km</span> por ruta.
                    {(stats.statistics?.totalRefuels || stats.totalRefuels || 0) > 0 && (
                      <> Has realizado <span className="font-medium text-gray-900">{stats.statistics?.totalRefuels || stats.totalRefuels}</span> recargas de combustible.</>
                    )}
                  </p>
                  {stats.statistics && (
                    <p>
                      Total de gastos registrados: <span className="font-medium text-gray-900">{stats.statistics.totalExpenses}</span>
                      {stats.statistics.totalMaintenances > 0 && (
                        <> (incluyendo <span className="font-medium text-gray-900">{stats.statistics.totalMaintenances}</span> de mantenimiento)</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">No hay estadísticas disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}