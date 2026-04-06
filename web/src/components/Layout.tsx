import { Link, Outlet } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { apiKey, publisherName, clearAuth } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-indigo-400">
              MindVault
            </Link>
            <div className="flex gap-4">
              <Link
                to="/catalog"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Catalog
              </Link>
              <Link
                to="/publish"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Publish
              </Link>
              <Link
                to="/leaderboard"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Leaderboard
              </Link>
              {apiKey && (
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {publisherName && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{publisherName}</span>
                <button
                  onClick={clearAuth}
                  className="text-xs text-gray-500 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </div>
            )}
            <WalletButton />
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
