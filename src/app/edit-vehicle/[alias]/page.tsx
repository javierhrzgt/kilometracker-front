"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditVehicle() {
  const params = useParams();
  const alias = params.alias;
  const [formData, setFormData] = useState({
    marca: "",
    modelo: new Date().getFullYear(),
    plates: "",
    kilometrajeInicial: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
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

      router.push("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  if (loading) {
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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-light text-gray-900 truncate">Editar {alias}</h1>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alias (read-only) */}
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-2">
              Alias / Nombre
            </label>
            <input
              id="alias"
              type="text"
              value={alias}
              disabled
              className="w-full border border-gray-200 rounded p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">El alias no se puede modificar</p>
          </div>

          {/* Marca */}
          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
            <input
              id="marca"
              name="marca"
              type="text"
              required
              value={formData.marca}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 uppercase"
            />
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-2">
              Modelo (Año) *
            </label>
            <select
              id="modelo"
              name="modelo"
              required
              value={formData.modelo}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Placas */}
          <div>
            <label htmlFor="plates" className="block text-sm font-medium text-gray-700 mb-2">
              Placas *
            </label>
            <input
              id="plates"
              name="plates"
              type="text"
              required
              value={formData.plates}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 uppercase"
            />
          </div>

          {/* Kilometraje Inicial */}
          <div>
            <label htmlFor="kilometrajeInicial" className="block text-sm font-medium text-gray-700 mb-2">
              Kilometraje inicial *
            </label>
            <input
              id="kilometrajeInicial"
              name="kilometrajeInicial"
              type="number"
              required
              min="0"
              value={formData.kilometrajeInicial}
              onChange={handleChange}
              disabled={saving}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 py-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={saving}
              className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Vehículo activo
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Actualizar vehículo"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}