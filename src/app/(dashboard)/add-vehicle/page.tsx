"use client";

import { useState } from "react";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { useVehicle } from "@/contexts/VehicleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  alias: z.string().min(1, "El alias es requerido").max(20),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  plates: z.string().min(1, "Las placas son requeridas"),
  kilometrajeInicial: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  isActive: z.boolean().default(true),
});

type SchemaType = z.infer<typeof schema>;

export default function AddVehicle() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { refreshVehicles } = useVehicle();

  const currentYear = new Date().getFullYear();
  const years: number[] = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema) as Resolver<SchemaType>,
    defaultValues: {
      alias: "",
      marca: "",
      modelo: currentYear,
      plates: "",
      kilometrajeInicial: 0,
      isActive: true,
    },
  });

  const onSubmit = async (data: SchemaType): Promise<void> => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          alias: data.alias,
          marca: data.marca,
          modelo: data.modelo,
          plates: data.plates,
          kilometrajeInicial: data.kilometrajeInicial,
          isActive: data.isActive,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al crear el vehículo");
      }

      await refreshVehicles();

      router.push("/dashboard");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Agregar vehículo"
        description="Registra un nuevo vehículo en tu flota"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Alias */}
              <div className="space-y-2">
                <Label htmlFor="alias">Alias / Nombre *</Label>
                <Input
                  id="alias"
                  type="text"
                  placeholder="Mi Carro"
                  disabled={loading}
                  {...register("alias")}
                />
                {errors.alias?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.alias.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Identificador único para el vehículo</p>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  type="text"
                  placeholder="Toyota"
                  disabled={loading}
                  className="uppercase"
                  {...register("marca")}
                />
                {errors.marca?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.marca.message}</p>
                )}
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo (Año) *</Label>
                <select
                  id="modelo"
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...register("modelo")}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.modelo?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.modelo.message}</p>
                )}
              </div>

              {/* Placas */}
              <div className="space-y-2">
                <Label htmlFor="plates">Placas *</Label>
                <Input
                  id="plates"
                  type="text"
                  placeholder="ABC1234"
                  disabled={loading}
                  className="uppercase"
                  {...register("plates")}
                />
                {errors.plates?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.plates.message}</p>
                )}
              </div>

              {/* Kilometraje Inicial */}
              <div className="space-y-2">
                <Label htmlFor="kilometrajeInicial">Kilometraje inicial *</Label>
                <Input
                  id="kilometrajeInicial"
                  type="number"
                  min="0"
                  placeholder="50000"
                  disabled={loading}
                  {...register("kilometrajeInicial")}
                />
                {errors.kilometrajeInicial?.message && (
                  <p className="text-xs text-destructive mt-1">{errors.kilometrajeInicial.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Kilometraje actual del vehículo al momento de registrarlo</p>
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-3 py-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Vehículo activo
                </Label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Guardando..." : "Registrar vehículo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
