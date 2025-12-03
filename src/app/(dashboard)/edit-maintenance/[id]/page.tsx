"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Maintenance, Vehicle } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SelectNative } from "@/components/ui/select-native";

const MAINTENANCE_TYPES = [
  { value: "Cambio de aceite", label: "Cambio de aceite" },
  { value: "Rotación de llantas", label: "Rotación de llantas" },
  { value: "Frenos", label: "Frenos" },
  { value: "Inspección", label: "Inspección" },
  { value: "Reparación", label: "Reparación" },
  { value: "Batería", label: "Batería" },
  { value: "Filtros", label: "Filtros" },
  { value: "Transmisión", label: "Transmisión" },
  { value: "Suspensión", label: "Suspensión" },
  { value: "Alineación", label: "Alineación" },
  { value: "Otro", label: "Otro" },
];

export default function EditMaintenance() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState({
    vehicleAlias: "",
    tipo: "",
    descripcion: "",
    costo: "",
    fecha: "",
    kilometraje: "",
    proveedor: "",
    proximoServicioFecha: "",
    proximoServicioKm: "",
    notas: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchMaintenance();
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles?isActive=true", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar vehículos");
      }

      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar el mantenimiento");
      }

      const data = await response.json();
      const maintenance: Maintenance = data.data;

      setFormData({
        vehicleAlias: maintenance.vehicleAlias,
        tipo: maintenance.tipo,
        descripcion: maintenance.descripcion,
        costo: maintenance.costo.toString(),
        fecha: maintenance.fecha.split("T")[0],
        kilometraje: maintenance.kilometraje.toString(),
        proveedor: maintenance.proveedor || "",
        proximoServicioFecha: maintenance.proximoServicioFecha
          ? maintenance.proximoServicioFecha.split("T")[0]
          : "",
        proximoServicioKm: maintenance.proximoServicioKm?.toString() || "",
        notas: maintenance.notas || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare payload
      const payload: any = {
        vehicleAlias: formData.vehicleAlias,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        costo: parseFloat(formData.costo),
        fecha: formData.fecha,
        kilometraje: parseFloat(formData.kilometraje),
      };

      // Add optional fields
      if (formData.proveedor) {
        payload.proveedor = formData.proveedor;
      }
      if (formData.proximoServicioFecha) {
        payload.proximoServicioFecha = formData.proximoServicioFecha;
      }
      if (formData.proximoServicioKm) {
        payload.proximoServicioKm = parseFloat(formData.proximoServicioKm);
      }
      if (formData.notas) {
        payload.notas = formData.notas;
      }

      const response = await fetch(`/api/maintenance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el mantenimiento");
      }

      router.push("/maintenance-history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Editar Mantenimiento"
        description="Actualiza la información del mantenimiento"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo *</Label>
                <SelectNative
                  id="vehicleAlias"
                  name="vehicleAlias"
                  value={formData.vehicleAlias}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} {vehicle.modelo}
                    </option>
                  ))}
                </SelectNative>
              </div>

              {/* Maintenance Type */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de mantenimiento *</Label>
                <SelectNative
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar tipo</option>
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </SelectNative>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="costo">Costo *</Label>
                <Input
                  id="costo"
                  name="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Date and Kilometraje */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kilometraje">Kilometraje *</Label>
                  <Input
                    id="kilometraje"
                    name="kilometraje"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.kilometraje}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor / Taller</Label>
                <Input
                  id="proveedor"
                  name="proveedor"
                  type="text"
                  value={formData.proveedor}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Next Service Section */}
              <div className="border-t pt-6">
                <h3 className="text-base font-medium mb-4">
                  Próximo Servicio (Opcional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proximoServicioFecha">Fecha del próximo servicio</Label>
                    <Input
                      id="proximoServicioFecha"
                      name="proximoServicioFecha"
                      type="date"
                      value={formData.proximoServicioFecha}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoServicioKm">Kilometraje próximo servicio</Label>
                    <Input
                      id="proximoServicioKm"
                      name="proximoServicioKm"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.proximoServicioKm}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas adicionales</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Guardando..." : "Actualizar Mantenimiento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
