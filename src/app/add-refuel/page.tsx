"use client";

import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Vehicle {
  _id: string;
  alias: string;
  marca: string;
  plates: string;
  isActive: boolean;
}

interface FormData {
  vehicleAlias: string;
  tipoCombustible: string;
  cantidadGastada: string;
  galones: string;
  fecha: string;
  notasAdicionales: string;
}

function AddRefuelForm({ vehicleFromUrl }: { vehicleFromUrl: string | null }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<FormData>({
    vehicleAlias: vehicleFromUrl || "",
    tipoCombustible: "Regular",
    cantidadGastada: "",
    galones: "",
    fecha: new Date().toISOString().split("T")[0],
    notasAdicionales: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const tiposCombustible = ["Regular", "Super", "V-Power", "Diesel"];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", {
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

      // Solo seleccionar automáticamente si no hay vehículo pre-seleccionado desde URL
      if (!vehicleFromUrl) {
        const activeVehicle = data.data?.find((v: Vehicle) => v.isActive);
        if (activeVehicle) {
          setFormData(prev => ({ ...prev, vehicleAlias: activeVehicle.alias }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

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
            <h1 className="text-xl sm:text-2xl font-light text-gray-900">Agregar recarga</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
            Reabastecimiento registrado exitosamente
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehículo */}
          <div>
            <label htmlFor="vehicleAlias" className="block text-sm font-medium text-gray-700 mb-2">
              Vehículo *
            </label>
            <select
              id="vehicleAlias"
              name="vehicleAlias"
              required
              value={formData.vehicleAlias}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            >
              <option value="">Selecciona un vehículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.alias}>
                  {vehicle.alias} - {vehicle.marca} ({vehicle.plates})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Combustible */}
          <div>
            <label htmlFor="tipoCombustible" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de combustible *
            </label>
            <select
              id="tipoCombustible"
              name="tipoCombustible"
              required
              value={formData.tipoCombustible}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            >
              {tiposCombustible.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad Gastada */}
          <div>
            <label htmlFor="cantidadGastada" className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad gastada (Q) *
            </label>
            <input
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
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Galones */}
          <div>
            <label htmlFor="galones" className="block text-sm font-medium text-gray-700 mb-2">
              Galones
            </label>
            <input
              id="galones"
              name="galones"
              type="number"
              min="0"
              step="0.01"
              placeholder="1.5"
              value={formData.galones}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
            {formData.galones && formData.cantidadGastada && (
              <p className="text-xs text-gray-600 mt-1">
                Precio por galón: Q {calculatePrecioGalon()}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              required
              value={formData.fecha}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notasAdicionales" className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              id="notasAdicionales"
              name="notasAdicionales"
              rows={3}
              placeholder="Gasolinera, odómetro, etc."
              value={formData.notasAdicionales}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.vehicleAlias || !formData.cantidadGastada}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Registrar recarga"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function AddRefuelContent() {
  const searchParams = useSearchParams();
  const vehicleFromUrl = searchParams.get('vehicle');

  return <AddRefuelForm vehicleFromUrl={vehicleFromUrl} />;
}

export default function AddRefuel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    }>
      <AddRefuelContent />
    </Suspense>
  );
}
