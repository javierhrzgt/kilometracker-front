"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingMaintenance } from "@/Types";

export default function UpcomingMaintenancePage() {
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<UpcomingMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUpcomingMaintenances();
  }, []);

  const fetchUpcomingMaintenances = async () => {
    try {
      const response = await fetch("/api/maintenance/upcoming", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar mantenimientos próximos");
      }

      const data = await response.json();
      setUpcomingMaintenances(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getKmRemaining = (targetKm: number, currentKm: number) => {
    return targetKm - currentKm;
  };

  const getUrgencyColor = (days?: number, kmRemaining?: number) => {
    if (days !== undefined) {
      if (days < 0) return "text-red-600 bg-red-50 border-red-200";
      if (days <= 7) return "text-orange-600 bg-orange-50 border-orange-200";
      if (days <= 30) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-blue-600 bg-blue-50 border-blue-200";
    }
    if (kmRemaining !== undefined) {
      if (kmRemaining < 0) return "text-red-600 bg-red-50 border-red-200";
      if (kmRemaining <= 500) return "text-orange-600 bg-orange-50 border-orange-200";
      if (kmRemaining <= 1000) return "text-yellow-600 bg-yellow-50 border-yellow-200";
      return "text-blue-600 bg-blue-50 border-blue-200";
    }
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                ← Volver
              </button>
              <h1 className="text-xl sm:text-2xl font-light text-gray-900">
                Mantenimientos Próximos
              </h1>
            </div>
            <button
              onClick={() => router.push("/add-maintenance")}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors text-sm sm:text-base"
            >
              + Agregar Mantenimiento
            </button>
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

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Aquí puedes ver los mantenimientos programados que están próximos o vencidos.
            La urgencia se indica por color: rojo (vencido), naranja (urgente), amarillo (próximo), azul (programado).
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-600">Cargando...</div>
          </div>
        ) : upcomingMaintenances.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400 mb-2">No hay mantenimientos próximos programados</p>
            <p className="text-sm text-gray-500 mb-4">
              Los mantenimientos con fecha o kilometraje programado aparecerán aquí
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/add-maintenance")}
                className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
              >
                Agregar Mantenimiento
              </button>
              <button
                onClick={() => router.push("/maintenance-history")}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Ver Historial
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingMaintenances.map((maintenance) => {
              const daysUntil = maintenance.proximoServicioFecha
                ? getDaysUntil(maintenance.proximoServicioFecha)
                : undefined;
              const kmRemaining =
                maintenance.proximoServicioKm && maintenance.vehicle?.kilometrajeTotal
                  ? getKmRemaining(
                      maintenance.proximoServicioKm,
                      maintenance.vehicle.kilometrajeTotal
                    )
                  : undefined;

              const urgencyColor =
                daysUntil !== undefined
                  ? getUrgencyColor(daysUntil)
                  : getUrgencyColor(undefined, kmRemaining);

              return (
                <div
                  key={maintenance._id}
                  className={`border rounded-lg p-4 sm:p-6 ${urgencyColor}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium mb-2">{maintenance.tipo}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Vehículo:</span>
                          <span>
                            {maintenance.vehicle?.alias || maintenance.vehicleAlias}
                            {maintenance.vehicle && (
                              <> ({maintenance.vehicle.marca} {maintenance.vehicle.modelo})</>
                            )}
                          </span>
                        </div>

                        {maintenance.proximoServicioFecha && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Fecha programada:</span>
                            <span>{formatDate(maintenance.proximoServicioFecha)}</span>
                            {daysUntil !== undefined && (
                              <span className="ml-2 font-medium">
                                {daysUntil < 0
                                  ? `(Vencido hace ${Math.abs(daysUntil)} días)`
                                  : daysUntil === 0
                                  ? "(Hoy)"
                                  : `(En ${daysUntil} días)`}
                              </span>
                            )}
                          </div>
                        )}

                        {maintenance.proximoServicioKm && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Kilometraje programado:</span>
                            <span>{maintenance.proximoServicioKm.toLocaleString()} km</span>
                            {maintenance.vehicle?.kilometrajeTotal && kmRemaining !== undefined && (
                              <span className="ml-2 font-medium">
                                {kmRemaining < 0
                                  ? `(Excedido por ${Math.abs(kmRemaining).toLocaleString()} km)`
                                  : `(Faltan ${kmRemaining.toLocaleString()} km)`}
                              </span>
                            )}
                          </div>
                        )}

                        {maintenance.vehicle?.kilometrajeTotal && (
                          <div className="flex items-center gap-2 text-xs opacity-75">
                            <span>Kilometraje actual del vehículo:</span>
                            <span>{maintenance.vehicle.kilometrajeTotal.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push("/maintenance-history")}
                        className="px-4 py-2 text-sm border border-gray-300 hover:bg-white/50 rounded transition-colors"
                      >
                        Ver Historial
                      </button>
                      <button
                        onClick={() => router.push("/add-maintenance")}
                        className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
                      >
                        Registrar Servicio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && upcomingMaintenances.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-light text-gray-900">
                {upcomingMaintenances.length}
              </p>
            </div>
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-xs text-red-600 mb-1">Vencidos</p>
              <p className="text-2xl font-light text-red-900">
                {
                  upcomingMaintenances.filter(
                    (m) =>
                      (m.proximoServicioFecha && getDaysUntil(m.proximoServicioFecha) < 0) ||
                      (m.proximoServicioKm &&
                        m.vehicle?.kilometrajeTotal &&
                        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) < 0)
                  ).length
                }
              </p>
            </div>
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <p className="text-xs text-orange-600 mb-1">Urgente (&lt;7 días)</p>
              <p className="text-2xl font-light text-orange-900">
                {
                  upcomingMaintenances.filter(
                    (m) =>
                      m.proximoServicioFecha &&
                      getDaysUntil(m.proximoServicioFecha) >= 0 &&
                      getDaysUntil(m.proximoServicioFecha) <= 7
                  ).length
                }
              </p>
            </div>
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <p className="text-xs text-yellow-600 mb-1">Próximo (&lt;30 días)</p>
              <p className="text-2xl font-light text-yellow-900">
                {
                  upcomingMaintenances.filter(
                    (m) =>
                      m.proximoServicioFecha &&
                      getDaysUntil(m.proximoServicioFecha) > 7 &&
                      getDaysUntil(m.proximoServicioFecha) <= 30
                  ).length
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
