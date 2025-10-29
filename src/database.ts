interface ClerkUserOptions {
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  sendCredentials?: boolean;
}

interface ClerkUserPayload {
  email_address?: string[];
  first_name?: string;
  last_name?: string;
  public_metadata?: { role?: string };
}

interface ClerkUserResponse {
  id?: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  public_metadata?: { role?: string };
  // otros campos según la respuesta de Clerk
  errors?: Array<{ message?: string }>;
}

export async function createUserFromClerk(
  clerkUserId?: string,
  options?: ClerkUserOptions
): Promise<{ user?: ClerkUserResponse; password?: string; error?: string }> {
  try {
    const payload: ClerkUserPayload & { username?: string; password?: string } = {};
    if (options?.email) payload.email_address = [options.email];
    // Si tienes full_name, divídelo en first_name y last_name
    if (options?.full_name) {
      const [first_name, ...rest] = options.full_name.split(" ");
      payload.first_name = first_name;
      payload.last_name = rest.join(" ") || undefined;
    }
    if (options?.first_name) payload.first_name = options.first_name;
    if (options?.last_name) payload.last_name = options.last_name;
    if (options?.role) payload.public_metadata = { role: options.role };

    // Clerk requiere username y password
    if (options?.email) {
      // Genera un username válido (solo letras, números, guión y guión bajo)
      payload.username = options.email.replace(/[^a-zA-Z0-9-_]/g, "_");
    }
    // Genera una contraseña temporal segura
    const generatedPassword = Math.random().toString(36).slice(-10) + "A1!";
    payload.password = generatedPassword;

    // Log para depuración
    console.log("Payload enviado a Clerk:", payload);

    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const clerkJson = (await clerkRes.json()) as ClerkUserResponse;

    // Log de la respuesta de Clerk
    console.log("Respuesta Clerk:", clerkJson);

    if (!clerkRes.ok) {
      const errorMsg = clerkJson.errors?.[0]?.message ?? "Error al crear usuario en Clerk";
      return { error: errorMsg };
    }

    // Devuelve también la contraseña generada
    return { user: clerkJson, password: generatedPassword };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error en createUserFromClerk:", errorMessage);
    return { error: errorMessage };
  }
}
