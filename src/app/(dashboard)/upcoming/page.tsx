"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UpcomingMaintenance, UpcomingExpense, Vehicle } from "@/Types";
import { formatDateForDisplay, getDaysUntilDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Wrench, DollarSign } from "lucide-react";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { StatCard } from "@/components/features/stats/StatCard";
import { FilterPanel } from "@/components/ui/FilterPanel";

/* ─── Maintenance helpers ─────────────────────────────────────── */

function getKmRemaining(targetKm: number, currentKm: number) {
  return targetKm - currentKm;
}

function getMaintenanceUrgencyBadgeVariant(
  days?: number,
  kmRemaining?: number
): "destructive" | "default" | "secondary" {
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
}

function getMaintenanceStatusText(days?: number, kmRemaining?: number): string {
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
}

function getMaintenanceUrgencyColor(days?: number, kmRemaining?: number) {
  if (days !== undefined) {
    if (days < 0) return "text-destructive bg-destructive/10 border-destructive/20";
    if (days <= 30) return "text-warning bg-warning/10 border-warning/20";
    return "text-info bg-info/10 border-info/20";
  }
  if (kmRemaining !== undefined) {
    if (kmRemaining < 0) return "text-destructive bg-destructive/10 border-destructive/20";
    if (kmRemaining <= 1000) return "text-warning bg-warning/10 border-warning/20";
    return "text-info bg-info/10 border-info/20";
  }
  return "text-muted-foreground bg-muted border-border";
}

/* ─── Expense helpers ─────────────────────────────────────────── */

function calculateDaysUntilDue(nextPaymentDate: string): number {
  const today = new Date();
  const paymentDate = new Date(nextPaymentDate);
  const diffTime = paymentDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpenseUrgencyBadgeVariant(
  days: number
): "destructive" | "default" | "secondary" {
  if (days <= 7) return "destructive";
  if (days <= 14) return "default";
  return "secondary";
}

function getExpenseUrgencyColor(days: number): string {
  if (days <= 7) return "bg-destructive/10 text-destructive border-destructive/20";
  if (days <= 14) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

function getFrequencyLabel(frequency: string): string {
  const labels: Record<string, string> = {
    monthly: "Mensual",
    quarterly: "Trimestral",
    annual: "Anual",
  };
  return labels[frequency] || frequency;
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function UpcomingPage() {
  const [maintenances, setMaintenances] = useState<UpcomingMaintenance[]>([]);
  const [expenses, setExpenses] = useState<UpcomingExpense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchAll();
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

  const fetchAll = async () => {
    try {
      const params = selectedVehicle
        ? `?vehicleAlias=${encodeURIComponent(selectedVehicle)}`
        : "";
      const [mRes, eRes] = await Promise.all([
        fetch(`/api/maintenance/upcoming${params}`, { credentials: "include" }),
        fetch(`/api/expenses/upcoming${params}`, { credentials: "include" }),
      ]);

      if (mRes.status === 401 || eRes.status === 401) {
        router.push("/");
        return;
      }
      if (!mRes.ok || !eRes.ok) {
        throw new Error("Error al cargar alertas");
      }

      const [mData, eData] = await Promise.all([mRes.json(), eRes.json()]);
      setMaintenances(mData.data || []);
      setExpenses(eData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Summary counts ──────────────────────────────────────── */
  const overdueCount = maintenances.filter(
    (m) =>
      (m.proximoServicioFecha && getDaysUntilDate(m.proximoServicioFecha) < 0) ||
      (m.proximoServicioKm &&
        m.vehicle?.kilometrajeTotal &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) < 0)
  ).length + expenses.filter((e) => calculateDaysUntilDue(e.proximoPago) < 0).length;

  const urgentCount = maintenances.filter(
    (m) =>
      (m.proximoServicioFecha &&
        getDaysUntilDate(m.proximoServicioFecha) >= 0 &&
        getDaysUntilDate(m.proximoServicioFecha) <= 7) ||
      (m.proximoServicioKm &&
        m.vehicle?.kilometrajeTotal &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) >= 0 &&
        getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal) <= 500)
  ).length + expenses.filter((e) => {
    const d = calculateDaysUntilDue(e.proximoPago);
    return d >= 0 && d <= 7;
  }).length;

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.monto, 0);
  const activeFilterCount = selectedVehicle ? 1 : 0;

  const handleApplyFilters = () => {
    setLoading(true);
    fetchAll();
  };

  const handleClearFilters = () => {
    setSelectedVehicle("");
    setTimeout(() => {
      setLoading(true);
      fetchAll();
    }, 0);
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Alertas" />
        <main className="page-container">
          <CardSkeleton rows={4} />
        </main>
      </>
    );
  }

  const hasAny = maintenances.length > 0 || expenses.length > 0;

  return (
    <>
      <PageHeader
        title="Alertas"
        description="Mantenimientos y gastos próximos o vencidos"
      />

      <main className="page-container space-y-6">
        {error && (
          <Alert variant="destructive">
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

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Vencidos" value={overdueCount} size="md" accent={overdueCount > 0 ? "destructive" : undefined} />
          <StatCard label="Urgentes" value={urgentCount} size="md" accent={urgentCount > 0 ? "warning" : undefined} />
          <StatCard label="Próx. pagos" value={`Q ${totalExpenseAmount.toFixed(2)}`} size="md" accent="info" />
        </div>

        {!hasAny ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground mb-2">Sin alertas pendientes</p>
              <p className="text-sm text-muted-foreground">
                Tus vehículos están al día
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ── Mantenimientos ────────────────────────────── */}
            {maintenances.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    Mantenimientos
                    <Badge variant="secondary">{maintenances.length}</Badge>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => router.push("/upcoming-maintenance")}
                  >
                    Ver todos
                  </Button>
                </div>
                <div className="space-y-3">
                  {maintenances.map((m) => {
                    const daysUntil = m.proximoServicioFecha
                      ? getDaysUntilDate(m.proximoServicioFecha)
                      : undefined;
                    const kmRemaining =
                      m.proximoServicioKm && m.vehicle?.kilometrajeTotal
                        ? getKmRemaining(m.proximoServicioKm, m.vehicle.kilometrajeTotal)
                        : undefined;
                    const badgeVariant =
                      daysUntil !== undefined
                        ? getMaintenanceUrgencyBadgeVariant(daysUntil)
                        : getMaintenanceUrgencyBadgeVariant(undefined, kmRemaining);
                    const statusText =
                      daysUntil !== undefined
                        ? getMaintenanceStatusText(daysUntil)
                        : getMaintenanceStatusText(undefined, kmRemaining);

                    return (
                      <div
                        key={m._id}
                        className={cn(
                          "rounded-xl border p-4",
                          getMaintenanceUrgencyColor(daysUntil, kmRemaining)
                        )}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {m.vehicle?.alias || m.vehicleAlias}
                          </span>
                          <Badge variant="secondary">{m.tipo}</Badge>
                          <Badge variant={badgeVariant}>{statusText}</Badge>
                        </div>
                        {m.vehicle && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {m.vehicle.marca} {m.vehicle.modelo}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          {m.proximoServicioFecha && (
                            <p className="text-sm text-foreground">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              {formatDateForDisplay(m.proximoServicioFecha)}
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
                          {m.proximoServicioKm && (
                            <p className="text-sm font-medium text-foreground">
                              {m.proximoServicioKm.toLocaleString()} km
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
              </section>
            )}

            {/* ── Gastos recurrentes ─────────────────────────── */}
            {expenses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Gastos recurrentes
                    <Badge variant="secondary">{expenses.length}</Badge>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => router.push("/upcoming-expenses")}
                  >
                    Ver todos
                  </Button>
                </div>
                <div className="space-y-3">
                  {expenses.map((e) => {
                    const daysUntilDue = calculateDaysUntilDue(e.proximoPago);
                    return (
                      <div
                        key={e._id}
                        className={cn(
                          "rounded-xl border p-4",
                          getExpenseUrgencyColor(daysUntilDue)
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {e.vehicleAlias}
                              </span>
                              <Badge variant="outline">
                                {e.categoria.charAt(0).toUpperCase() + e.categoria.slice(1)}
                              </Badge>
                              <Badge variant={getExpenseUrgencyBadgeVariant(daysUntilDue)}>
                                {daysUntilDue === 0
                                  ? "Hoy"
                                  : daysUntilDue === 1
                                  ? "Mañana"
                                  : daysUntilDue < 0
                                  ? "Vencido"
                                  : `${daysUntilDue}d`}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {e.descripcion}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-foreground">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDateForDisplay(e.proximoPago)}
                          </p>
                          <Badge variant="secondary">{getFrequencyLabel(e.frecuenciaRecurrencia)}</Badge>
                        </div>
                        <p className="text-xl font-bold text-foreground mt-2">
                          Q {e.monto.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
