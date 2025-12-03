"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Maintenance, Vehicle, MaintenanceFilters } from "@/Types";
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

const MAINTENANCE_TYPES = [
  "Cambio de aceite",
  "Rotación de llantas",
  "Frenos",
  "Inspección",
  "Reparación",
  "Batería",
  "Filtros",
  "Transmisión",
  "Suspensión",
  "Alineación",
  "Otro",
];

export default function MaintenanceHistory() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    vehicleAlias: "",
    tipo: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
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

      const response = await fetch(`/api/maintenance?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
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

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchMaintenances();
  };

  const clearFilters = () => {
    setFilters({
      vehicleAlias: "",
      tipo: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el mantenimiento");
      }

      setDeleteConfirm(null);
      fetchMaintenances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalCost = maintenances.reduce((sum, m) => sum + m.costo, 0);

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filtros</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Label htmlFor="tipo">Tipo</Label>
                <SelectNative
                  id="tipo"
                  name="tipo"
                  value={filters.tipo}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </SelectNative>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Desde</Label>
                <Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Hasta</Label>
                <Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <Button onClick={handleApplyFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Mantenimientos</p>
              <p className="text-3xl font-light">
                <Badge variant="secondary" className="text-xl px-3 py-1">
                  {maintenances.length}
                </Badge>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Costo Total</p>
              <p className="text-3xl font-light">Q {totalCost.toFixed(2)}</p>
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
        ) : maintenances.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">No hay mantenimientos registrados</p>
              <Button onClick={() => router.push("/add-maintenance")}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Mantenimiento
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                {maintenances.map((maintenance) => (
                  <TableRow key={maintenance._id}>
                    <TableCell className="font-medium">
                      {maintenance.vehicle?.alias || maintenance.vehicleAlias}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{maintenance.tipo}</Badge>
                    </TableCell>
                    <TableCell>{formatDateForDisplay(maintenance.fecha)}</TableCell>
                    <TableCell>{maintenance.kilometraje.toLocaleString()} km</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {maintenance.descripcion}
                    </TableCell>
                    <TableCell>{maintenance.proveedor || "-"}</TableCell>
                    <TableCell className="font-medium">Q {maintenance.costo.toFixed(2)}</TableCell>
                    <TableCell>
                      {maintenance.proximoServicioFecha ? (
                        <div className="text-sm">
                          <div>{formatDateForDisplay(maintenance.proximoServicioFecha)}</div>
                          {maintenance.proximoServicioKm && (
                            <div className="text-muted-foreground">
                              {maintenance.proximoServicioKm.toLocaleString()} km
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/edit-maintenance/${maintenance._id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(maintenance._id)}
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
              ADVERTENCIA: Esta acción eliminará permanentemente este mantenimiento y no se puede deshacer.
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
