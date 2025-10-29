"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Upload, FileText, Download, Trash2, UserCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FileItem = {
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown> | null;
  publicUrl: string;
};

interface FetchFilesResponse {
  files?: FileItem[];
  error?: string;
}

interface DeleteFileResponse {
  success?: boolean;
  error?: string;
}

export default function DocumentList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const userName = "Luis Gotopo"; // reemplaza por dato real si lo tienes

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/storage/list");
      const json = (await res.json()) as FetchFilesResponse;
      
      if (!res.ok) {
        throw new Error(json.error ?? "Error listando archivos");
      }
      
      setFiles(json.files ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFiles();
  }, []);

  const handleDelete = async (key: string) => {
    setDeleting(key);
    try {
      const res = await fetch("/api/storage/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      
      const json = (await res.json()) as DeleteFileResponse;
      
      if (!res.ok) {
        throw new Error(json.error ?? "Error borrando archivo");
      }
      
      // refrescar lista
      setFiles((prev) => prev.filter((f) => f.name !== key));
      setConfirmKey(null);
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-lg shadow-sm overflow-hidden">
            <Image
              src="/Imagen de WhatsApp 2025-10-19 a las 20.00.12_2d85c3cb.jpg"
              alt="DocuSafe Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="text-lg font-bold">DocuSafe</div>
            <div className="text-sm opacity-90">Gestión de Documentos</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            <div className="text-sm font-medium">{userName}</div>
          </div>
          <Link href="/document-upload">
            <Button variant="destructive" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Subir documento
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Archivos del bucket</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Skeletons
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="animate-pulse flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="w-2/3">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="w-1/3 flex justify-end gap-3">
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                    <div className="h-8 w-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No se encontraron archivos en el bucket.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Última modificación</TableHead>
                    <TableHead>Metadatos</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((f) => (
                    <TableRow key={f.name} className="hover:bg-gray-50 transition">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-800">{f.name}</div>
                          <div className="text-xs text-gray-500">
                            {typeof f.metadata?.description === "string" 
                              ? f.metadata.description 
                              : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {f.updated_at 
                            ? new Date(f.updated_at).toLocaleString("es-ES") 
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {f.metadata 
                            ? `${Object.keys(f.metadata).length} metadatos` 
                            : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Acciones
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/document?key=${encodeURIComponent(f.name)}`}>
                                  Ver documento
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a 
                                  href={f.publicUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" /> Descargar
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={() => setConfirmKey(f.name)} 
                                className="text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <Dialog 
        open={!!confirmKey} 
        onOpenChange={(open) => { 
          if (!open) setConfirmKey(null); 
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            ¿Estás seguro de eliminar <strong>{confirmKey}</strong>? Esta acción no se puede deshacer.
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmKey(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmKey) {
                  void handleDelete(confirmKey);
                }
              }}
              disabled={!!deleting}
            >
              {deleting === confirmKey ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}