"use client";

import { useState, useEffect } from "react";
import { Expense, Vehicle, ExpenseFilters } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Filter, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Seguro",
  "Impuestos",
  "Registro",
  "Estacionamiento",
  "Peajes",
  "Lavado",
  "Multas",
  "Financiamiento",
  "Otro",
];

export default function ExpensesHistory() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    vehicleAlias: "",
    categoria: "",
    startDate: "",
    endDate: "",
    esDeducibleImpuestos: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchExpenses();
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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.categoria) params.append("categoria", filters.categoria);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.esDeducibleImpuestos) params.append("esDeducibleImpuestos", filters.esDeducibleImpuestos);

      const url = `/api/expenses${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar gastos");
      }

      const data = await response.json();
      setExpenses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleAlias: "",
      categoria: "",
      startDate: "",
      endDate: "",
      esDeducibleImpuestos: "",
    });
    setTimeout(() => fetchExpenses(), 0);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el gasto");
      }

      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalMonto = expenses.reduce((sum, expense) => sum + expense.monto, 0);
  const taxDeductibleTotal = expenses
    .filter((e) => e.esDeducibleImpuestos)
    .reduce((sum, expense) => sum + expense.monto, 0);

  return (
    <>
      <PageHeader
        title="Historial de Gastos"
        actions={
          <Button onClick={() => router.push("/add-expense")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo</Label>
                <SelectNative
                  id="vehicleAlias"
                  name="vehicleAlias"
                  value={filters.vehicleAlias}
                  onChange={handleFilterChange}
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
                <Label htmlFor="categoria">Categoría</Label>
                <SelectNative
                  id="categoria"
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </SelectNative>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="esDeducibleImpuestos">Deducible</Label>
                <SelectNative
                  id="esDeducibleImpuestos"
                  name="esDeducibleImpuestos"
                  value={filters.esDeducibleImpuestos}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </SelectNative>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Gastos</p>
              <p className="text-3xl font-light">
                Q {totalMonto.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Deducibles</p>
              <p className="text-3xl font-light text-green-600">
                Q {taxDeductibleTotal.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Cantidad</p>
              <p className="text-3xl font-light">
                <Badge variant="secondary" className="text-xl px-3 py-1">
                  {expenses.length}
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>
        ) : expenses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No se encontraron gastos</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{formatDateForDisplay(expense.fecha)}</TableCell>
                    <TableCell className="font-medium">{expense.vehicleAlias}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.categoria}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.descripcion}
                    </TableCell>
                    <TableCell className="font-medium">Q {expense.monto.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {expense.esRecurrente && (
                          <Badge variant="secondary" className="text-xs">
                            {expense.frecuenciaRecurrencia}
                          </Badge>
                        )}
                        {expense.esDeducibleImpuestos && (
                          <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                            Deducible
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/edit-expense/${expense._id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(expense._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ADVERTENCIA: Esta acción eliminará permanentemente este gasto y no se puede deshacer.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
