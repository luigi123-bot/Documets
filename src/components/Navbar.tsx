import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import React, { useState } from "react";

export default function Navbar() {
  const { user } = useUser();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // If ClerkProvider is missing, user will be undefined and useUser may throw an error.
  // Optionally, you can check for user === undefined and show an error message.
  if (user === undefined) {
    return (
      <nav className="w-full bg-[#E53935] px-8 py-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-6">
          <Image
            src="/Imagen de WhatsApp 2025-10-19 a las 20.00.12_2d85c3cb.jpg"
            alt="DocuSafe Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-2xl font-bold text-white">DocuSafe</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">Error: ClerkProvider missing</span>
        </div>
      </nav>
    );
  }

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          full_name: user.fullName,
          role: user.publicMetadata?.role ?? "empleado",
        }),
      });
      if (res.ok) {
        setSyncMsg("¡Usuario sincronizado!");
        console.log("Usuario Clerk sincronizado con Supabase");
      } else {
        const data = (await res.json()) as { error?: string };
        setSyncMsg("Error: " + (data.error ?? "Sincronización fallida"));
        console.error("Error al sincronizar usuario Clerk con Supabase:", data.error);
      }
    } catch (err) {
      setSyncMsg("Error inesperado");
      console.error("Error al sincronizar usuario Clerk con Supabase:", err);
    }
    setSyncing(false);
  };

  return (
    <nav className="w-full bg-[#E53935] px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <Image
          src="/Imagen de WhatsApp 2025-10-19 a las 20.00.12_2d85c3cb.jpg"
          alt="DocuSafe Logo"
          width={64}
          height={64}
          className="rounded-xl shadow-lg border-2 border-white"
          priority
        />
        <span className="text-4xl font-extrabold text-white drop-shadow-lg">DocuSafe</span>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-white font-medium">{user.fullName ?? "John Doe"}</span>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-white text-[#E53935] font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-100 transition"
            >
              {syncing ? "Sincronizando..." : "Sincronizar usuario"}
            </button>
            {syncMsg && (
              <span className="ml-2 text-sm text-white bg-[#E53935] px-2 py-1 rounded">{syncMsg}</span>
            )}
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <span className="text-white font-medium">John Doe</span>
        )}
      </div>
    </nav>
  );
}
