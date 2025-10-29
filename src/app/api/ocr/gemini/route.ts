import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type OcrRequestBody = {
  imageUrl?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OcrRequestBody;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : undefined;

    if (!imageUrl) {
      return NextResponse.json({ error: "Falta imageUrl en el body" }, { status: 400 });
    }

    // API key de OCR.space (NO comitear en público)
    const apiKey = "K88777966688957";
    const ocrUrl = "https://api.ocr.space/parse/imageurl";

    // Construye la query string
    const params = new URLSearchParams({
      apikey: apiKey,
      url: imageUrl,
      language: "spa",
      isOverlayRequired: "false",
    }).toString();

    const fullUrl = `${ocrUrl}?${params}`;

    const resp = await fetch(fullUrl, {
      method: "GET",
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: "Error de OCR API", detail: txt }, { status: 502 });
    }

    type OcrApiResponse = {
      ParsedResults?: Array<{
        ParsedText?: string;
      }>;
      [key: string]: unknown;
    };
    const json = (await resp.json()) as OcrApiResponse;

    // Extraer texto del resultado
    let extracted = "";
    if (json && Array.isArray(json.ParsedResults) && json.ParsedResults[0]?.ParsedText) {
      extracted = json.ParsedResults[0].ParsedText;
    }

    return NextResponse.json({ ok: true, text: extracted }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
