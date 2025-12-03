"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddExpenseFormData, Vehicle } from "@/Types";
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

export default function AddExpense() {
  const { vehicles } = useVehicle();
  const [formData, setFormData] = useState<AddExpenseFormData>({
    vehicleAlias: "",
    categoria: "",
    monto: "",
    descripcion: "",
    fecha: getTodayDateString(),
    esRecurrente: false,
    frecuenciaRecurrencia: "",
    proximoPago: "",
    esDeducibleImpuestos: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Reset recurring fields if esRecurrente is unchecked
    if (name === "esRecurrente" && !checked) {
      setFormData((prev) => ({
        ...prev,
        frecuenciaRecurrencia: "",
        proximoPago: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Prepare payload
      const payload: any = {
        vehicleAlias: formData.vehicleAlias,
        categoria: formData.categoria,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        esRecurrente: formData.esRecurrente,
        esDeducibleImpuestos: formData.esDeducibleImpuestos,
      };

      // Add recurring fields if applicable
      if (formData.esRecurrente) {
        payload.frecuenciaRecurrencia = formData.frecuenciaRecurrencia;
        payload.proximoPago = formData.proximoPago;
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el gasto");
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
                  {vehicles.filter(v => v.isActive).map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} {vehicle.modelo}
                    </option>
                  ))}
                </SelectNative>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <SelectNative
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccionar categoría</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </SelectNative>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (Q) *</Label>
                <Input
                  id="monto"
                  name="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
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
                  placeholder="Detalles del gasto..."
                />
              </div>

              {/* Tax Deductible Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="esDeducibleImpuestos"
                  checked={formData.esDeducibleImpuestos}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, esDeducibleImpuestos: checked as boolean }))
                  }
                  disabled={loading}
                />
                <Label htmlFor="esDeducibleImpuestos" className="cursor-pointer font-normal">
                  Deducible de impuestos
                </Label>
              </div>

              {/* Recurring Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="esRecurrente"
                  checked={formData.esRecurrente}
                  onCheckedChange={(checked) => {
                    const isChecked = checked as boolean;
                    setFormData(prev => ({
                      ...prev,
                      esRecurrente: isChecked,
                      ...(isChecked ? {} : { frecuenciaRecurrencia: "", proximoPago: "" })
                    }));
                  }}
                  disabled={loading}
                />
                <Label htmlFor="esRecurrente" className="cursor-pointer font-normal">
                  Gasto recurrente
                </Label>
              </div>

              {/* Recurring Options */}
              {formData.esRecurrente && (
                <div className="pl-6 border-l-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="frecuenciaRecurrencia">Frecuencia *</Label>
                    <SelectNative
                      id="frecuenciaRecurrencia"
                      name="frecuenciaRecurrencia"
                      value={formData.frecuenciaRecurrencia}
                      onChange={handleChange}
                      required={formData.esRecurrente}
                      disabled={loading}
                    >
                      {RECURRING_FREQUENCIES.slice(1).map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </SelectNative>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximoPago">Próxima fecha de pago *</Label>
                    <Input
                      id="proximoPago"
                      name="proximoPago"
                      type="date"
                      value={formData.proximoPago}
                      onChange={handleChange}
                      required={formData.esRecurrente}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
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
