"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddVehicle() {
  const [formData, setFormData] = useState({
    alias: "",
    marca: "",
    modelo: new Date().getFullYear(),
    plates: "",
    kilometrajeInicial: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

      router.push("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
            <h1 className="text-xl sm:text-2xl font-light text-gray-900">Agregar vehículo</h1>
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
          {/* Alias */}
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-2">
              Alias / Nombre *
            </label>
            <input
              id="alias"
              name="alias"
              type="text"
              required
              placeholder="ABC1234"
              value={formData.alias}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Identificador único para el vehículo</p>
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
              placeholder="ABC"
              value={formData.marca}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 uppercase"
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
              disabled={loading}
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
              placeholder="M000ABC"
              value={formData.plates}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50 uppercase"
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
              placeholder="1000"
              value={formData.kilometrajeInicial}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Kilometraje actual del vehículo al momento de registrarlo</p>
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
              disabled={loading || !formData.alias || !formData.marca || !formData.plates || !formData.kilometrajeInicial}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Registrar vehículo"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}