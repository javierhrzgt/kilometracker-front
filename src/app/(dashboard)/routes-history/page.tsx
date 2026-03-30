"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route, Vehicle } from "@/Types";
import { formatDateForDisplay, getDateValue } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
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
import { Plus, Edit, Trash2, Check, AlertCircle, Map } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/features/stats/StatCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";

export default function RoutesHistory() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({ vehicleAlias: "", startDate: "", endDate: "" });
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/routes?${params.toString()}`, { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) { router.push("/"); return; }
        throw new Error("Error al cargar rutas");
      }
      const data = await response.json();
      setRoutes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ vehicleAlias: "", startDate: "", endDate: "" });
    setTimeout(() => fetchRoutes(), 0);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute({ ...route, fecha: getDateValue(route.fecha) });
  };

  const handleSaveEdit = async () => {
    if (!editingRoute) return;
    try {
      const response = await fetch(`/api/routes/${editingRoute._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          distanciaRecorrida: Number(editingRoute.distanciaRecorrida),
          fecha: editingRoute.fecha,
          notasAdicionales: editingRoute.notasAdicionales,
        }),
      });
      if (!response.ok) throw new Error("Error al actualizar la ruta");
      setEditingRoute(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/routes/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Error al eliminar la ruta");
      setDeleteConfirm(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const filteredRoutes = routes.filter(r => showInactive || r.isActive !== false);
  const totalKm = filteredRoutes.reduce((sum, r) => sum + r.distanciaRecorrida, 0);
  const activeFilterCount = [filters.vehicleAlias, filters.startDate, filters.endDate].filter(Boolean).length;

  const inactivosToggle = (
    <label className="flex items-center gap-2 cursor-pointer text-sm shrink-0">
      <input
        type="checkbox"
        checked={showInactive}
        onChange={(e) => setShowInactive(e.target.checked)}
        className="w-4 h-4 rounded border-input"
      />
      <span className="text-muted-foreground text-xs">Inactivos</span>
    </label>
  );

  return (
    <>
      <PageHeader
        title="Rutas"
        actions={
          <Button onClick={() => router.push("/add-route")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Ruta
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
          onApply={fetchRoutes}
          onClear={handleClearFilters}
          activeCount={activeFilterCount}
          gridClassName="grid grid-cols-1 sm:grid-cols-3 gap-4"
          extras={inactivosToggle}
        >
          <div className="space-y-2">
            <Label>Vehículo</Label>
            <SelectNative name="vehicleAlias" value={filters.vehicleAlias} onChange={handleFilterChange}>
              <option value="">Todos los vehículos</option>
              {vehicles.map((v) => <option key={v._id} value={v.alias}>{v.alias}</option>)}
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard label="Rutas" value={filteredRoutes.length} size="md" />
          <StatCard label="Distancia Total" value={totalKm.toFixed(1)} unit="km" size="md" />
        </div>

        {loading ? (
          <CardSkeleton rows={6} />
        ) : filteredRoutes.length === 0 ? (
          <EmptyState
            icon={<Map className="h-12 w-12" />}
            title="Sin rutas registradas"
            description="Registra tus viajes para llevar un seguimiento de los kilómetros recorridos y mantener el odómetro actualizado."
            action={{ label: "Registrar ruta", onClick: () => router.push("/add-route") }}
          />
        ) : (
          <>
            {/* Mobile card list */}
            <div className="block md:hidden space-y-3">
              {filteredRoutes.map((route) => (
                <div
                  key={route._id}
                  className={cn("rounded-xl border border-border bg-card p-4", route.isActive === false && "opacity-60")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{route.vehicleAlias}</span>
                        <Badge variant={route.isActive === false ? "muted" : "success"}>
                          {route.isActive === false ? "Inactivo" : "Activo"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateForDisplay(route.fecha)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(route)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(route._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xl font-bold text-foreground">
                      {route.distanciaRecorrida} <span className="text-sm font-normal text-muted-foreground">km</span>
                    </p>
                    {route.notasAdicionales && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{route.notasAdicionales}</p>
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
                      <TableHead>Distancia</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow key={route._id} className={route.isActive === false ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{route.vehicleAlias}</TableCell>
                        <TableCell>{formatDateForDisplay(route.fecha)}</TableCell>
                        <TableCell>{route.distanciaRecorrida} km</TableCell>
                        <TableCell className="max-w-xs truncate">{route.notasAdicionales || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={route.isActive === false ? "muted" : "success"}>
                            {route.isActive === false ? "Inactivo" : "Activo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(route)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(route._id)}>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingRoute} onOpenChange={(open) => !open && setEditingRoute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ruta — {editingRoute?.vehicleAlias}</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Distancia (km)</Label>
                <Input type="number" value={editingRoute.distanciaRecorrida}
                  onChange={(e) => setEditingRoute({ ...editingRoute, distanciaRecorrida: e.target.value as any })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input type="date" value={editingRoute.fecha}
                  onChange={(e) => setEditingRoute({ ...editingRoute, fecha: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Input type="text" value={editingRoute.notasAdicionales || ""}
                  onChange={(e) => setEditingRoute({ ...editingRoute, notasAdicionales: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRoute(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}><Check className="h-4 w-4 mr-2" />Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar eliminación</DialogTitle></DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Esta acción eliminará permanentemente esta ruta y no se puede deshacer.</AlertDescription>
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
