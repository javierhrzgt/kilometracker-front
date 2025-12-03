"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Refuel, Vehicle } from "@/Types";
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

const tiposCombustible = ["Regular", "Super", "V-Power", "Diesel"];

export default function RefuelsHistory() {
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRefuel, setEditingRefuel] = useState<Refuel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchRefuels();
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

  const fetchRefuels = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filterVehicle) params.append("vehicleAlias", filterVehicle);

      const response = await fetch(`/api/refuels?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar reabastecimientos");
      }

      const data = await response.json();
      setRefuels(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterVehicle(e.target.value);
  };

  const handleApplyFilter = () => {
    fetchRefuels();
  };

  const handleClearFilter = () => {
    setFilterVehicle("");
    setTimeout(() => fetchRefuels(), 0);
  };

  const handleEdit = (refuel: Refuel) => {
    setEditingRefuel({
      ...refuel,
      fecha: getDateValue(refuel.fecha),
    });
  };

  const handleCancelEdit = () => {
    setEditingRefuel(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRefuel) return;

    try {
      const response = await fetch(`/api/refuels/${editingRefuel._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tipoCombustible: editingRefuel.tipoCombustible,
          cantidadGastada: Number(editingRefuel.cantidadGastada),
          galones: editingRefuel.galones ? Number(editingRefuel.galones) : null,
          fecha: editingRefuel.fecha,
          notasAdicionales: editingRefuel.notasAdicionales,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el reabastecimiento");
      }

      setEditingRefuel(null);
      fetchRefuels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/refuels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el reabastecimiento");
      }

      setDeleteConfirm(null);
      fetchRefuels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const filteredRefuels = refuels.filter(refuel => showInactive || refuel.isActive !== false);
  const totalGastado = filteredRefuels.reduce((sum, refuel) => sum + Number(refuel.cantidadGastada || 0), 0);
  const totalGalones = filteredRefuels.reduce((sum, refuel) => sum + Number(refuel.galones || 0), 0);

  return (
    <>
      <PageHeader
        title="Recargas"
        actions={
          <Button onClick={() => router.push("/add-refuel")}>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="vehicleFilter">Vehículo</Label>
                <SelectNative
                  id="vehicleFilter"
                  value={filterVehicle}
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

              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilter} className="flex-1 sm:flex-none">
                    <Filter className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                  <Button onClick={handleClearFilter} variant="outline" className="flex-1 sm:flex-none">
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
                <span className="text-muted-foreground">Mostrar recargas inactivas</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Recargas</p>
              <p className="text-3xl font-light">
                <Badge variant="secondary" className="text-xl px-3 py-1">
                  {filteredRefuels.length}
                </Badge>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Gastado</p>
              <p className="text-3xl font-light">Q {totalGastado.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Galones</p>
              <p className="text-3xl font-light">{totalGalones.toFixed(2)}</p>
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
        ) : filteredRefuels.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No hay recargas registradas</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Galones</TableHead>
                  <TableHead>Precio/Gal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefuels.map((refuel) => (
                  <TableRow key={refuel._id} className={refuel.isActive === false ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{refuel.vehicleAlias}</TableCell>
                    <TableCell>{formatDateForDisplay(refuel.fecha)}</TableCell>
                    <TableCell>{refuel.tipoCombustible}</TableCell>
                    <TableCell>Q {Number(refuel.cantidadGastada).toFixed(2)}</TableCell>
                    <TableCell>{refuel.galones ? Number(refuel.galones).toFixed(2) : "N/A"}</TableCell>
                    <TableCell>
                      {refuel.precioPorGalon ? `Q ${Number(refuel.precioPorGalon).toFixed(2)}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {refuel.isActive === false ? (
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
                          onClick={() => handleEdit(refuel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(refuel._id)}
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
      <Dialog open={!!editingRefuel} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Recarga - {editingRefuel?.vehicleAlias}</DialogTitle>
          </DialogHeader>
          {editingRefuel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de Combustible</Label>
                <SelectNative
                  id="edit-tipo"
                  value={editingRefuel.tipoCombustible}
                  onChange={(e) =>
                    setEditingRefuel({ ...editingRefuel, tipoCombustible: e.target.value })
                  }
                >
                  {tiposCombustible.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </SelectNative>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-monto">Monto (Q)</Label>
                <Input
                  id="edit-monto"
                  type="number"
                  value={editingRefuel.cantidadGastada}
                  onChange={(e) =>
                    setEditingRefuel({ ...editingRefuel, cantidadGastada: e.target.value as any })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-galones">Galones</Label>
                <Input
                  id="edit-galones"
                  type="number"
                  value={editingRefuel.galones || ""}
                  onChange={(e) =>
                    setEditingRefuel({ ...editingRefuel, galones: e.target.value as any })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Input
                  id="edit-fecha"
                  type="date"
                  value={editingRefuel.fecha}
                  onChange={(e) => setEditingRefuel({ ...editingRefuel, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notas">Notas</Label>
                <Input
                  id="edit-notas"
                  type="text"
                  value={editingRefuel.notasAdicionales || ""}
                  onChange={(e) =>
                    setEditingRefuel({ ...editingRefuel, notasAdicionales: e.target.value })
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
              Esta acción eliminará permanentemente esta recarga y no se puede deshacer.
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
