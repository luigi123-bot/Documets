import DocumentUpload from "~/components/DocumentUpload";

export default function DocumentUploadPage() {
	// ...puedes envolver con layout o contenedor si lo deseas...
	return (
		<main className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-4xl mx-auto">
				<DocumentUpload />
			</div>
		</main>
	);
}
