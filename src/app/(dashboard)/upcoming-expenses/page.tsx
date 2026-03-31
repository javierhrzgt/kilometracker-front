"use client";

import { useState, useEffect } from "react";
import { UpcomingExpense, Vehicle } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
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
import { FilterPanel } from "@/components/ui/FilterPanel";
import { StatCard } from "@/components/features/stats/StatCard";

export default function UpcomingExpenses() {
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchUpcoming();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVehicle) params.append("vehicleAlias", selectedVehicle);

      const url = `/api/expenses/upcoming${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar gastos próximos");
      }

      const data = await response.json();
      setUpcomingExpenses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setLoading(true);
    fetchUpcoming();
  };

  const handleClearFilter = () => {
    setSelectedVehicle("");
    setTimeout(() => {
      setLoading(true);
      fetchUpcoming();
    }, 0);
  };

  const getCategoryLabel = (category: string): string => {
    if (category === "other") return "Otro";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getFrequencyLabel = (frequency: string): string => {
    const labels: { [key: string]: string } = {
      monthly: "Mensual",
      quarterly: "Trimestral",
      annual: "Anual",
    };
    return labels[frequency] || frequency;
  };

  const getUrgencyBadgeVariant = (daysUntilDue: number): "destructive" | "default" | "secondary" => {
    if (daysUntilDue <= 7) return "destructive";
    if (daysUntilDue <= 14) return "default";
    return "secondary";
  };

  const getUrgencyColor = (daysUntilDue: number): string => {
    if (daysUntilDue <= 7) return "bg-destructive/10 text-destructive border-destructive/20";
    if (daysUntilDue <= 14) return "bg-warning/10 text-warning border-warning/20";
    return "bg-success/10 text-success border-success/20";
  };

  const calculateDaysUntilDue = (nextPaymentDate: string): number => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalUpcoming = upcomingExpenses.reduce((sum, exp) => sum + exp.monto, 0);
  const dueThisWeek = upcomingExpenses.filter(exp => calculateDaysUntilDue(exp.proximoPago) <= 7).length;
  const dueThisMonth = upcomingExpenses.filter(exp => calculateDaysUntilDue(exp.proximoPago) <= 30).length;

  const activeFilterCount = selectedVehicle ? 1 : 0;

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardSkeleton rows={4} />
      </main>
    );
  }

  return (
    <>
      <PageHeader
        title="Gastos Próximos"
        actions={
          <Button onClick={() => router.push("/add-expense")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Gasto
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

        {/* Filter */}
        <FilterPanel
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          activeCount={activeFilterCount}
          gridClassName="grid grid-cols-1 gap-4"
        >
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <SelectNative
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Próximos" value={`Q ${totalUpcoming.toFixed(2)}`} size="md" />
          <StatCard label="Esta Semana" value={dueThisWeek} size="md" accent="destructive" />
          <StatCard label="Este Mes" value={dueThisMonth} size="md" accent="warning" />
        </div>

        {/* Upcoming Expenses List */}
        {upcomingExpenses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground">
                No hay gastos recurrentes próximos
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="block md:hidden space-y-3">
              {upcomingExpenses.map((expense) => {
                const daysUntilDue = calculateDaysUntilDue(expense.proximoPago);
                return (
                  <div
                    key={expense._id}
                    className={cn("rounded-xl border p-4", getUrgencyColor(daysUntilDue))}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {expense.vehicleAlias}
                          </span>
                          <Badge variant="outline">{getCategoryLabel(expense.categoria)}</Badge>
                          <Badge variant={getUrgencyBadgeVariant(daysUntilDue)}>
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
                          {expense.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {formatDateForDisplay(expense.proximoPago)}
                      </p>
                      <Badge variant="secondary">{getFrequencyLabel(expense.frecuenciaRecurrencia)}</Badge>
                    </div>
                    <p className="text-xl font-bold text-foreground mt-2">
                      Q {expense.monto.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos Pagos
                  </CardTitle>
                  <CardDescription>
                    Gastos recurrentes que vencen en los próximos 30 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Próximo Pago</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingExpenses.map((expense) => {
                        const daysUntilDue = calculateDaysUntilDue(expense.proximoPago);
                        return (
                          <TableRow key={expense._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {expense.descripcion}
                                <Badge variant={getUrgencyBadgeVariant(daysUntilDue)}>
                                  {daysUntilDue === 0
                                    ? "Hoy"
                                    : daysUntilDue === 1
                                    ? "Mañana"
                                    : daysUntilDue < 0
                                    ? `Vencido`
                                    : `${daysUntilDue}d`}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{expense.vehicleAlias}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getCategoryLabel(expense.categoria)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateForDisplay(expense.proximoPago)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getFrequencyLabel(expense.frecuenciaRecurrencia)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              Q {expense.monto.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  );
}
