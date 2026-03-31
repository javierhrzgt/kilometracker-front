"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { getTodayDateString, getDatesBetween, splitDistanceEqually } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useVehicle } from "@/contexts/VehicleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectNative } from "@/components/ui/select-native";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { CheckCircle2, AlertCircle } from "lucide-react";

const schema = z.object({
  vehicleAlias: z.string().min(1, "Selecciona un vehículo"),
  distanciaRecorrida: z.coerce.number().min(0.1, "La distancia debe ser mayor a 0"),
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
  const [savedCount, setSavedCount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // Date state (managed outside RHF)
  const [singleDate, setSingleDate] = useState(getTodayDateString());
  const [rangeValue, setRangeValue] = useState<{ from: string; to: string } | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [dateError, setDateError] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as Resolver<SchemaType>,
    defaultValues: {
      vehicleAlias: vehicleFromUrl || selectedVehicle?.alias || "",
      distanciaRecorrida: undefined,
      notasAdicionales: "",
    },
  });

  const watchedDistancia = watch("distanciaRecorrida");

  // Keep isRangeMode in sync with rangeValue presence
  const handleRangeChange = (range: { from: string; to: string } | null) => {
    setRangeValue(range);
    if (range) setIsRangeMode(true);
  };

  const handleSingleChange = (date: string) => {
    setSingleDate(date);
    setIsRangeMode(false);
    setRangeValue(null);
  };

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

  const postRoute = (body: object) =>
    fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

  const onSubmit = async (data: SchemaType): Promise<void> => {
    setError("");
    setSuccess(false);
    setDateError("");

    // --- Single date mode ---
    if (!isRangeMode || !rangeValue) {
      if (!singleDate) {
        setDateError("La fecha es requerida");
        return;
      }
      setLoading(true);
      try {
        const response = await postRoute({
          vehicleAlias: data.vehicleAlias,
          distanciaRecorrida: data.distanciaRecorrida,
          fecha: singleDate,
          notasAdicionales: data.notasAdicionales,
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || "Error al crear la ruta");
        }
        setSuccess(true);
        setTimeout(() => router.push("/routes-history"), 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- Range mode: validate and batch submit ---
    const dates = getDatesBetween(rangeValue.from, rangeValue.to);
    const days = dates.length;
    const minDistance = Math.round(days * 0.1 * 10) / 10;

    if (data.distanciaRecorrida < minDistance) {
      setDateError(
        `La distancia mínima es ${minDistance} km para ${days} día${days !== 1 ? "s" : ""} (0.1 km/día)`
      );
      return;
    }

    const distances = splitDistanceEqually(data.distanciaRecorrida, days);
    setTotalDays(days);
    setSavedCount(0);
    setLoading(true);

    const results = await Promise.allSettled(
      dates.map((fecha, i) =>
        postRoute({
          vehicleAlias: data.vehicleAlias,
          distanciaRecorrida: distances[i],
          fecha,
          notasAdicionales: data.notasAdicionales,
        }).then(async (res) => {
          setSavedCount((prev) => prev + 1);
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error(d.error || `Error en ${fecha}`);
          }
          return fecha;
        })
      )
    );

    setLoading(false);

    const failed = results
      .map((r, i) => (r.status === "rejected" ? dates[i] : null))
      .filter(Boolean) as string[];

    if (failed.length === 0) {
      setSuccess(true);
      setTimeout(() => router.push("/routes-history"), 1000);
    } else {
      const succeeded = days - failed.length;
      setError(
        `Se registraron ${succeeded} de ${days} rutas. ` +
        `Fechas con error: ${failed.join(", ")}`
      );
    }
  };

  const canSubmit = isValid && (isRangeMode ? !!rangeValue?.from && !!rangeValue?.to : !!singleDate);
  const submitLabel = loading
    ? isRangeMode && totalDays > 1
      ? `Guardando ${savedCount} de ${totalDays}...`
      : "Guardando..."
    : "Registrar ruta";

  return (
    <>
      <PageHeader
        title="Agregar ruta"
        description="Registra un nuevo viaje o trayecto"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {isRangeMode && totalDays > 1
                ? `${totalDays} rutas registradas exitosamente`
                : "Ruta registrada exitosamente"}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehículo */}
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo *</Label>
                <SelectNative
                  id="vehicleAlias"
                  disabled={loading}
                  {...register("vehicleAlias")}
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} ({vehicle.plates})
                    </option>
                  ))}
                </SelectNative>
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

              {/* Fecha (single o rango) */}
              <DateRangeField
                singleValue={singleDate}
                onSingleChange={handleSingleChange}
                rangeValue={rangeValue}
                onRangeChange={handleRangeChange}
                distancia={Number(watchedDistancia) || undefined}
                disabled={loading}
              />
              {dateError && (
                <p className="text-xs text-destructive -mt-4">{dateError}</p>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notasAdicionales">Notas adicionales</Label>
                <Textarea
                  id="notasAdicionales"
                  rows={4}
                  placeholder={
                    isRangeMode
                      ? "Viaje de negocios, vacaciones, trabajo en campo, etc."
                      : "Trabajo, viaje familiar, compras, etc."
                  }
                  disabled={loading}
                  {...register("notasAdicionales")}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-full"
                  size="lg"
                >
                  {submitLabel}
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
