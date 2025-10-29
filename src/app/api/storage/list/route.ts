import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(_req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_S3_BUCKET ?? "documents";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase no configurado (SERVICE_ROLE_KEY falta)." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabaseAdmin.storage.from(bucket).list("", {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      console.error("Storage list error:", error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }

    // Mapear estructura mínima para el frontend
    const files = (data ?? []).map((f) => ({
      name: f.name,
      created_at: f.created_at ?? null,
      updated_at: f.updated_at ?? null,
      metadata: f.metadata ?? null,
      publicUrl: `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeURIComponent(f.name)}`,
    }));

    return NextResponse.json({ ok: true, files }, { status: 200 });
  } catch (err) {
    console.error("Error /api/storage/list:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
