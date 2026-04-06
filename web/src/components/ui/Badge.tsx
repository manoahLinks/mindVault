import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "slate";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "indigo", size = "sm", className }: BadgeProps) {
  const variants = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-wider rounded border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
