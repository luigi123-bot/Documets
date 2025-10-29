import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Iniciando sesión con:", { username, password });

      // Llamada a la API para buscar el usuario por username/email
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log("Respuesta de la API:", res);

      type LoginResponse = {
        user?: {
          id: string;
          username: string;
          email: string;
          // agrega más campos según tu API
        };
        error?: string;
      };

      if (!res.ok) {
        const data = await res.json() as LoginResponse;
        console.error("Error en login:", data.error);
        setError(data.error ?? "Error desconocido");
        setLoading(false);
        return;
      }

      const data = await res.json() as unknown as LoginResponse;
      console.log("Usuario autenticado:", data.user);

      // Aquí puedes guardar el usuario en el estado global/context o redirigir
      // Por ejemplo: window.location.href = "/dashboard";
      setLoading(false);
      alert("¡Login exitoso!");
    } catch (err: unknown) {
      console.error("Error inesperado:", err);
      setError((err as { message?: string })?.message ?? "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-10">
      <div>
        <Label htmlFor="username">Usuario o Email:</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Ingrese su usuario o email"
        />
      </div>
      <div>
        <Label htmlFor="password">Contraseña:</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};

export default Login;
