import { Link, Outlet, useLocation } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  Trophy,
  LogOut,
  Vault,
} from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

export function Layout() {
  const { apiKey, publisherName, clearAuth } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Catalog", path: "/catalog", icon: Library },
    { name: "Publish", path: "/publish", icon: PlusCircle },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    ...(apiKey
      ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <header className="sticky top-0 z-50 w-full glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link
                to="/"
                className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95"
              >
                <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                  <Vault className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold font-display tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  MindVault
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg flex items-center gap-2",
                        isActive
                          ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive && "text-indigo-400")} />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-5">
              <AnimatePresence mode="wait">
                {publisherName && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 pr-4 border-r border-white/10"
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Publisher
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {publisherName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAuth}
                      className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-400"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-white/5 py-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Vault className="w-6 h-6 text-indigo-500" />
              <span className="font-display font-bold text-lg">MindVault</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Stellar Devs</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">API Keys</a>
            </div>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} MindVault. Built on Stellar via x402.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
