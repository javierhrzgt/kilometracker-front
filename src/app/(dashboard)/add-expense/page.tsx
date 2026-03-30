"use client";

import { useState } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";

const EXPENSE_CATEGORIES = [
  { value: "Seguro", label: "Seguro" },
  { value: "Impuestos", label: "Impuestos" },
  { value: "Registro", label: "Registro" },
  { value: "Estacionamiento", label: "Estacionamiento" },
  { value: "Peajes", label: "Peajes" },
  { value: "Lavado", label: "Lavado" },
  { value: "Multas", label: "Multas" },
  { value: "Financiamiento", label: "Financiamiento" },
  { value: "Otro", label: "Otro" },
];

const RECURRING_FREQUENCIES = [
  { value: "", label: "No recurrente" },
  { value: "Mensual", label: "Mensual" },
  { value: "Trimestral", label: "Trimestral" },
  { value: "Semestral", label: "Semestral" },
  { value: "Anual", label: "Anual" },
];

const schema = z.object({
  vehicleAlias: z.string().min(1, "Selecciona un vehículo"),
  categoria: z.string().min(1, "Selecciona una categoría"),
  monto: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  fecha: z.string().min(1, "La fecha es requerida"),
  esRecurrente: z.boolean().default(false),
  frecuenciaRecurrencia: z.string().optional().default(""),
  proximoPago: z.string().optional().default(""),
  esDeducibleImpuestos: z.boolean().default(false),
}).refine(
  (data) => !data.esRecurrente || (data.frecuenciaRecurrencia && data.proximoPago),
  {
    message: "La frecuencia y próxima fecha son requeridas para gastos recurrentes",
    path: ["frecuenciaRecurrencia"],
  }
);

type SchemaType = z.infer<typeof schema>;

export default function AddExpense() {
  const { vehicles } = useVehicle();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as Resolver<SchemaType>,
    defaultValues: {
      vehicleAlias: "",
      categoria: "",
      monto: undefined,
      descripcion: "",
      fecha: getTodayDateString(),
      esRecurrente: false,
      frecuenciaRecurrencia: "",
      proximoPago: "",
      esDeducibleImpuestos: false,
    },
  });

  const esRecurrente = watch("esRecurrente");

  const onSubmit = async (data: SchemaType): Promise<void> => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const payload: {
        vehicleAlias: string;
        categoria: string;
        monto: number;
        descripcion: string;
        fecha: string;
        esRecurrente: boolean;
        esDeducibleImpuestos: boolean;
        frecuenciaRecurrencia?: string;
        proximoPago?: string;
      } = {
        vehicleAlias: data.vehicleAlias,
        categoria: data.categoria,
        monto: data.monto,
        descripcion: data.descripcion,
        fecha: data.fecha,
        esRecurrente: data.esRecurrente,
        esDeducibleImpuestos: data.esDeducibleImpuestos,
      };

      if (data.esRecurrente) {
        payload.frecuenciaRecurrencia = data.frecuenciaRecurrencia;
        payload.proximoPago = data.proximoPago;
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al crear el gasto");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/expenses-history");
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
        title="Agregar gasto"
        description="Registra un nuevo gasto del vehículo"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Gasto registrado exitosamente
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

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <SelectNative
                  id="categoria"
                  disabled={loading}
                  {...register("categoria")}
                >
                  <option value="">Seleccionar categoría</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </SelectNative>
                {errors.categoria?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.categoria.message}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (Q) *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={loading}
                  placeholder="0.00"
                  {...register("monto")}
                />
                {errors.monto?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.monto.message}</p>
                )}
              </div>

              {/* Date */}
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  disabled={loading}
                  rows={3}
                  placeholder="Detalles del gasto..."
                  {...register("descripcion")}
                />
                {errors.descripcion?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>
                )}
              </div>

              {/* Tax Deductible Checkbox */}
              <div className="flex items-center gap-2">
                <Controller
                  name="esDeducibleImpuestos"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="esDeducibleImpuestos"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="esDeducibleImpuestos" className="cursor-pointer font-normal">
                  Deducible de impuestos
                </Label>
              </div>

              {/* Recurring Checkbox */}
              <div className="flex items-center gap-2">
                <Controller
                  name="esRecurrente"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="esRecurrente"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="esRecurrente" className="cursor-pointer font-normal">
                  Gasto recurrente
                </Label>
              </div>

              {/* Recurring Options */}
              {esRecurrente && (
                <div className="pl-6 border-l-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frecuenciaRecurrencia">Frecuencia *</Label>
                    <SelectNative
                      id="frecuenciaRecurrencia"
                      disabled={loading}
                      {...register("frecuenciaRecurrencia")}
                    >
                      {RECURRING_FREQUENCIES.slice(1).map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </SelectNative>
                    {errors.frecuenciaRecurrencia?.message && (
                      <p className="text-xs text-destructive mt-1">{errors.frecuenciaRecurrencia.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoPago">Próxima fecha de pago *</Label>
                    <Input
                      id="proximoPago"
                      type="date"
                      disabled={loading}
                      {...register("proximoPago")}
                    />
                    {errors.proximoPago?.message && (
                      <p className="text-xs text-destructive mt-1">{errors.proximoPago.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Guardando..." : "Guardar gasto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
