"use client";

import { useState, useEffect } from "react";
import { ExpenseSummary, Vehicle } from "@/Types";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Filter, AlertCircle } from "lucide-react";

export default function ExpensesSummary() {
  const [summary, setSummary] = useState<ExpenseSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchSummary();
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

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVehicle) params.append("vehicleAlias", selectedVehicle);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `/api/expenses/summary${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar resumen");
      }

      const data = await response.json();
      setSummary(data.data?.summary || data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchSummary();
  };

  const handleClearFilters = () => {
    setSelectedVehicle("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      setLoading(true);
      fetchSummary();
    }, 0);
  };

  const getCategoryColor = (index: number): string => {
    const colors = [
      "bg-info",
      "bg-success",
      "bg-warning",
      "bg-purple",
      "bg-primary",
      "bg-destructive",
    ];
    return colors[index % colors.length];
  };

  const totalMonto = summary.reduce((sum, item) => sum + item.totalMonto, 0);
  const totalCantidad = summary.reduce((sum, item) => sum + item.cantidad, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Resumen de Gastos" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6 shadow-sm hover:shadow-depth-2 transition-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleApplyFilters} className="shadow-sm hover:shadow-depth-2 transition-smooth">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="transition-smooth">
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm hover:shadow-depth-3 transition-elevation">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Gastado</p>
                  <p className="text-3xl font-semibold">
                    Q {totalMonto.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-depth-3 transition-elevation">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Gastos</p>
                  <p className="text-3xl font-semibold">{totalCantidad}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {totalCantidad}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        {summary.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground">No se encontraron gastos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {summary.map((item, index) => {
              const percentage = totalMonto > 0 ? (item.totalMonto / totalMonto) * 100 : 0;
              return (
                <Card key={item._id} className="shadow-sm hover:shadow-depth-3 transition-elevation">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{item._id}</span>
                      <Badge variant="outline">{item.cantidad}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        Q {item.totalMonto.toFixed(2)}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Porcentaje</span>
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`${getCategoryColor(index)} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Promedio: Q {(item.totalMonto / item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detailed Table */}
        {summary.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detalle por Categoría
              </CardTitle>
              <CardDescription>
                Información completa de gastos agrupados por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Monto Total</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead>Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.map((item) => {
                      const percentage = totalMonto > 0 ? (item.totalMonto / totalMonto) * 100 : 0;
                      return (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">{item._id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.cantidad}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            Q {item.totalMonto.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            Q {(item.totalMonto / item.cantidad).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{percentage.toFixed(2)}%</span>
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
