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
  tipoCombustible: string;
  cantidadGastada: string;
  galones: string;
  fecha: string;
  notasAdicionales: string;
}

function AddRefuelForm() {
  const { vehicles, selectedVehicle } = useVehicle();
  const searchParams = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle');

  const [formData, setFormData] = useState<FormData>({
    vehicleAlias: vehicleFromUrl || selectedVehicle?.alias || "",
    tipoCombustible: "Regular",
    cantidadGastada: "",
    galones: "",
    fecha: getTodayDateString(),
    notasAdicionales: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const tiposCombustible = ["Regular", "Premium", "Diesel", "Eléctrico", "Híbrido", "V-Power"];

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

  const calculatePrecioGalon = (): string => {
    const monto = parseFloat(formData.cantidadGastada) || 0;
    const galones = parseFloat(formData.galones) || 0;
    if (galones > 0) {
      return (monto / galones).toFixed(2);
    }
    return "0.00";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/refuels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          cantidadGastada: Number(formData.cantidadGastada),
          galones: Number(formData.galones),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el reabastecimiento");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/refuels-history");
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
        title="Agregar recarga"
        description="Registra un nuevo reabastecimiento de combustible"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Reabastecimiento registrado exitosamente
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

              {/* Tipo de Combustible */}
              <div className="space-y-2">
                <Label htmlFor="tipoCombustible">Tipo de combustible *</Label>
                <select
                  id="tipoCombustible"
                  name="tipoCombustible"
                  required
                  value={formData.tipoCombustible}
                  onChange={handleChange}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {tiposCombustible.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad Gastada */}
              <div className="space-y-2">
                <Label htmlFor="cantidadGastada">Cantidad gastada (Q) *</Label>
                <Input
                  id="cantidadGastada"
                  name="cantidadGastada"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  value={formData.cantidadGastada}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Galones */}
              <div className="space-y-2">
                <Label htmlFor="galones">Galones</Label>
                <Input
                  id="galones"
                  name="galones"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1.5"
                  value={formData.galones}
                  onChange={handleChange}
                  disabled={loading}
                />
                {formData.galones && formData.cantidadGastada && (
                  <p className="text-xs text-muted-foreground">
                    Precio por galón: Q {calculatePrecioGalon()}
                  </p>
                )}
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
                  placeholder="Gasolinera, odómetro, etc."
                  value={formData.notasAdicionales}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.vehicleAlias || !formData.cantidadGastada}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Guardando..." : "Registrar recarga"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function AddRefuel() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    }>
      <AddRefuelForm />
    </Suspense>
  );
}
