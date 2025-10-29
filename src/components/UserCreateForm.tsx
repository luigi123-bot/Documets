import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "empleado", label: "Empleado" },
];

export default function UserCreateForm() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    role: "empleado",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  interface ApiResponse {
    error?: string;
    [key: string]: unknown;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as ApiResponse;
      if (res.ok) {
        setMsg("Usuario creado correctamente.");
        setForm({
          email: "",
          username: "",
          password: "",
          full_name: "",
          role: "empleado",
        });
      } else {
        setMsg(data.error ?? "Error al crear usuario.");
      }
    } catch {
      setMsg("Error inesperado.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 mt-8 w-full"
    >
      <h2 className="text-2xl font-bold text-[#E53935] mb-2 text-center">Crear usuario</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña segura"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="role">Rol</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E53935] focus:border-[#E53935] outline-none"
            aria-label="Rol"
            title="Rol"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {msg && (
        <div
          className={`text-center text-sm ${
            msg.includes("correctamente") ? "text-green-600" : "text-red-500"
          }`}
        >
          {msg}
        </div>
      )}
      <Button
        type="submit"
        className="w-full bg-[#E53935] hover:bg-[#c62828] text-white font-semibold py-2 rounded-xl transition"
        disabled={loading}
      >
        {loading ? "Creando..." : "Crear usuario"}
      </Button>
    </form>
  );
}
