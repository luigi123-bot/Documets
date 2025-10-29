"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatsCard from "~/components/StatsCard";
import ActivityChart from "~/components/ActivityChart";
import { Button } from "~/components/ui/button";
import Link from "next/link";

const stats = [
	{
		label: "Total digitalized documents",
		value: "1,234",
		icon: "📄",
	},
	{
		label: "OCR performed",
		value: "567",
		icon: "🔍",
	},
	{
		label: "Storage space used",
		value: "12.5 GB",
		icon: "💾",
	},
	{
		label: "Active users",
		value: "3",
		icon: "👥",
	},
];

export default function DashboardPage() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		if (!isLoaded) return;
		if (!user) {
			router.replace("/sign-in");
			return;
		}
		// Suponiendo que el rol está en user.publicMetadata.role
		const role = user.publicMetadata?.role;
		if (role === "admin" || role === "empleado") {
			setAuthorized(true);
		} else {
			router.replace("/sign-in");
		}
	}, [isLoaded, user, router]);

	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				Cargando...
			</div>
		);
	}

	if (!authorized) {
		return null;
	}

	return (
		<div className="min-h-screen bg-[#f9f9f9] font-sans">
			<main className="max-w-5xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{stats.map((stat) => (
						<StatsCard key={stat.label} {...stat} />
					))}
				</div>
				<ActivityChart />
				<div className="flex justify-center mt-10">
					<Link href="/upload">
						<Button className="bg-[#E53935] hover:bg-[#c62828] text-white text-lg px-8 py-3 rounded-full shadow-md transition">
							+ Upload Document
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
