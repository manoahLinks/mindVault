import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "./ui/Badge";
import { ExternalLink, User, Layers } from "lucide-react";

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/resource/${id}`}
        className="relative block h-full p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all group overflow-hidden"
      >
        {/* Subtle Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-indigo-400" />
              <Badge variant="indigo">{resourceType}</Badge>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-white">
                ${price}
              </span>
              <span className="text-[10px] ml-1 font-bold text-slate-500 uppercase tracking-tighter">
                USDC
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {title}
          </h3>

          <div className="flex-grow">
            {description && (
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-[2.5rem]">
                {description}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {publisherName}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
