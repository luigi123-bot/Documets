import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "~/lib/supabaseClient";

type SyncUserBody = {
  clerkId: string;
  email: string;
  full_name?: string;
  role?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as SyncUserBody;
    // Type guard to ensure body matches SyncUserBody
    if (typeof body !== "object" || !body || typeof body.clerkId !== "string" || typeof body.email !== "string") {
      return NextResponse.json({ error: "Datos de usuario inválidos" }, { status: 400 });
    }
    const { clerkId, email, full_name, role } = body;

    if (!clerkId || !email) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Upsert usuario en Supabase
    const { error } = await supabase
      .from("users")
      .upsert(
        [{
          clerk_id: clerkId,
          email,
          full_name,
          role: role ?? "empleado",
        }],
        { onConflict: "clerk_id" }
      );

    if (error) {
      console.error("Error al sincronizar usuario:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado";
    console.error("Error inesperado:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
