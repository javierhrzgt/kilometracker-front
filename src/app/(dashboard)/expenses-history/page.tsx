"use client";

import { useState, useEffect } from "react";
import { Expense, Vehicle, ExpenseFilters, PaginationMeta } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FilterPanel } from "@/components/ui/FilterPanel";
import { Edit, Trash2, AlertCircle, Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/features/stats/StatCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Pagination } from "@/components/ui/Pagination";

const EXPENSE_CATEGORIES = [
  "Seguro", "Impuestos", "Registro", "Estacionamiento",
  "Peajes", "Lavado", "Multas", "Financiamiento", "Otro",
];

export default function ExpensesHistory() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    vehicleAlias: "", categoria: "", startDate: "", endDate: "", esDeducibleImpuestos: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const router = useRouter();

  useEffect(() => { fetchVehicles(); }, []);
  useEffect(() => { fetchExpenses(); }, [currentPage]);

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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.categoria) params.append("categoria", filters.categoria);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.esDeducibleImpuestos) params.append("esDeducibleImpuestos", filters.esDeducibleImpuestos);
      params.append("page", currentPage.toString());

      const url = `/api/expenses${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) {
        if (response.status === 401) { router.push("/"); return; }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar gastos");
      }
      const data = await response.json();
      setExpenses(data.data || []);
      setPagination(data.pagination ?? null);
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

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilters({ vehicleAlias: "", categoria: "", startDate: "", endDate: "", esDeducibleImpuestos: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Error al eliminar el gasto");
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalMonto = expenses.reduce((sum, e) => sum + e.monto, 0);
  const taxDeductibleTotal = expenses.filter((e) => e.esDeducibleImpuestos).reduce((sum, e) => sum + e.monto, 0);
  const activeFilterCount = [
    filters.vehicleAlias, filters.categoria, filters.startDate, filters.endDate, filters.esDeducibleImpuestos,
  ].filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Historial de Gastos"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FilterPanel
          onApply={() => { setCurrentPage(1); fetchExpenses(); }}
          onClear={handleClearFilters}
          activeCount={activeFilterCount}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <SelectNative name="vehicleAlias" value={filters.vehicleAlias} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {vehicles.map((v) => <option key={v._id} value={v.alias}>{v.alias}</option>)}
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <SelectNative name="categoria" value={filters.categoria} onChange={handleFilterChange}>
              <option value="">Todas</option>
              {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Deducible</Label>
            <SelectNative name="esDeducibleImpuestos" value={filters.esDeducibleImpuestos} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Fecha inicio</Label>
            <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="space-y-2">
            <Label>Fecha fin</Label>
            <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </FilterPanel>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Gastos" value={`Q ${totalMonto.toFixed(2)}`} size="md" />
          <StatCard label="Deducibles" value={`Q ${taxDeductibleTotal.toFixed(2)}`} size="md" accent="success" />
          <StatCard label="Cantidad" value={pagination?.total ?? expenses.length} size="md" />
        </div>

        {loading ? (
          <CardSkeleton rows={6} />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-12 w-12" />}
            title="Sin gastos registrados"
            description="Registra seguros, impuestos, estacionamiento y otros gastos para conocer el costo total de tus vehículos."
            action={{ label: "Registrar gasto", onClick: () => router.push("/add-expense") }}
          />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="block md:hidden space-y-3">
              {expenses.map((expense) => (
                <div key={expense._id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{expense.vehicleAlias}</span>
                        <Badge variant="info">{expense.categoria}</Badge>
                        {expense.esDeducibleImpuestos && <Badge variant="success">Deducible</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateForDisplay(expense.fecha)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => router.push(`/edit-expense/${expense._id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setDeleteConfirm(expense._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-foreground">Q {expense.monto.toFixed(2)}</p>
                    {expense.descripcion && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{expense.descripcion}</p>
                    )}
                    {expense.esRecurrente && (
                      <Badge variant="secondary" className="text-xs mt-1">{expense.frecuenciaRecurrencia}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Fecha</TableHead>
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
                        <TableCell className="font-medium">{expense.vehicleAlias}</TableCell>
                        <TableCell>{formatDateForDisplay(expense.fecha)}</TableCell>
                        <TableCell><Badge variant="info">{expense.categoria}</Badge></TableCell>
                        <TableCell className="max-w-xs truncate">{expense.descripcion}</TableCell>
                        <TableCell className="font-medium">Q {expense.monto.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {expense.esRecurrente && (
                              <Badge variant="secondary" className="text-xs">{expense.frecuenciaRecurrencia}</Badge>
                            )}
                            {expense.esDeducibleImpuestos && (
                              <Badge variant="success" className="text-xs">Deducible</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/edit-expense/${expense._id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(expense._id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {pagination && (
              <div className="mt-4">
                <Pagination
                  pagination={pagination}
                  onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle></DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ADVERTENCIA: Esta acción eliminará permanentemente este gasto y no se puede deshacer.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 className="h-4 w-4 mr-2" />Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
