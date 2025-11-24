"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "write", // Rol por defecto
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "write", // Siempre write por defecto
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }

      router.push("/?registered=true");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-500">Regístrate para comenzar</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
              {error}
            </div>
          )}
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              required
              type="text"
              placeholder="usuario123"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
          
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              required
              autoComplete="new-password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              required
              autoComplete="new-password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded p-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-gray-900 hover:text-gray-700 font-medium"
            >
              Inicia sesión
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Sistema de gestión de vehículos
          </p>
        </div>
      </div>
    </div>
  );
}