import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { supabase } from "~/lib/supabaseClient";

// Configuración de la conexión (ajusta según tu entorno)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Debes definir esta variable en .env
});

type UserRequestBody = {
  email: string;
  username?: string;
  password: string;
  full_name?: string;
  role?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, full_name, role } = await req.json() as UserRequestBody;

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    // Hashear la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos SQL
    interface NewUser {
      id: number;
      email: string;
      username: string | null;
      full_name: string | null;
      role: string;
      created_at: string;
    }

    const result = await pool.query<NewUser>(
      `INSERT INTO users (email, username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, full_name, role, created_at`,
      [email, username, password_hash, full_name, role ?? "empleado"]
    );

    const newUser = result.rows[0];

    if (!newUser) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
    }

    // Sincronizar con Supabase
    const { error: syncError } = await supabase
      .from("users")
      .upsert(
        [{
          clerk_id: newUser.id?.toString() ?? "", // Usa el id generado como clerk_id si no tienes uno real
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
        }],
        { onConflict: "clerk_id" }
      );

    if (syncError) {
      console.error("Error al sincronizar usuario con Supabase:", syncError.message);
      // No retornes error, solo loguea
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
