"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { FuelAnalysis } from "@/Types";

export default function FuelAnalysisPage() {
  const params = useParams<{ alias: string }>();
  const alias: string = params.alias;

  const [analysis, setAnalysis] = useState<FuelAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (alias) {
      fetchAnalysis();
    }
  }, [alias]);

  const fetchAnalysis = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/refuels/vehicle/${alias}/analysis`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar análisis");
      }

      const data = await response.json();
      setAnalysis(data.data);
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

  const vehicle = analysis?.vehicle;
  const summary = analysis?.summary;
  const porTipo = analysis?.porTipoCombustible || {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="self-start px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              ← Volver
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-light text-gray-900 truncate">
                Combustible · {alias}
              </h1>
              {vehicle && (
                <p className="text-sm text-gray-500">
                  {vehicle.marca} {vehicle.modelo}
                </p>
              )}
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

        {analysis ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Recargas
                </p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {summary?.totalReabastecimientos || 0}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Total
                </p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  Q {Number(summary?.totalGastado || 0).toFixed(2)}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Galones
                </p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  {Number(summary?.totalGalones || 0).toFixed(2)}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  Promedio
                </p>
                <p className="text-2xl sm:text-4xl font-light text-gray-900">
                  Q {Number(summary?.promedioGalonPrice || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Por Tipo de Combustible */}
            {Object.keys(porTipo).length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
                  Por tipo de combustible
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(porTipo).map(([tipo, datos]) => (
                    <div
                      key={tipo}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h4 className="font-medium text-base mb-3 text-gray-900">
                        {tipo}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Recargas:</span>
                          <span className="font-medium text-gray-900">
                            {datos.cantidad}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gasto:</span>
                          <span className="font-medium text-gray-900">
                            Q {datos.gasto.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Galones:</span>
                          <span className="font-medium text-gray-900">
                            {datos.galones.toFixed(2)}
                          </span>
                        </div>
                        {datos.galones > 0 && (
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-500">Promedio:</span>
                            <span className="font-medium text-gray-900">
                              Q {(datos.gasto / datos.galones).toFixed(2)}/gal
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen */}
            {summary && summary.totalReabastecimientos > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                <h3 className="text-base sm:text-lg font-medium mb-3 text-gray-900">
                  Resumen
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Has realizado{" "}
                    <span className="font-medium text-gray-900">
                      {summary.totalReabastecimientos}
                    </span>{" "}
                    reabastecimientos con un gasto total de{" "}
                    <span className="font-medium text-gray-900">
                      Q {Number(summary.totalGastado).toFixed(2)}
                    </span>
                    .
                  </p>
                  <p>
                    {Number(summary.totalGalones) > 0 ? (
                      <>
                        Total de{" "}
                        <span className="font-medium text-gray-900">
                          {Number(summary.totalGalones).toFixed(2)}
                        </span>{" "}
                        galones a un promedio de{" "}
                        <span className="font-medium text-gray-900">
                          Q {Number(summary.promedioGalonPrice).toFixed(2)}
                        </span>{" "}
                        por galón.
                      </>
                    ) : (
                      <>No hay datos de galones registrados.</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Info del Vehículo */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
              <h3 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
                Información del vehículo
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              </div>
            </div>

            {/* Botón para ver historial */}
            <div className="text-center pt-2">
              <button
                onClick={() => router.push("/refuels-history")}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded transition-colors font-medium"
              >
                Ver historial de recargas
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">
              No hay datos de análisis disponibles
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
