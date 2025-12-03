"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { EditVehicleFormData } from "@/Types";
import { PageHeader } from "@/components/layout/PageHeader";
import { useVehicle } from "@/contexts/VehicleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SelectNative } from "@/components/ui/select-native";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditVehicle() {
  const { refreshVehicles } = useVehicle();
  const [formData, setFormData] = useState<EditVehicleFormData>({
    marca: "",
    modelo: new Date().getFullYear(),
    plates: "",
    kilometrajeInicial: "",
    isActive: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const params = useParams<{ alias: string }>();
  const alias: string = params.alias;

  const router = useRouter();

  useEffect(() => {
    if (alias) {
      fetchVehicle();
    }
  }, [alias]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${alias}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar el vehículo");
      }

      const data = await response.json();
      const vehicle = data.data || data;
      
      setFormData({
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        plates: vehicle.plates,
        kilometrajeInicial: vehicle.kilometrajeInicial,
        isActive: vehicle.isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>):void => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/vehicles/${alias}`, {
        method: "PUT",
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
        throw new Error(data.error || "Error al actualizar el vehículo");
      }

      // Refresh vehicles in context
      await refreshVehicles();

      router.push("/dashboard");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar ${alias}`}
        description="Actualiza la información del vehículo"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alias (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="alias">Alias / Nombre</Label>
                <Input
                  id="alias"
                  type="text"
                  value={alias}
                  disabled
                />
                <p className="text-xs text-muted-foreground">El alias no se puede modificar</p>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  name="marca"
                  type="text"
                  required
                  value={formData.marca}
                  onChange={handleChange}
                  disabled={saving}
                  className="uppercase"
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo (Año) *</Label>
                <SelectNative
                  id="modelo"
                  name="modelo"
                  required
                  value={formData.modelo}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </SelectNative>
              </div>

              {/* Placas */}
              <div className="space-y-2">
                <Label htmlFor="plates">Placas *</Label>
                <Input
                  id="plates"
                  name="plates"
                  type="text"
                  required
                  value={formData.plates}
                  onChange={handleChange}
                  disabled={saving}
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
                  value={formData.kilometrajeInicial}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                  }
                  disabled={saving}
                />
                <Label htmlFor="isActive" className="cursor-pointer font-normal">
                  Vehículo activo
                </Label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? "Guardando..." : "Actualizar vehículo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}