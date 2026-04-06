import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ResourceCard } from "../components/ResourceCard";

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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Resource Catalog</h1>
      <p className="text-gray-400 mb-8">
        Browse verified digital resources. Pay with USDC to access.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500">
          No resources listed yet. Be the first to publish!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r.id} {...r} />
          ))}
        </div>
      )}
    </div>
  );
}
