"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar perfil");
      }

      const data = await response.json();
      const userData = data.data;
      
      setUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/auth/updateprofile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      setSuccess(true);
      fetchProfile();

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-xl sm:text-2xl font-light text-gray-900">Mi perfil</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
            Perfil actualizado exitosamente
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Account Info */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 bg-white">
          <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
            Información de la cuenta
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Rol</p>
              <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Estado</p>
              <p className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user?.isActive ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Cuenta creada</p>
              <p className="text-gray-900">{new Date(user?.createdAt).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Última actualización</p>
              <p className="text-gray-900">{new Date(user?.updatedAt).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
          <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-900">
            Editar perfil
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                disabled={saving}
                className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={saving}
                className="w-full border border-gray-300 rounded p-3 text-gray-900 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}