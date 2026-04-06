import { Link } from "react-router-dom";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string | null;
  price: string;
  resourceType: string;
  publisherName: string;
}

export function ResourceCard({
  id,
  title,
  description,
  price,
  resourceType,
  publisherName,
}: ResourceCardProps) {
  return (
    <Link
      to={`/resource/${id}`}
      className="block p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-indigo-500/50 hover:bg-gray-900 transition group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
          {resourceType}
        </span>
        <span className="text-indigo-400 font-semibold">${price} USDC</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{description}</p>
      )}
      <p className="text-xs text-gray-500">by {publisherName}</p>
    </Link>
  );
}
