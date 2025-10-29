import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadObject } from "../../../lib/s3Client";

/*
  POST body (JSON):
  {
    "fileName": "invoices/2023/invoice.pdf",
    "fileBase64": "<base64 string>",
    "contentType": "application/pdf",
    "bucket": "optional-bucket-name"
  }
*/

export async function POST(req: NextRequest) {
  try {
    interface UploadBody {
      fileName?: string;
      fileBase64?: string;
      contentType?: string;
      bucket?: string;
    }
    const rawBody = (await req.json()) as UploadBody;
    const body: UploadBody = {
      fileName: typeof rawBody.fileName === "string" ? rawBody.fileName : undefined,
      fileBase64: typeof rawBody.fileBase64 === "string" ? rawBody.fileBase64 : undefined,
      contentType: typeof rawBody.contentType === "string" ? rawBody.contentType : undefined,
      bucket: typeof rawBody.bucket === "string" ? rawBody.bucket : undefined,
    };
    const { fileName, fileBase64, contentType, bucket } = body;

    if (!fileName || !fileBase64) {
      return NextResponse.json({ error: "Faltan datos: fileName o fileBase64" }, { status: 400 });
    }

    const bucketName =
      bucket ??
      process.env.SUPABASE_S3_BUCKET ??
      process.env.SUPABASE_S3_BUCKET?.toString() ??
      undefined;

    if (!bucketName) {
      return NextResponse.json({ error: "Bucket no configurado en variables de entorno" }, { status: 500 });
    }

    // Convertir base64 a Buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Logs iniciales
    console.log("Incoming upload request:", {
      fileName,
      contentType,
      bucket: bucketName,
      sizeBytes: buffer.length,
    });

    // Intentar usar S3-compatible si está configurado
    const s3Endpoint = process.env.SUPABASE_S3_ENDPOINT ?? process.env.S3_ENDPOINT;
    const s3AccessKey = process.env.SUPABASE_S3_ACCESS_KEY_ID ?? process.env.SUPABASE_S3_ACCESS_KEY_ID;
    const s3Secret = process.env.SUPABASE_S3_SECRET_ACCESS_KEY ?? process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

    if (s3Endpoint && s3AccessKey && s3Secret) {
      console.log("Uploading via S3-compatible endpoint:", s3Endpoint);
      try {
        const s3Res: unknown = await uploadObject(bucketName, fileName, buffer, contentType);
        if (typeof s3Res === "object" && s3Res !== null && "$metadata" in s3Res) {
          console.log("S3 upload success metadata:", s3Res.$metadata);
        } else {
          console.log("S3 upload success metadata:", s3Res);
        }
      } catch (s3Err) {
        console.error("S3 upload error:", s3Err);
        const msg = s3Err instanceof Error ? s3Err.message : String(s3Err);
        return NextResponse.json({ error: `S3 upload failed: ${msg}` }, { status: 500 });
      }
    } else {
      // Fallback: usar cliente Supabase (service role)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: "Supabase URL o SUPABASE_SERVICE_ROLE_KEY no configurados" }, { status: 500 });
      }
      console.log("Uploading via Supabase Storage API:", supabaseUrl);
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      try {
        const { error } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: contentType ?? undefined,
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          const msg = error.message ?? String(error);
          if (/signature/i.test(msg) || /invalid token/i.test(msg)) {
            return NextResponse.json({
              error:
                "Signature verification failed: verifica que SUPABASE_SERVICE_ROLE_KEY en .env.local sea la correcta y que corresponda al URL de Supabase.",
            }, { status: 500 });
          }
          return NextResponse.json({ error: msg }, { status: 500 });
        }
        console.log("Supabase upload success:", { bucket: bucketName, file: fileName });
      } catch (uploadErr) {
        console.error("Excepción al subir a Supabase:", uploadErr);
        const uploadMsg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
        if (/signature/i.test(uploadMsg) || /invalid token/i.test(uploadMsg)) {
          return NextResponse.json({
            error:
              "Signature verification failed: verifica que SUPABASE_SERVICE_ROLE_KEY en .env.local sea la correcta y que corresponda al URL de Supabase.",
          }, { status: 500 });
        }
        return NextResponse.json({ error: uploadMsg }, { status: 500 });
      }
    }

    // Construir URL pública esperada para Supabase Storage (objeto público)
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
    const publicUrl =
      baseUrl && bucketName
        ? `${baseUrl}/storage/v1/object/public/${bucketName}/${encodeURIComponent(fileName)}`
        : null;

    console.log("Upload finished, publicUrl:", publicUrl);
    return NextResponse.json({ success: true, key: fileName, publicUrl }, { status: 201 });
  } catch (err) {
    console.error("Error /api/upload:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}