"use client";
import React, { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { FileText, Loader2, Image as ImageIcon } from "lucide-react";

interface OcrViewerProps {
  initialUrl?: string;
  onClose?: () => void;
}

export default function OcrViewer({ initialUrl, onClose }: OcrViewerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Removed unused 'file' state
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");

  // Si se pasa initialUrl, úsalo como preview y procesa directamente
  React.useEffect(() => {
    if (initialUrl) {
      setPreviewUrl(initialUrl);
      setOcrText("");
      setError(null);
    }
  }, [initialUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
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
    setError(null);
    setOcrText("");
    setLoading(true);
    try {
      const imageUrl = initialUrl ?? previewUrl;
      if (!imageUrl) {
        setError("Selecciona una imagen para procesar.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/ocr/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      type OcrResponse = { text?: string; error?: string };
      let data: OcrResponse = {};
      const text = await res.text();
      try {
        data = JSON.parse(text) as OcrResponse;
      } catch {
        setError("La respuesta del servidor no es válida. Puede que el backend esté caído o la URL de la imagen no sea pública.");
        setLoading(false);
        return;
      }

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
    <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#E53935]" />
          <h2 className="text-xl font-bold text-[#E53935]">OCR con Gemini API</h2>
        </div>
        {onClose && (
          <button
            type="button"
            className="text-gray-400 hover:text-[#E53935] text-2xl font-bold transition"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
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
          disabled={loading || !previewUrl}
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
        <div className="fixed left-0 right-0 bottom-0 z-40 flex justify-center pointer-events-none">
          <div className="max-w-2xl w-full mx-auto bg-white border border-gray-200 rounded-t-2xl shadow-lg p-4 mb-0 pointer-events-auto">
            <h4 className="text-base font-semibold text-[#E53935] mb-2">Texto extraído</h4>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 break-words">{ocrText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

