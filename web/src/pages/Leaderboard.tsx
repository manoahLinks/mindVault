import { useEffect, useState } from "react";
import { api } from "../api/client";

interface Creator {
  id: string;
  name: string;
  walletAddress: string;
  joinedAt: string;
  totalResources: number;
  listedResources: number;
  verifiedResources: number;
  totalSales: number;
  totalEarned: string;
}

export function Leaderboard() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Creator[]>("/publishers/leaderboard")
      .then(setCreators)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Creator Leaderboard</h1>
      <p className="text-gray-400 mb-8">
        Top creators ranked by earnings on MindVault.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : creators.length === 0 ? (
        <p className="text-gray-500">No creators yet.</p>
      ) : (
        <div className="space-y-3">
          {creators.map((creator, index) => (
            <div
              key={creator.id}
              className="p-5 rounded-xl border border-gray-800 bg-gray-900/50 flex items-center gap-5"
            >
              {/* Rank */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-400"
                    : index === 1
                    ? "bg-gray-400/20 text-gray-300"
                    : index === 2
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {index + 1}
              </div>

              {/* Creator info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {creator.name}
                  </h3>
                  <span className="text-xs text-gray-600 font-mono">
                    {creator.walletAddress.slice(0, 6)}...
                    {creator.walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {creator.listedResources} listed / {creator.totalResources}{" "}
                    total
                  </span>
                  <span>{creator.verifiedResources} verified</span>
                  <span>
                    Joined {new Date(creator.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="text-xl font-bold text-white">
                    {creator.totalSales}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Earned</p>
                  <p className="text-xl font-bold text-green-400">
                    ${parseFloat(creator.totalEarned).toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-600">USDC</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
