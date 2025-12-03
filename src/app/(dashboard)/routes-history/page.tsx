"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route, Vehicle } from "@/Types";
import { formatDateForDisplay, getDateValue } from "@/lib/dateUtils";
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
import { Filter, Plus, Edit, Trash2, X, Check, AlertCircle } from "lucide-react";

export default function RoutesHistory() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({
    vehicleAlias: "",
    startDate: "",
    endDate: "",
  });
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
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

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

      const response = await fetch(`/api/routes?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
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

  const handleApplyFilters = () => {
    fetchRoutes();
  };

  const handleClearFilters = () => {
    setFilters({ vehicleAlias: "", startDate: "", endDate: "" });
    setTimeout(() => fetchRoutes(), 0);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute({
      ...route,
      fecha: getDateValue(route.fecha),
    });
  };

  const handleCancelEdit = () => {
    setEditingRoute(null);
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

      if (!response.ok) {
        throw new Error("Error al actualizar la ruta");
      }

      setEditingRoute(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la ruta");
      }

      setDeleteConfirm(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const filteredRoutes = routes.filter(route => showInactive || route.isActive !== false);
  const totalKm = filteredRoutes.reduce((sum, route) => sum + route.distanciaRecorrida, 0);

  return (
    <>
      <PageHeader
        title="Rutas"
        actions={
          <Button onClick={() => router.push("/add-route")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo</Label>
                <SelectNative
                  id="vehicleAlias"
                  name="vehicleAlias"
                  value={filters.vehicleAlias}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los vehículos</option>
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

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-muted-foreground">Mostrar rutas inactivas</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Rutas</p>
              <p className="text-3xl font-light">
                <Badge variant="secondary" className="text-xl px-3 py-1">
                  {filteredRoutes.length}
                </Badge>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Distancia Total</p>
              <p className="text-3xl font-light">
                {totalKm.toFixed(1)} <span className="text-lg text-muted-foreground">km</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>
        ) : filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No hay rutas registradas</p>
            </CardContent>
          </Card>
        ) : (
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
                    <TableCell className="max-w-xs truncate">{route.notasAdicionales || "Sin notas"}</TableCell>
                    <TableCell>
                      {route.isActive === false ? (
                        <Badge variant="secondary">Inactivo</Badge>
                      ) : (
                        <Badge variant="outline">Activo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(route)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(route._id)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingRoute} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ruta - {editingRoute?.vehicleAlias}</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-distance">Distancia (km)</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  value={editingRoute.distanciaRecorrida}
                  onChange={(e) =>
                    setEditingRoute({ ...editingRoute, distanciaRecorrida: e.target.value as any })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingRoute.fecha}
                  onChange={(e) => setEditingRoute({ ...editingRoute, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas</Label>
                <Input
                  id="edit-notes"
                  type="text"
                  value={editingRoute.notasAdicionales || ""}
                  onChange={(e) =>
                    setEditingRoute({ ...editingRoute, notasAdicionales: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Check className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta acción eliminará permanentemente esta ruta y no se puede deshacer.
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
