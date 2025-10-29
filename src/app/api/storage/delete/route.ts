import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { key?: string; bucket?: string };
    const fileKey = typeof body.key === "string" ? body.key : undefined;
    const bucket = body.bucket ?? process.env.SUPABASE_S3_BUCKET ?? "documents";

    if (!fileKey) {
      return NextResponse.json({ error: "Falta key del archivo" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase no configurado (SERVICE_ROLE_KEY falta)." }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabaseAdmin.storage.from(bucket).remove([fileKey]);

    if (error) {
      console.error("Storage delete error:", error);
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, key: fileKey }, { status: 200 });
  } catch (err) {
    console.error("Error /api/storage/delete:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
