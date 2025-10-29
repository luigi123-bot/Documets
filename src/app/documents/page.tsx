"use client";
import dynamic from "next/dynamic";
import React from "react";

// Import dinámico del componente cliente (evita SSR)
const DocumentList = dynamic(() => import("~/components/DocumentList"), { ssr: false });

export default function DocumentsPage() {
	return (
		<main className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-5xl mx-auto">
				<DocumentList />
			</div>
		</main>
	);
}
