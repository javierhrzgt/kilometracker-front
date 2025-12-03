"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddVehicleFormData } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { useVehicle } from "@/contexts/VehicleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function AddVehicle() {
  const [formData, setFormData] = useState<AddVehicleFormData>({
    alias: "",
    marca: "",
    modelo: new Date().getFullYear(),
    plates: "",
    kilometrajeInicial: "",
    isActive: true,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { refreshVehicles } = useVehicle();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          ...formData,
          modelo: Number(formData.modelo),
          kilometrajeInicial: Number(formData.kilometrajeInicial),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el vehículo");
      }

      // Refresh vehicles in context
      await refreshVehicles();

      router.push("/dashboard");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years: number[] = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alias */}
              <div className="space-y-2">
                <Label htmlFor="alias">Alias / Nombre *</Label>
                <Input
                  id="alias"
                  name="alias"
                  type="text"
                  required
                  placeholder="Mi Carro"
                  value={formData.alias}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Identificador único para el vehículo</p>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  name="marca"
                  type="text"
                  required
                  placeholder="Toyota"
                  value={formData.marca}
                  onChange={handleChange}
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo (Año) *</Label>
                <select
                  id="modelo"
                  name="modelo"
                  required
                  value={formData.modelo}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Placas */}
              <div className="space-y-2">
                <Label htmlFor="plates">Placas *</Label>
                <Input
                  id="plates"
                  name="plates"
                  type="text"
                  required
                  placeholder="ABC1234"
                  value={formData.plates}
                  onChange={handleChange}
                  disabled={loading}
                  className="uppercase"
                />
              </div>

              {/* Kilometraje Inicial */}
              <div className="space-y-2">
                <Label htmlFor="kilometrajeInicial">Kilometraje inicial *</Label>
                <Input
                  id="kilometrajeInicial"
                  name="kilometrajeInicial"
                  type="number"
                  required
                  min="0"
                  placeholder="50000"
                  value={formData.kilometrajeInicial}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Kilometraje actual del vehículo al momento de registrarlo</p>
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-3 py-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 rounded text-primary focus:ring-2 focus:ring-ring"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Vehículo activo
                </Label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.alias || !formData.marca || !formData.plates || !formData.kilometrajeInicial}
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
