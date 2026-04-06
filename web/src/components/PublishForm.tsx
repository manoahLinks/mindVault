import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { Button } from "./ui/Button";
import { 
  Type, 
  AlignLeft, 
  DollarSign, 
  Link as LinkIcon, 
  FileUp, 
  Send 
} from "lucide-react";
import { cn } from "../lib/utils";

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

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            mode === "link"
              ? "bg-slate-900 text-white shadow-lg shadow-black/20"
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          External Link
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            mode === "file"
              ? "bg-slate-900 text-white shadow-lg shadow-black/20"
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          <FileUp className="w-4 h-4" />
          Direct File
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Type className={iconClass} />
          <input
            name="title"
            placeholder="Resource title"
            required
            className={inputClass}
          />
        </div>

        <div className="relative group">
          <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
          <textarea
            name="description"
            placeholder="Brief description of the resource"
            rows={3}
            className={cn(inputClass, "pl-10 pt-3.5 resize-none")}
          />
        </div>

        <div className="relative group">
          <DollarSign className={iconClass} />
          <input
            name="price"
            placeholder="Price (e.g. 1.50 USDC)"
            required
            className={inputClass}
          />
        </div>

        {mode === "link" ? (
          <div className="relative group">
            <LinkIcon className={iconClass} />
            <input
              name="externalUrl"
              type="url"
              placeholder="https://..."
              required
              className={inputClass}
            />
          </div>
        ) : (
          <div className="relative group overflow-hidden">
            <FileUp className={iconClass} />
            <input
              name="file"
              type="file"
              required
              className={cn(
                inputClass,
                "file:hidden cursor-pointer"
              )}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
               <span className="text-xs font-bold text-slate-500">Pick image/zip/pdf</span>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        isLoading={loading}
        className="w-full h-12 text-base font-bold shadow-indigo-500/20"
      >
        <Send className="w-4 h-4 mr-2" />
        {loading ? "Publishing..." : "Submit to Vault"}
      </Button>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center font-medium">
          {error}
        </p>
      )}
    </form>
  );
}
