"use client";

import Image from "next/image";
import React, { useState } from "react";
import UserCreateForm from "./UserCreateForm";
import { UserPlus, Folder, FileText, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [showUserModal, setShowUserModal] = useState(false);
  const { user, isLoaded } = useUser();

  // Obtiene el nombre del usuario desde Clerk
  const userName =
    isLoaded && user
      ? (user.fullName ?? user.firstName ?? user.lastName ?? user.username ?? user.emailAddresses?.[0]?.emailAddress) ?? "Usuario"
      : "Invitado";

  const handleAddUser = () => setShowUserModal(true);
  const handleCloseUserModal = () => setShowUserModal(false);

  return (
    <>
      <nav className="w-full bg-white border-b-4 border-[#E53935] shadow-md rounded-b-2xl px-8 py-3 flex items-center justify-between">
        {/* Izquierda: Logo y nombre */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="/logo-sevillana.jpg" // Usa tu logo real aquí
              alt="La Sevillana Logo"
              width={48}
              height={48}
              className="rounded-xl bg-white border-2 border-[#E53935] shadow"
              priority
            />
            <span className="text-3xl font-extrabold text-[#E53935] drop-shadow-lg tracking-tight">DocuSafe</span>
          </Link>
        </div>
        {/* Derecha: Botones y usuario */}
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-[#E53935]/10 text-[#E53935] font-semibold px-4 py-2 rounded-full shadow hover:bg-[#E53935]/20 transition"
            >
              <Folder className="w-5 h-5" />
              <span className="hidden sm:inline">Documentos</span>
            </Button>
          </Link>
          <Link href="/OcrViewer">
            <Button
              variant="ghost"
              className="flex items-center gap-2 bg-[#E53935]/10 text-[#E53935] font-semibold px-4 py-2 rounded-full shadow hover:bg-[#E53935]/20 transition"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">OCR</span>
            </Button>
          </Link>
          <Button
            onClick={handleAddUser}
            className="flex items-center gap-2 bg-[#E53935] text-white font-semibold px-4 py-2 rounded-full shadow hover:bg-[#c62828] transition"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Agregar usuario</span>
          </Button>
          {/* Usuario y perfil + menú Clerk */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 shadow">
            <UserCircle className="w-6 h-6 text-[#E53935]" />
            <span className="font-medium text-gray-800">{userName}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-transparent w-full max-w-lg p-0">
            <UserCreateForm onClose={handleCloseUserModal} />
          </div>
        </div>
      )}
    </>
  );
}

// No cambies nada aquí si el diseño es correcto.
// Asegúrate de que Navbar solo se importe y use en el layout principal (por ejemplo, src/app/layout.tsx)
