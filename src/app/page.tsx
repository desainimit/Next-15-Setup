import FileUploader from "@/components/fileUploader";

export default function Home() {
  return (
    <main className="max-w-xl mx-auto mt-20">
      <h1 className="text-2xl font-semibold mb-4">Upload File</h1>
      <FileUploader />
    </main>
  );
}
