import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

export function PublishForm({ onPublished }: { onPublished: (resourceId: string) => void }) {
  const { apiKey } = useAuth();
  const [mode, setMode] = useState<"file" | "link">("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!apiKey) return;

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      let data: any;
      if (mode === "file") {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "x-api-key": apiKey },
          body: formData,
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        data = await api("/resources", {
          method: "POST",
          apiKey,
          body: JSON.stringify({
            title: formData.get("title"),
            description: formData.get("description"),
            price: formData.get("price"),
            externalUrl: formData.get("externalUrl"),
          }),
        });
      }
      form.reset();
      onPublished(data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "link"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            mode === "file"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          File Upload
        </button>
      </div>

      <input
        name="title"
        placeholder="Resource title"
        required
        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />

      <input
        name="price"
        placeholder="Price in USDC (e.g. 0.50)"
        required
        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />

      {mode === "link" ? (
        <input
          name="externalUrl"
          type="url"
          placeholder="https://example.com/resource"
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      ) : (
        <input
          name="file"
          type="file"
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Resource"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
