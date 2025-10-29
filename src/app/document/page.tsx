"use client"
import dynamic from "next/dynamic";
import React from "react";

const DocumentViewerWithOcr = dynamic(
  () => import("~/components/DocumentViewerOcr"),
  { ssr: false }
);

type PageProps = {
  searchParams?: Promise<{ key?: string }>;

};

export default function DocumentViewerPage({ searchParams }: PageProps) {
  const [key, setKey] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    void (async () => {
      if (searchParams) {
        const params = await searchParams;
        setKey(params?.key);
      }
    })();
  }, [searchParams]);

  if (!key) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">No se proporcionó la clave del documento. Usa la lista de documentos para seleccionar uno.</p>
        </div>
      </main>
    );
  }

  const fileKey = decodeURIComponent(key);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <DocumentViewerWithOcr fileKey={fileKey} />
      </div>
    </main>
  );
}
