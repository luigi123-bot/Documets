"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "chart.js/auto";

export default function HomePage() {
	const { user, isLoaded } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (isLoaded && !user) {
			router.replace("/sign-in");
		}
		if (isLoaded && user) {
			// Sincronizar usuario con Supabase
			const syncUser = async () => {
				try {
					await fetch("/api/users/sync", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							clerkId: user.id,
							email: user.emailAddresses?.[0]?.emailAddress,
							full_name: user.fullName,
							role: user.publicMetadata?.role ?? "empleado",
						}),
					});
					console.log("Usuario Clerk sincronizado con Supabase");
				} catch (err) {
					console.error("Error al sincronizar usuario Clerk con Supabase:", err);
				}
			};
			void syncUser();
			router.replace("/dashboard");
		}
	}, [isLoaded, user, router]);

	if (!isLoaded) {
		return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
	}

	return null;
}
