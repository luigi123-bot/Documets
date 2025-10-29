"use client";

import React, { useRef, useState } from "react";
import { Button } from "~/components/ui/button"; // shadcn button

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Aceptar File | null explícitamente
  const onFileChange = (f: File | null) => {
    setError(null);
    setPublicUrl(null);
    setFile(f);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // usar aserción no nula y validar runtime
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Error leyendo archivo"));
          return;
        }
        const base64 = result.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = () => {
        const msg = reader.error?.message ?? "FileReader error";
        reject(new Error(msg));
      };
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setPublicUrl(null);

    if (!file) {
      setError("Selecciona un archivo primero.");
      return;
    }

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const payload = {
        fileName: file.name, // aquí puedes prefijar ruta: `invoices/${file.name}`
        fileBase64: base64,
        contentType: file.type || "application/octet-stream",
      };

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      type UploadResponse = { error?: string; publicUrl?: string };

      const json = (await res.json()) as UploadResponse;

      if (!res.ok) {
        const errMsg =
          typeof json === "object" && json !== null && typeof json.error === "string"
            ? json.error
            : "Error subiendo archivo";
        throw new Error(errMsg);
      }

      // Validación segura del campo publicUrl
      const publicUrlValue =
        typeof json.publicUrl === "string" ? json.publicUrl : null;

      setPublicUrl(publicUrlValue);
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Subir documento</h3>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        title="Selecciona un archivo para subir"
        placeholder="Selecciona un archivo"
        onChange={(ev) => {
          const f = ev.target.files?.[0] ?? null;
          onFileChange(f);
        }}
      />

      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <div>
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</div>
            <Button variant="link" className="mt-3 text-sm text-red-600" onClick={(e) => { e.stopPropagation(); onFileChange(null); }}>
              Quitar
            </Button>
          </div>
        ) : (
          <div className="text-gray-600">Arrastra o haz click para seleccionar un archivo</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Button variant="secondary" onClick={() => alert("Selecciona un archivo y presiona 'Subir'.")}>
            Opciones
          </Button>

          <Button type="submit" disabled={loading || !file}>
            {loading ? "Subiendo..." : "Subir documento"}
          </Button>
        </div>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {publicUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800 font-semibold">Documento subido correctamente</div>
          <div className="mt-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline break-all"
            >
              {publicUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
