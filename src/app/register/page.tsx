"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "read",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
          role: "write",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }

      // Redirigir al login
      router.push("/?registered=true");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-950 text-gray-100">
      <div className="w-96 grid gap-y-4 border p-12 rounded-xl bg-gray-900 border-gray-700">
        <h1 className="text-2xl text-center mb-4">Crear Cuenta</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="username" className="block text-sm mb-2">Nombre de usuario</label>
          <input
            id="username"
            name="username"
            required
            className="w-full border rounded-md p-2 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none"
            type="text"
            placeholder="usuario123"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm mb-2">Email</label>
          <input
            id="email"
            name="email"
            required
            className="w-full border rounded-md p-2 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm mb-2">Contraseña</label>
          <input
            id="password"
            name="password"
            required
            className="w-full border rounded-md p-2 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none"
            autoComplete="new-password"
            type="password"
            placeholder="******"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm mb-2">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            required
            className="w-full border rounded-md p-2 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none"
            autoComplete="new-password"
            type="password"
            placeholder="******"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
        </div>        
        <button 
          className="mt-4 border rounded-2xl bg-blue-800 hover:bg-blue-700 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <div className="text-center text-sm text-gray-400 mt-2">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => router.push("/")}
            className="text-blue-400 hover:text-blue-300"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}