import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createUserFromClerk } from "~/database";

type ClerkUserRequestBody = {
  email: string;
  full_name: string;
  role: string;
  sendCredentials?: boolean;
};


export async function POST(req: NextRequest) {
  try {
    const { email, full_name, role } = (await req.json()) as ClerkUserRequestBody;

    // Log para depuración
    console.log("Datos recibidos:", { email, full_name, role });

    // Validación robusta
    if (
      typeof email !== "string" || !email.trim() ||
      typeof full_name !== "string" || !full_name.trim() ||
      typeof role !== "string" || !role.trim()
    ) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const result = await createUserFromClerk(undefined, {
      email,
      full_name,
      role,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Devuelve también la contraseña generada
    return NextResponse.json({ user: result.user, password: result.password }, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
