"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Maintenance, Vehicle, MaintenanceFilters } from "@/Types";
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
import { Plus, Edit, Trash2, AlertCircle, Wrench } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/features/stats/StatCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";

const MAINTENANCE_TYPES = [
  "Cambio de aceite", "Rotación de llantas", "Frenos", "Inspección",
  "Reparación", "Batería", "Filtros", "Transmisión", "Suspensión", "Alineación", "Otro",
];

export default function MaintenanceHistory() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    vehicleAlias: "", tipo: "", startDate: "", endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { fetchVehicles(); }, []);
  useEffect(() => { fetchMaintenances(); }, [filters]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) { router.push("/"); return; }
        throw new Error("Error al cargar vehículos");
      }
      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.tipo) params.append("tipo", filters.tipo);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      const response = await fetch(`/api/maintenance?${params.toString()}`, { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) { router.push("/"); return; }
        throw new Error("Error al cargar mantenimientos");
      }
      const data = await response.json();
      setMaintenances(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ vehicleAlias: "", tipo: "", startDate: "", endDate: "" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Error al eliminar el mantenimiento");
      setDeleteConfirm(null);
      fetchMaintenances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalCost = maintenances.reduce((sum, m) => sum + m.costo, 0);
  const activeFilterCount = [filters.vehicleAlias, filters.tipo, filters.startDate, filters.endDate].filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Historial de Mantenimientos"
        actions={
          <Button onClick={() => router.push("/add-maintenance")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Mantenimiento
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FilterPanel
          onApply={fetchMaintenances}
          onClear={clearFilters}
          activeCount={activeFilterCount}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <SelectNative name="vehicleAlias" value={filters.vehicleAlias} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {vehicles.map((v) => <option key={v._id} value={v.alias}>{v.alias}</option>)}
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <SelectNative name="tipo" value={filters.tipo} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {MAINTENANCE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Desde</Label>
            <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="space-y-2">
            <Label>Hasta</Label>
            <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </FilterPanel>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard label="Total Mantenimientos" value={maintenances.length} size="md" />
          <StatCard label="Costo Total" value={`Q ${totalCost.toFixed(2)}`} size="md" accent="warning" />
        </div>

        {loading ? (
          <CardSkeleton rows={6} />
        ) : maintenances.length === 0 ? (
          <EmptyState
            icon={<Wrench className="h-12 w-12" />}
            title="Sin mantenimientos registrados"
            description="Lleva el control de los servicios de tus vehículos: cambios de aceite, frenos, llantas y más para evitar sorpresas."
            action={{ label: "Agregar mantenimiento", onClick: () => router.push("/add-maintenance") }}
          />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="block md:hidden space-y-3">
              {maintenances.map((m) => (
                <div key={m._id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{m.vehicle?.alias || m.vehicleAlias}</span>
                        <Badge variant="warning">{m.tipo}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateForDisplay(m.fecha)} · {m.kilometraje.toLocaleString()} km
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => router.push(`/edit-maintenance/${m._id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setDeleteConfirm(m._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-foreground">Q {m.costo.toFixed(2)}</p>
                    {m.descripcion && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.descripcion}</p>}
                    {m.proveedor && <p className="text-xs text-muted-foreground truncate">{m.proveedor}</p>}
                    {m.proximoServicioFecha && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Próximo: {formatDateForDisplay(m.proximoServicioFecha)}
                        {m.proximoServicioKm && ` · ${m.proximoServicioKm.toLocaleString()} km`}
                      </p>
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Kilometraje</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Próximo Servicio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenances.map((m) => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium">{m.vehicle?.alias || m.vehicleAlias}</TableCell>
                        <TableCell><Badge variant="warning">{m.tipo}</Badge></TableCell>
                        <TableCell>{formatDateForDisplay(m.fecha)}</TableCell>
                        <TableCell>{m.kilometraje.toLocaleString()} km</TableCell>
                        <TableCell className="max-w-xs truncate">{m.descripcion}</TableCell>
                        <TableCell>{m.proveedor || "—"}</TableCell>
                        <TableCell className="font-medium">Q {m.costo.toFixed(2)}</TableCell>
                        <TableCell>
                          {m.proximoServicioFecha ? (
                            <div className="text-sm">
                              <div>{formatDateForDisplay(m.proximoServicioFecha)}</div>
                              {m.proximoServicioKm && (
                                <div className="text-muted-foreground">{m.proximoServicioKm.toLocaleString()} km</div>
                              )}
                            </div>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/edit-maintenance/${m._id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(m._id)}>
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
              ADVERTENCIA: Esta acción eliminará permanentemente este mantenimiento y no se puede deshacer.
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
