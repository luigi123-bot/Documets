import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_S3_BUCKET ?? process.env.SUPABASE_BUCKET ?? "documents";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados" },
        { status: 500 }
      );
    }

    // Crear cliente admin (usar solo en servidor)
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Intentamos listar el bucket (limit 1) para validar la clave
    const { data, error } = await supabaseAdmin.storage.from(bucket).list("", { limit: 1, offset: 0 });

    // Enmascarar la clave para la respuesta (no mostrar completa)
    const maskedKey =
      typeof supabaseKey === "string" && supabaseKey.length > 8
        ? `${supabaseKey.slice(0, 4)}...${supabaseKey.slice(-4)}`
        : supabaseKey;

    if (error) {
      const msg = error.message ?? String(error);
      // Si detectamos error de firma devolvemos mensaje claro y pasos
      const isSignature =
        /signature|invalid token|403/i.test(msg) ||
        (typeof error === "object" && error !== null && "status" in error && (error as { status?: number }).status === 403);
      return NextResponse.json(
        {
          ok: false,
          error: msg,
          signatureIssue: isSignature,
          hint:
            isSignature
              ? "Verifica SUPABASE_SERVICE_ROLE_KEY en .env.local (usar la Service Role Key, no la anon key) y que NEXT_PUBLIC_SUPABASE_URL sea correcto. Reinicia el servidor."
              : undefined,
          maskedKey,
          bucket,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, message: "Service role key válida. Acceso al bucket OK.", maskedKey, bucket, sample: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
