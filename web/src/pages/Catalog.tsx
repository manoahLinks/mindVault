import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ResourceCard } from "../components/ResourceCard";
import { motion } from "framer-motion";
import { ResourceSkeleton } from "../components/ui/Skeleton";
import { Library, Sparkles } from "lucide-react";

interface CatalogResource {
  id: string;
  title: string;
  description: string | null;
  price: string;
  resourceType: string;
  mimeType: string | null;
  publisherName: string;
  createdAt: string;
}

export function Catalog() {
  const [resources, setResources] = useState<CatalogResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CatalogResource[]>("/resources")
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-12">
      <header className="max-w-2xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Curated Market</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center gap-4">
          <Library className="w-10 h-10 text-slate-700" />
          Resource Catalog
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Browse our world-class library of AI-verified digital assets. 
          Pay once with USDC and get instant access to the raw content.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <ResourceSkeleton key={i} />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="p-16 text-center glass-dark rounded-3xl border border-dashed border-white/10">
          <Library className="w-16 h-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Resources Listed Yet</h3>
          <p className="text-slate-500 mb-8">Be the first to publish and start earning USDC.</p>
          <a
            href="/publish"
            className="px-6 py-3 rounded-xl bg-indigo-600 font-bold hover:bg-indigo-500 transition-colors"
          >
            Publish Now
          </a>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {resources.map((r) => (
            <motion.div key={r.id} variants={itemVariants}>
              <ResourceCard {...r} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
