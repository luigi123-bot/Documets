import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { UserPlus, Mail, Lock, UserCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserCreateForm({ onClose }: { onClose?: () => void }) {
  const [form, setForm] = useState({
    email: "",
    nombre: "",
    apellidos: "",
    role: "empleado",
    sendCredentials: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleRoleChange = (role: string) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setGeneratedPassword(null);

    // Validación de campos requeridos
    if (!form.email.trim() || !form.nombre.trim() || !form.apellidos.trim() || !form.role.trim()) {
      setMsg("Por favor, completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    try {
      // Enviar datos al endpoint backend
      const full_name = `${form.nombre} ${form.apellidos}`.trim();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          full_name,
          role: form.role,
          sendCredentials: form.sendCredentials,
        }),
      });
      const data = (await res.json()) as { error?: string; password?: string };
      if (res.ok) {
        setMsg("Usuario creado correctamente en Clerk.");
        setGeneratedPassword(data.password ?? null);
        setForm({
          email: "",
          nombre: "",
          apellidos: "",
          role: "empleado",
          sendCredentials: true,
        });
      } else {
        if (data.error === "Faltan datos requeridos") {
          setMsg("Faltan datos requeridos. Por favor, revisa el formulario.");
        } else if (data.error?.toLowerCase().includes("email address is taken")) {
          setMsg("Ese correo ya está en uso. Por favor, prueba con otro.");
        } else {
          setMsg(data.error ?? "Error al crear usuario en Clerk.");
        }
      }
    } catch {
      setMsg("Error inesperado.");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay blanco semitransparente con blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/70 backdrop-blur-sm"
        />
        {/* Modal centrado con animación */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
        >
          {/* Encabezado atractivo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <UserPlus className="text-[#E53935] w-8 h-8" />
              <span className="text-2xl font-bold text-gray-800">Crear Nuevo Usuario</span>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-[#E53935] text-2xl font-bold transition"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCog className="text-gray-400 w-5 h-5" />
              <span className="font-semibold text-gray-700">Información Personal</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-gray-700 font-semibold">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  required
                  className="mt-1 rounded-xl focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <Label htmlFor="apellidos" className="text-gray-700 font-semibold">Apellidos *</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: Pérez García"
                  required
                  className="mt-1 rounded-xl focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Correo Electrónico *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="usuario@empresa.com"
                  required
                  className="mt-1 rounded-xl focus:ring-2 focus:ring-red-400 flex-1"
                />
                <Mail className="text-[#E53935] w-5 h-5" />
              </div>
            </div>
          </div>
          {/* Rol y Permisos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="text-gray-400 w-5 h-5" />
              <span className="font-semibold text-gray-700">Rol y Permisos</span>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition hover:scale-105
                  ${form.role === "empleado"
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
                    : "bg-gray-100 text-gray-500"}
                `}
                onClick={() => handleRoleChange("empleado")}
              >
                <UserCog className="w-4 h-4" />
                Empleado
              </button>
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition hover:scale-105
                  ${form.role === "admin"
                    ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                    : "bg-gray-100 text-gray-500"}
                `}
                onClick={() => handleRoleChange("admin")}
              >
                <Lock className="w-4 h-4" />
                Admin
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {form.role === "empleado"
                ? "Ver, subir y editar documentos"
                : "Acceso completo al sistema"}
            </div>
          </div>
          {/* Credenciales de Acceso */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="text-gray-400 w-5 h-5" />
              <span className="font-semibold text-gray-700">Credenciales de Acceso</span>
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                name="sendCredentials"
                checked={form.sendCredentials}
                onChange={handleChange}
                className="accent-[#E53935] rounded"
              />
              <span className="text-gray-700">Enviar credenciales de acceso por correo electrónico</span>
            </label>
            <div className="text-xs text-gray-500">
              Se generará una contraseña temporal y se enviará junto con las instrucciones de acceso
            </div>
          </div>
          {/* Mensaje de error o éxito */}
          {msg && (
            <div
              className={`text-center text-sm ${
                msg.includes("correctamente") ? "text-green-600" : "text-red-500"
              }`}
            >
              {msg}
            </div>
          )}
          {/* Mostrar contraseña generada */}
          {generatedPassword && (
            <div className="text-center text-base font-semibold text-gray-700 bg-gray-100 rounded-xl py-2 mt-2">
              <span>Contraseña temporal para el empleado:</span>
              <div className="font-mono text-lg text-[#E53935] mt-1">{generatedPassword}</div>
            </div>
          )}
          {/* Botón de envío */}
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              className="w-full bg-[#E53935] hover:bg-[#c62828] text-white font-semibold py-2 rounded-xl transition hover:scale-105"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear usuario"}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
