"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { FuelAnalysis } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/features/stats/StatCard";

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
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  const vehicle = analysis?.vehicle;
  const summary = analysis?.summary;
  const porTipo = analysis?.porTipoCombustible || {};

  return (
    <>
      <PageHeader
        title={`Análisis de Combustible · ${alias}`}
        description={vehicle ? `${vehicle.marca} ${vehicle.modelo}` : undefined}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {analysis ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Recargas"
                value={summary?.totalReabastecimientos || 0}
              />
              <StatCard
                label="Total"
                value={`Q ${Number(summary?.totalGastado || 0).toFixed(2)}`}
              />
              <StatCard
                label="Galones"
                value={Number(summary?.totalGalones || 0).toFixed(2)}
              />
              <StatCard
                label="Promedio"
                value={`Q ${Number(summary?.promedioGalonPrice || 0).toFixed(2)}`}
              />
            </div>

            {/* Por Tipo de Combustible */}
            {Object.keys(porTipo).length > 0 && (
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-card shadow-sm">
                <h3 className="text-base sm:text-lg font-medium mb-4 text-foreground">
                  Por tipo de combustible
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(porTipo).map(([tipo, datos]) => (
                    <div
                      key={tipo}
                      className="border border-border rounded-lg p-4 bg-card hover:shadow-depth-2 transition-elevation"
                    >
                      <h4 className="font-medium text-base mb-3 text-foreground">
                        {tipo}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recargas:</span>
                          <span className="font-medium text-foreground">
                            {datos.cantidad}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gasto:</span>
                          <span className="font-medium text-foreground">
                            Q {datos.gasto.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Galones:</span>
                          <span className="font-medium text-foreground">
                            {datos.galones.toFixed(2)}
                          </span>
                        </div>
                        {datos.galones > 0 && (
                          <div className="flex justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Promedio:</span>
                            <span className="font-medium text-foreground">
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
              <div className="border border-border rounded-lg p-4 sm:p-6 bg-card shadow-sm">
                <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">
                  Resumen
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Has realizado{" "}
                    <span className="font-medium text-foreground">
                      {summary.totalReabastecimientos}
                    </span>{" "}
                    reabastecimientos con un gasto total de{" "}
                    <span className="font-medium text-foreground">
                      Q {Number(summary.totalGastado).toFixed(2)}
                    </span>
                    .
                  </p>
                  <p>
                    {Number(summary.totalGalones) > 0 ? (
                      <>
                        Total de{" "}
                        <span className="font-medium text-foreground">
                          {Number(summary.totalGalones).toFixed(2)}
                        </span>{" "}
                        galones a un promedio de{" "}
                        <span className="font-medium text-foreground">
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
            <div className="border border-border rounded-lg p-4 sm:p-6 bg-card shadow-sm">
              <h3 className="text-base sm:text-lg font-medium mb-4 text-foreground">
                Información del vehículo
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              </div>
            </div>

            {/* Botón para ver historial */}
            <div className="text-center pt-2">
              <button
                onClick={() => router.push("/refuels-history")}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm hover:shadow-depth-2 transition-smooth font-medium"
              >
                Ver historial de recargas
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground">
              No hay datos de análisis disponibles
            </p>
          </div>
        )}
      </main>
    </>
  );
}
