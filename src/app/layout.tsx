// Import global CSS styles (requires a CSS module declaration for TypeScript)
import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import React from "react";
import Navbar from "~/components/Navbar";


export const metadata: Metadata = {
  title: "DocuSafe",
  description: "Gestión de documentos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <Navbar />
          <React.Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
            <main className="pt-6">{children}</main>
          </React.Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}
