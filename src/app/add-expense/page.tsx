"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddExpenseFormData, Vehicle } from "@/Types";
import { getTodayDateString } from "@/lib/dateUtils";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles?isActive=true", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar vehículos");
      }

      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingVehicles(false);
    }
  };

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

      router.push("/expenses-history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (loadingVehicles) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              ← Volver
            </button>
            <h1 className="text-xl sm:text-2xl font-light text-gray-900">
              Agregar Gasto
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400 mb-4">
              No hay vehículos activos registrados
            </p>
            <button
              onClick={() => router.push("/add-vehicle")}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
            >
              Agregar Vehículo
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <label
                  htmlFor="vehicleAlias"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Vehículo *
                </label>
                <select
                  id="vehicleAlias"
                  name="vehicleAlias"
                  value={formData.vehicleAlias}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">Seleccionar vehículo</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.alias}>
                      {vehicle.alias} - {vehicle.marca} {vehicle.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoria"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Categoría *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">Seleccionar categoría</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="monto"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Monto *
                </label>
                <input
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
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="fecha"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fecha *
                </label>
                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={3}
                  placeholder="Detalles del gasto..."
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Tax Deductible Checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="esDeducibleImpuestos"
                    checked={formData.esDeducibleImpuestos}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    Deducible de impuestos
                  </span>
                </label>
              </div>

              {/* Recurring Checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="esRecurrente"
                    checked={formData.esRecurrente}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">
                    Gasto recurrente
                  </span>
                </label>
              </div>

              {/* Recurring Options */}
              {formData.esRecurrente && (
                <div className="pl-6 border-l-2 border-gray-200 space-y-4">
                  <div>
                    <label
                      htmlFor="frecuenciaRecurrencia"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Frecuencia *
                    </label>
                    <select
                      id="frecuenciaRecurrencia"
                      name="frecuenciaRecurrencia"
                      value={formData.frecuenciaRecurrencia}
                      onChange={handleChange}
                      required={formData.esRecurrente}
                      disabled={loading}
                      className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    >
                      {RECURRING_FREQUENCIES.slice(1).map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="proximoPago"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Próxima fecha de pago *
                    </label>
                    <input
                      id="proximoPago"
                      name="proximoPago"
                      type="date"
                      value={formData.proximoPago}
                      onChange={handleChange}
                      required={formData.esRecurrente}
                      disabled={loading}
                      className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
