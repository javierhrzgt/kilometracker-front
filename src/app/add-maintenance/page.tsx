"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddMaintenanceFormData, Vehicle } from "@/Types";

const MAINTENANCE_TYPES = [
  { value: "Cambio de aceite", label: "Cambio de aceite" },
  { value: "Rotación de llantas", label: "Rotación de llantas" },
  { value: "Frenos", label: "Frenos" },
  { value: "Inspección", label: "Inspección" },
  { value: "Reparación", label: "Reparación" },
  { value: "Batería", label: "Batería" },
  { value: "Filtros", label: "Filtros" },
  { value: "Transmisión", label: "Transmisión" },
  { value: "Suspensión", label: "Suspensión" },
  { value: "Alineación", label: "Alineación" },
  { value: "Otro", label: "Otro" },
];

export default function AddMaintenance() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<AddMaintenanceFormData>({
    vehicleAlias: "",
    tipo: "",
    descripcion: "",
    costo: "",
    fecha: new Date().toISOString().split("T")[0],
    kilometraje: "",
    proveedor: "",
    proximoServicioFecha: "",
    proximoServicioKm: "",
    notas: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prepare payload
      const payload: any = {
        vehicleAlias: formData.vehicleAlias,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        costo: parseFloat(formData.costo),
        fecha: formData.fecha,
        kilometraje: parseFloat(formData.kilometraje),
      };

      // Add optional fields
      if (formData.proveedor) {
        payload.proveedor = formData.proveedor;
      }
      if (formData.proximoServicioFecha) {
        payload.proximoServicioFecha = formData.proximoServicioFecha;
      }
      if (formData.proximoServicioKm) {
        payload.proximoServicioKm = parseFloat(formData.proximoServicioKm);
      }
      if (formData.notas) {
        payload.notas = formData.notas;
      }

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el mantenimiento");
      }

      router.push("/maintenance-history");
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
              Agregar Mantenimiento
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

              {/* Maintenance Type */}
              <div>
                <label
                  htmlFor="tipo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tipo de mantenimiento *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="">Seleccionar tipo</option>
                  {MAINTENANCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Detalles del mantenimiento..."
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Cost */}
              <div>
                <label
                  htmlFor="costo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Costo *
                </label>
                <input
                  id="costo"
                  name="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Date and Kilometraje in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label
                    htmlFor="kilometraje"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Kilometraje *
                  </label>
                  <input
                    id="kilometraje"
                    name="kilometraje"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.kilometraje}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="15000"
                    className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Provider */}
              <div>
                <label
                  htmlFor="proveedor"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Proveedor / Taller
                </label>
                <input
                  id="proveedor"
                  name="proveedor"
                  type="text"
                  value={formData.proveedor}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Nombre del taller o proveedor"
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Next Service Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">
                  Próximo Servicio (Opcional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="proximoServicioFecha"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Fecha del próximo servicio
                    </label>
                    <input
                      id="proximoServicioFecha"
                      name="proximoServicioFecha"
                      type="date"
                      value={formData.proximoServicioFecha}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="proximoServicioKm"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Kilometraje próximo servicio
                    </label>
                    <input
                      id="proximoServicioKm"
                      name="proximoServicioKm"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.proximoServicioKm}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="20000"
                      className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notas"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notas adicionales
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  placeholder="Información adicional..."
                  className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar Mantenimiento"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
