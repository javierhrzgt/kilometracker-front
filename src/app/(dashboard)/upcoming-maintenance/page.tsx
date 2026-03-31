"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingMaintenance, Vehicle } from "@/Types";
import { formatDateForDisplay, getDaysUntilDate } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { StatCard } from "@/components/features/stats/StatCard";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { cn } from "@/lib/utils";

export default function UpcomingMaintenancePage() {
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<UpcomingMaintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchUpcomingMaintenances();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchUpcomingMaintenances = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVehicle) params.append("vehicleAlias", selectedVehicle);
      const query = params.toString();
      const url = `/api/maintenance/upcoming${query ? `?${query}` : ""}`;

      const response = await fetch(url, { credentials: "include" });

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

  const handleApplyFilters = () => {
    setLoading(true);
    fetchUpcomingMaintenances();
  };

  const handleClearFilters = () => {
    setSelectedVehicle("");
    setTimeout(() => {
      setLoading(true);
      fetchUpcomingMaintenances();
    }, 0);
  };

  const getKmRemaining = (targetKm: number, currentKm: number) => targetKm - currentKm;

  const getUrgencyBadgeVariant = (days?: number, kmRemaining?: number): "destructive" | "default" | "secondary" => {
    if (days !== undefined) {
      if (days < 0 || days <= 7) return "destructive";
      if (days <= 30) return "default";
      return "secondary";
    }
    if (kmRemaining !== undefined) {
      if (kmRemaining < 0 || kmRemaining <= 500) return "destructive";
      if (kmRemaining <= 1000) return "default";
      return "secondary";
    }
    return "secondary";
  };

  const getStatusText = (days?: number, kmRemaining?: number): string => {
    if (days !== undefined) {
      if (days < 0) return "Vencido";
      if (days <= 7) return "Urgente";
      if (days <= 30) return "Próximo";
      return "Programado";
    }
    if (kmRemaining !== undefined) {
      if (kmRemaining < 0) return "Excedido";
      if (kmRemaining <= 500) return "Urgente";
      if (kmRemaining <= 1000) return "Próximo";
      return "Programado";
    }
    return "N/A";
  };

  const getUrgencyColor = (days?: number, kmRemaining?: number) => {
    if (days !== undefined) {
      if (days < 0) return "text-destructive bg-destructive/10 border-destructive/20";
      if (days <= 7) return "text-warning bg-warning/10 border-warning/20";
      if (days <= 30) return "text-warning bg-warning/10 border-warning/20";
      return "text-info bg-info/10 border-info/20";
    }
    if (kmRemaining !== undefined) {
      if (kmRemaining < 0) return "text-destructive bg-destructive/10 border-destructive/20";
      if (kmRemaining <= 500) return "text-warning bg-warning/10 border-warning/20";
      if (kmRemaining <= 1000) return "text-warning bg-warning/10 border-warning/20";
      return "text-info bg-info/10 border-info/20";
    }
    return "text-muted-foreground bg-muted border-border";
  };

  const overdueCount = upcomingMaintenances.filter(
    (m) =>
      (m.proximoServicioFecha && getDaysUntilDate(m.proximoServicioFecha) < 0) ||
      (m.proximoServicioKm &&
        m.vehicle?.kilometrajeTotal &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) < 0)
  ).length;

  const urgentCount = upcomingMaintenances.filter(
    (m) =>
      (m.proximoServicioFecha &&
        getDaysUntilDate(m.proximoServicioFecha) >= 0 &&
        getDaysUntilDate(m.proximoServicioFecha) <= 7) ||
      (m.proximoServicioKm &&
        m.vehicle?.kilometrajeTotal &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) >= 0 &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) <= 500)
  ).length;

  const activeFilterCount = selectedVehicle ? 1 : 0;

  if (loading) {
    return (
      <>
        <PageHeader title="Mantenimientos Próximos" />
        <main className="page-container">
          <CardSkeleton rows={4} />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Mantenimientos Próximos"
        description="Mantenimientos programados que están próximos o vencidos"
        actions={
          <Button onClick={() => router.push("/add-maintenance")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Mantenimiento
          </Button>
        }
      />

      <main className="page-container">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FilterPanel
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          activeCount={activeFilterCount}
          gridClassName="grid grid-cols-1 gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehículo</Label>
            <SelectNative
              id="vehicle"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Todos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.alias}>
                  {vehicle.alias}
                </option>
              ))}
            </SelectNative>
          </div>
        </FilterPanel>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <StatCard label="Total" value={upcomingMaintenances.length} size="md" />
          <StatCard
            label="Vencidos"
            value={overdueCount}
            size="md"
            accent={overdueCount > 0 ? "destructive" : undefined}
          />
          <StatCard
            label="Urgentes"
            value={urgentCount}
            size="md"
            accent={urgentCount > 0 ? "warning" : undefined}
          />
        </div>

        {/* Content */}
        {upcomingMaintenances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground mb-2">No hay mantenimientos próximos programados</p>
              <p className="text-sm text-muted-foreground mb-4">
                Los mantenimientos con fecha o kilometraje programado aparecerán aquí
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push("/add-maintenance")}>
                  Agregar Mantenimiento
                </Button>
                <Button variant="outline" onClick={() => router.push("/maintenance-history")}>
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Servicios
              </CardTitle>
              <CardDescription>
                Mantenimientos programados por fecha o kilometraje
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">

              {/* Mobile card list */}
              <div className="block md:hidden space-y-3 p-4">
                {upcomingMaintenances.map((maintenance) => {
                  const daysUntil = maintenance.proximoServicioFecha
                    ? getDaysUntilDate(maintenance.proximoServicioFecha)
                    : undefined;
                  const kmRemaining =
                    maintenance.proximoServicioKm && maintenance.vehicle?.kilometrajeTotal
                      ? getKmRemaining(maintenance.proximoServicioKm, maintenance.vehicle.kilometrajeTotal)
                      : undefined;
                  const badgeVariant =
                    daysUntil !== undefined
                      ? getUrgencyBadgeVariant(daysUntil)
                      : getUrgencyBadgeVariant(undefined, kmRemaining);
                  const statusText =
                    daysUntil !== undefined
                      ? getStatusText(daysUntil)
                      : getStatusText(undefined, kmRemaining);

                  return (
                    <div key={maintenance._id} className={cn("rounded-xl border border-border bg-card p-4", getUrgencyColor(daysUntil, kmRemaining))}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {maintenance.vehicle?.alias || maintenance.vehicleAlias}
                            </span>
                            <Badge variant="secondary">{maintenance.tipo}</Badge>
                            <Badge variant={badgeVariant}>{statusText}</Badge>
                          </div>
                          {maintenance.vehicle && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {maintenance.vehicle.marca} {maintenance.vehicle.modelo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {maintenance.proximoServicioFecha && (
                          <p className="text-sm text-foreground">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDateForDisplay(maintenance.proximoServicioFecha)}
                            {daysUntil !== undefined && (
                              <span className="text-muted-foreground ml-1">
                                {daysUntil < 0
                                  ? `(${Math.abs(daysUntil)}d atrás)`
                                  : daysUntil === 0
                                  ? "(Hoy)"
                                  : `(${daysUntil}d)`}
                              </span>
                            )}
                          </p>
                        )}
                        {maintenance.proximoServicioKm && (
                          <p className="text-sm font-medium text-foreground">
                            {maintenance.proximoServicioKm.toLocaleString()} km
                            {kmRemaining !== undefined && (
                              <span className="text-muted-foreground ml-1 font-normal">
                                {kmRemaining < 0
                                  ? `(+${Math.abs(kmRemaining).toLocaleString()} km excedido)`
                                  : `(${kmRemaining.toLocaleString()} km restantes)`}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push("/maintenance-history")}
                        >
                          Historial
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push("/add-maintenance")}
                        >
                          Registrar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Próximo Servicio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingMaintenances.map((maintenance) => {
                      const daysUntil = maintenance.proximoServicioFecha
                        ? getDaysUntilDate(maintenance.proximoServicioFecha)
                        : undefined;
                      const kmRemaining =
                        maintenance.proximoServicioKm && maintenance.vehicle?.kilometrajeTotal
                          ? getKmRemaining(
                              maintenance.proximoServicioKm,
                              maintenance.vehicle.kilometrajeTotal
                            )
                          : undefined;
                      const badgeVariant =
                        daysUntil !== undefined
                          ? getUrgencyBadgeVariant(daysUntil)
                          : getUrgencyBadgeVariant(undefined, kmRemaining);
                      const statusText =
                        daysUntil !== undefined
                          ? getStatusText(daysUntil)
                          : getStatusText(undefined, kmRemaining);

                      return (
                        <TableRow key={maintenance._id}>
                          <TableCell className="font-medium">
                            <div>
                              {maintenance.vehicle?.alias || maintenance.vehicleAlias}
                              {maintenance.vehicle && (
                                <div className="text-xs text-muted-foreground">
                                  {maintenance.vehicle.marca} {maintenance.vehicle.modelo}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{maintenance.tipo}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {maintenance.proximoServicioFecha && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDateForDisplay(maintenance.proximoServicioFecha)}</span>
                                  {daysUntil !== undefined && (
                                    <span className="text-muted-foreground">
                                      {daysUntil < 0
                                        ? `(${Math.abs(daysUntil)}d atrás)`
                                        : daysUntil === 0
                                        ? "(Hoy)"
                                        : `(${daysUntil}d)`}
                                    </span>
                                  )}
                                </div>
                              )}
                              {maintenance.proximoServicioKm && (
                                <div className="text-sm">
                                  <span className="font-medium">{maintenance.proximoServicioKm.toLocaleString()} km</span>
                                  {maintenance.vehicle?.kilometrajeTotal && kmRemaining !== undefined && (
                                    <span className="text-muted-foreground ml-2">
                                      {kmRemaining < 0
                                        ? `(+${Math.abs(kmRemaining).toLocaleString()} km)`
                                        : `(${kmRemaining.toLocaleString()} km)`}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badgeVariant}>{statusText}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/maintenance-history")}
                              >
                                Historial
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => router.push("/add-maintenance")}
                              >
                                Registrar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
