"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingMaintenance } from "@/Types";
import { formatDateForDisplay, getDaysUntilDate } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Wrench, AlertCircle, Calendar } from "lucide-react";

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

  const getKmRemaining = (targetKm: number, currentKm: number) => {
    return targetKm - currentKm;
  };

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
        title="Mantenimientos Próximos"
        description="Mantenimientos programados que están próximos o vencidos"
        actions={
          <Button onClick={() => router.push("/add-maintenance")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Mantenimiento
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-3xl font-semibold">{upcomingMaintenances.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-destructive mb-1">Vencidos</p>
                  <p className="text-3xl font-semibold text-destructive">{overdueCount}</p>
                </div>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {overdueCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50 bg-warning/10 shadow-sm hover:shadow-depth-3 transition-elevation">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-warning mb-1">Urgente</p>
                  <p className="text-3xl font-semibold text-foreground">{urgentCount}</p>
                </div>
                <Badge variant="default" className="text-lg px-3 py-1 bg-warning text-warning-foreground">
                  {urgentCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Table */}
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
            <CardContent>
              <div className="overflow-x-auto">
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
                            <Badge variant={badgeVariant}>
                              {statusText}
                            </Badge>
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
