"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "~/components/ui/button";

// Importación dinámica estándar (sin tipar el dynamic directamente)
const OcrViewer = dynamic(() => import("~/components/OcrViewer"), { ssr: false });

export default function DocumentViewerWithOcr({ fileKey }: { fileKey: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const bucket = process.env.SUPABASE_S3_BUCKET ?? "documents";
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileKey)}`;

  const [showOcr, setShowOcr] = useState(false);

  const ext = (fileKey.split(".").pop() ?? "").toLowerCase();
  const isPdf = ext === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold break-all">{fileKey}</h1>
        <div className="flex items-center gap-2">
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
            Abrir / Descargar
          </a>
          <Button onClick={() => setShowOcr(true)}>Abrir en OCR</Button>
        </div>
      </div>

      <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
        {isPdf ? (
          <iframe src={publicUrl} className="w-full h-full" title={fileKey} />
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicUrl} alt={fileKey} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-gray-700">Vista previa no disponible para este tipo de archivo.</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              Descargar archivo
            </a>
          </div>
        )}
      </div>

      {showOcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowOcr(false)} />
          <div className="relative max-w-4xl w-full p-4">
            <OcrViewer initialUrl={publicUrl} onClose={() => setShowOcr(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
