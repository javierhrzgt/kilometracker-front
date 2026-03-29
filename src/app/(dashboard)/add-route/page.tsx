"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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

const schema = z.object({
  vehicleAlias: z.string().min(1, "Selecciona un vehículo"),
  distanciaRecorrida: z.coerce.number().min(0.1, "La distancia debe ser mayor a 0"),
  fecha: z.string().min(1, "La fecha es requerida"),
  notasAdicionales: z.string().optional().default(""),
});

type SchemaType = z.infer<typeof schema>;

function AddRouteForm() {
  const { vehicles, selectedVehicle } = useVehicle();
  const searchParams = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as Resolver<SchemaType>,
    defaultValues: {
      vehicleAlias: vehicleFromUrl || selectedVehicle?.alias || "",
      distanciaRecorrida: undefined,
      fecha: getTodayDateString(),
      notasAdicionales: "",
    },
  });

  // Update form when selectedVehicle changes (from VehicleSwitcher)
  useEffect(() => {
    if (selectedVehicle && !vehicleFromUrl) {
      setValue('vehicleAlias', selectedVehicle.alias);
    }
  }, [selectedVehicle, vehicleFromUrl, setValue]);

  // Auto-select first active vehicle if none selected
  useEffect(() => {
    if (!vehicleFromUrl && vehicles.length > 0) {
      const activeVehicle = vehicles.find(v => v.isActive);
      if (activeVehicle) {
        setValue('vehicleAlias', activeVehicle.alias);
      }
    }
  }, [vehicles, vehicleFromUrl, setValue]);

  const onSubmit = async (data: SchemaType): Promise<void> => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          vehicleAlias: data.vehicleAlias,
          distanciaRecorrida: data.distanciaRecorrida,
          fecha: data.fecha,
          notasAdicionales: data.notasAdicionales,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al crear la ruta");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/routes-history");
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
        title="Agregar ruta"
        description="Registra un nuevo viaje o trayecto"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Ruta registrada exitosamente
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
              {/* Vehículo */}
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo *</Label>
                <select
                  id="vehicleAlias"
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...register("vehicleAlias")}
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} ({vehicle.plates})
                    </option>
                  ))}
                </select>
                {errors.vehicleAlias?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.vehicleAlias.message}</p>
                )}
              </div>

              {/* Distancia */}
              <div className="space-y-2">
                <Label htmlFor="distanciaRecorrida">Distancia recorrida (km) *</Label>
                <Input
                  id="distanciaRecorrida"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                  disabled={loading}
                  {...register("distanciaRecorrida")}
                />
                {errors.distanciaRecorrida?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.distanciaRecorrida.message}</p>
                )}
              </div>

              {/* Fecha */}
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

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notasAdicionales">Notas adicionales</Label>
                <Textarea
                  id="notasAdicionales"
                  rows={4}
                  placeholder="Trabajo, viaje familiar, compras, etc."
                  disabled={loading}
                  {...register("notasAdicionales")}
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
                  {loading ? "Guardando..." : "Registrar ruta"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function AddRoute() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    }>
      <AddRouteForm />
    </Suspense>
  );
}
