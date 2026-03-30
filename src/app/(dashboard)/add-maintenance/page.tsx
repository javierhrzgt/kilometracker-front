"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { getTodayDateString } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useVehicle } from "@/contexts/VehicleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
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

const schema = z.object({
  vehicleAlias: z.string().min(1, "Selecciona un vehículo"),
  tipo: z.string().min(1, "Selecciona el tipo de mantenimiento"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  costo: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
  fecha: z.string().min(1, "La fecha es requerida"),
  kilometraje: z.coerce.number().min(0, "El kilometraje debe ser mayor o igual a 0"),
  proveedor: z.string().optional().default(""),
  proximoServicioFecha: z.string().optional().default(""),
  proximoServicioKm: z.coerce.number().min(0).optional().or(z.literal("")),
  notas: z.string().optional().default(""),
});

type SchemaType = z.infer<typeof schema>;

export default function AddMaintenance() {
  const { vehicles } = useVehicle();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as Resolver<SchemaType>,
    defaultValues: {
      vehicleAlias: "",
      tipo: "",
      descripcion: "",
      costo: undefined,
      fecha: getTodayDateString(),
      kilometraje: undefined,
      proveedor: "",
      proximoServicioFecha: "",
      proximoServicioKm: "",
      notas: "",
    },
  });

  const onSubmit = async (data: SchemaType): Promise<void> => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const payload: {
        vehicleAlias: string;
        tipo: string;
        descripcion: string;
        costo: number;
        fecha: string;
        kilometraje: number;
        proveedor?: string;
        proximoServicioFecha?: string;
        proximoServicioKm?: number;
        notas?: string;
      } = {
        vehicleAlias: data.vehicleAlias,
        tipo: data.tipo,
        descripcion: data.descripcion,
        costo: data.costo,
        fecha: data.fecha,
        kilometraje: data.kilometraje,
      };

      if (data.proveedor) {
        payload.proveedor = data.proveedor;
      }
      if (data.proximoServicioFecha) {
        payload.proximoServicioFecha = data.proximoServicioFecha;
      }
      if (data.proximoServicioKm !== "" && data.proximoServicioKm !== undefined) {
        payload.proximoServicioKm = Number(data.proximoServicioKm);
      }
      if (data.notas) {
        payload.notas = data.notas;
      }

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al crear el mantenimiento");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/maintenance-history");
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Agregar mantenimiento"
        description="Registra un nuevo servicio o mantenimiento"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Mantenimiento registrado exitosamente
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo *</Label>
                <SelectNative
                  id="vehicleAlias"
                  disabled={loading}
                  {...register("vehicleAlias")}
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} {vehicle.modelo}
                    </option>
                  ))}
                </SelectNative>
                {errors.vehicleAlias?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.vehicleAlias.message}</p>
                )}
              </div>

              {/* Maintenance Type */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de mantenimiento *</Label>
                <SelectNative
                  id="tipo"
                  disabled={loading}
                  {...register("tipo")}
                >
                  <option value="">Seleccionar tipo</option>
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </SelectNative>
                {errors.tipo?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.tipo.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  disabled={loading}
                  rows={3}
                  placeholder="Detalles del mantenimiento..."
                  {...register("descripcion")}
                />
                {errors.descripcion?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>
                )}
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="costo">Costo (Q) *</Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={loading}
                  placeholder="0.00"
                  {...register("costo")}
                />
                {errors.costo?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.costo.message}</p>
                )}
              </div>

              {/* Date and Kilometraje in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    disabled={loading}
                    {...register("fecha")}
                  />
                  {errors.fecha?.message && (
                    <p className="text-xs text-destructive mt-1">{errors.fecha.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kilometraje">Kilometraje *</Label>
                  <Input
                    id="kilometraje"
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={loading}
                    placeholder="15000"
                    {...register("kilometraje")}
                  />
                  {errors.kilometraje?.message && (
                    <p className="text-xs text-destructive mt-1">{errors.kilometraje.message}</p>
                  )}
                </div>
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor / Taller</Label>
                <Input
                  id="proveedor"
                  type="text"
                  disabled={loading}
                  placeholder="Nombre del taller o proveedor"
                  {...register("proveedor")}
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
                      type="date"
                      disabled={loading}
                      {...register("proximoServicioFecha")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoServicioKm">Kilometraje próximo servicio</Label>
                    <Input
                      id="proximoServicioKm"
                      type="number"
                      step="0.1"
                      min="0"
                      disabled={loading}
                      placeholder="20000"
                      {...register("proximoServicioKm")}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas adicionales</Label>
                <Textarea
                  id="notas"
                  disabled={loading}
                  rows={3}
                  placeholder="Información adicional..."
                  {...register("notas")}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Guardando..." : "Guardar mantenimiento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
