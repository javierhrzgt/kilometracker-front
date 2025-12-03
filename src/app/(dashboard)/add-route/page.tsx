"use client";

import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react";
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

interface FormData {
  vehicleAlias: string;
  distanciaRecorrida: string;
  fecha: string;
  notasAdicionales: string;
}

function AddRouteForm() {
  const { vehicles, selectedVehicle } = useVehicle();
  const searchParams = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle');

  const [formData, setFormData] = useState<FormData>({
    vehicleAlias: vehicleFromUrl || selectedVehicle?.alias || "",
    distanciaRecorrida: "",
    fecha: getTodayDateString(),
    notasAdicionales: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Update form when selectedVehicle changes (from VehicleSwitcher)
  useEffect(() => {
    if (selectedVehicle && !vehicleFromUrl) {
      setFormData(prev => ({ ...prev, vehicleAlias: selectedVehicle.alias }));
    }
  }, [selectedVehicle, vehicleFromUrl]);

  // Auto-select first active vehicle if none selected
  useEffect(() => {
    if (!formData.vehicleAlias && vehicles.length > 0 && !vehicleFromUrl) {
      const activeVehicle = vehicles.find(v => v.isActive);
      if (activeVehicle) {
        setFormData(prev => ({ ...prev, vehicleAlias: activeVehicle.alias }));
      }
    }
  }, [vehicles, formData.vehicleAlias, vehicleFromUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          ...formData,
          distanciaRecorrida: Number(formData.distanciaRecorrida),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la ruta");
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehículo */}
              <div className="space-y-2">
                <Label htmlFor="vehicleAlias">Vehículo *</Label>
                <select
                  id="vehicleAlias"
                  name="vehicleAlias"
                  required
                  value={formData.vehicleAlias}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} ({vehicle.plates})
                    </option>
                  ))}
                </select>
              </div>

              {/* Distancia */}
              <div className="space-y-2">
                <Label htmlFor="distanciaRecorrida">Distancia recorrida (km) *</Label>
                <Input
                  id="distanciaRecorrida"
                  name="distanciaRecorrida"
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                  value={formData.distanciaRecorrida}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  name="fecha"
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notasAdicionales">Notas adicionales</Label>
                <Textarea
                  id="notasAdicionales"
                  name="notasAdicionales"
                  rows={4}
                  placeholder="Trabajo, viaje familiar, compras, etc."
                  value={formData.notasAdicionales}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.vehicleAlias || !formData.distanciaRecorrida}
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
