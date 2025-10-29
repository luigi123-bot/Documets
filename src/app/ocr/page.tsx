"use client";
import React, { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FileText, Loader2, Image as ImageIcon } from "lucide-react";

export default function OcrPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    setOcrText("");
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Selecciona una imagen para procesar.");
      return;
    }
    setLoading(true);
    setError(null);
    setOcrText("");
    try {
      // Subir la imagen a un endpoint temporal (puedes usar Supabase Storage, S3, etc.)
      // Para demo, usa FileReader para obtener base64 y llama a la API con un endpoint público.
      // Aquí asumimos que la imagen ya está en un endpoint público accesible por la API OCR.
      // Si necesitas subir la imagen primero, adapta la lógica.
      // Para demo, usa el previewUrl como imageUrl (debe ser accesible por el backend).
      const formData = new FormData();
      formData.append("file", file);

      // Si tienes un endpoint para subir la imagen y obtener la URL pública, úsalo aquí.
      // Por ahora, solo usa el previewUrl (no funcionará si la imagen no es pública).
      const res = await fetch("/api/ocr/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: previewUrl }),
      });
      const data = (await res.json()) as { error?: string; text?: string };
      if (!res.ok) {
        setError(data.error ?? "Error al procesar la imagen.");
      } else {
        setOcrText(data.text ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-[#E53935]" />
          <h1 className="text-2xl font-bold text-[#E53935]">OCR con Gemini API</h1>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Selecciona una imagen</label>
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="rounded-xl"
            />
          </div>
          {previewUrl && (
            <div className="rounded-lg border p-3 bg-gray-50 flex flex-col items-center">
              <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Vista previa" className="max-h-64 w-auto object-contain rounded" />
            </div>
          )}
          <Button
            onClick={handleProcess}
            disabled={loading || !file}
            className="w-full bg-[#E53935] hover:bg-[#c62828] text-white font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
            {loading ? "Procesando..." : "Extraer texto"}
          </Button>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</div>
          )}
        </div>
        {ocrText && (
          <div className="mt-6 bg-gray-100 rounded-xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#E53935] mb-2">Texto extraído</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 break-words">{ocrText}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
