'use client'

import React from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'

export default function SignInPage() {
  const router = useRouter();
  // Track sign-in success
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    if (signedIn) {
      const timer = setTimeout(() => router.replace("/dashboard"), 1200);
      return () => clearTimeout(timer);
    }
  }, [signedIn, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-red-50 via-white to-gray-100 opacity-60 animate-pulse"></div>

      {/* Tarjeta principal */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 border border-gray-100">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/Imagen de WhatsApp 2025-10-19 a las 20.00.12_2d85c3cb.jpg"
            alt="DocuSafe Logo"
            width={64}
            height={64}
            className="rounded-full shadow-md mb-4"
            priority
          />
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Bienvenido a <span className="text-red-600">DocuSafe</span>
          </h1>
          <p className="text-gray-500 text-center mt-2 text-sm">
            Accede a tu cuenta para gestionar tus documentos de forma segura y organizada.
          </p>
        </div>

        {/* Clerk Sign-In Form */}
        <SignIn.Root>
          {/* Paso 1 - Correo */}
          <SignIn.Step name="start">
            <Clerk.Field name="identifier" className="block mb-5">
              <Clerk.Label className="text-sm font-medium text-gray-700 mb-1">
                Correo electrónico o nombre de usuario
              </Clerk.Label>
              <Clerk.Input
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition"
                placeholder="tuemail@ejemplo.com"
              />
              <Clerk.FieldError className="text-sm text-red-500 mt-1" />
            </Clerk.Field>

            <SignIn.Action
              submit
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 rounded-xl shadow-md transition transform hover:scale-[1.02]"
            >
              Continuar
            </SignIn.Action>
          </SignIn.Step>

          {/* Paso 2 - Contraseña */}
          <SignIn.Step name="verifications">
            <Clerk.Field name="password" className="block mb-5">
              <Clerk.Label className="text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </Clerk.Label>
              <Clerk.Input
                type="password"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition"
                placeholder="••••••••"
              />
              <Clerk.FieldError className="text-sm text-red-500 mt-1" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 rounded-xl shadow-md transition transform hover:scale-[1.02] mt-2"
              onClick={() => setSignedIn(true)}
            >
              Iniciar sesión
            </SignIn.Action>
          </SignIn.Step>
          {signedIn && (
            <div className="text-center mt-4">
              <p className="text-green-600 font-semibold mb-2">Inicio de sesión exitoso 🎉</p>
            </div>
          )}
        </SignIn.Root>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <span className="h-px w-1/3 bg-gray-200"></span>
          <span className="text-gray-400 text-xs mx-2">o</span>
          <span className="h-px w-1/3 bg-gray-200"></span>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes una cuenta?{' '}
          <a href="/sign-up" className="text-red-600 font-semibold hover:underline">
            Regístrate
          </a>
        </div>
      </div>

      <footer className="mt-6 text-gray-400 text-xs">
        DocuSafe © 2025 — Desarrollado con ❤️ y seguridad
      </footer>
    </div>
  )
}
