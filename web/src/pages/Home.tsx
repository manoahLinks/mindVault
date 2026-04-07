import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bot,
  Lock,
  Zap,
  Vault,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useEffect, useRef, useState } from "react";

export function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Top center glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-indigo-600/8 blur-[150px] rounded-full pointer-events-none" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,transparent,var(--color-slate-950)_70%)] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Hero */}
        <div className="pt-20 pb-32 md:pt-36 md:pb-44 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 font-mono">
                Powered by Stellar & x402
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-8"
          >
            <span className="text-white">Your Vault for</span>
            <br />
            <span className="hero-glow">Protected Creations</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-[52ch] mx-auto leading-relaxed mb-12"
          >
            Store your digital resources. Protect them with a paywall.
            Anyone with the URL — human or AI agent — pays USDC on Stellar to access them.
            One URL. One payment. One delivery.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/catalog">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 text-base font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow"
              >
                Browse the Vault
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/publish">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 text-base font-bold glass border-white/10"
              >
                Store Your Work
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Glow divider */}
        <div className="glow-line mb-24" />

        {/* How it works */}
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Three steps. No accounts. No API keys. No subscriptions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="Store"
              description="Upload your creation or link an external resource. Set your price in USDC. Your work goes into the vault."
              variants={itemVariants}
            />
            <StepCard
              number="02"
              title="Verify"
              description="An AI agent reviews your submission for originality. It pays for verification through the same x402 protocol."
              variants={itemVariants}
            />
            <StepCard
              number="03"
              title="Earn"
              description="Share the resource URL. Anyone who requests it gets a 402 with payment instructions. They pay, you earn. Directly to your wallet."
              variants={itemVariants}
            />
          </div>
        </motion.div>

        {/* Glow divider */}
        <div className="glow-line mb-24" />

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-32 max-w-4xl mx-auto"
        >
          <StatCard value="402" label="HTTP Paywall" delay={0} />
          <StatCard value="USDC" label="Stablecoin" delay={100} />
          <StatCard value="<5s" label="Settlement" delay={200} />
          <StatCard value="0%" label="Platform Cut" delay={300} />
        </motion.div>

        {/* Glow divider */}
        <div className="glow-line mb-24" />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-32">
          <FeatureCard
            variants={itemVariants}
            icon={Vault}
            title="Creator-Owned"
            description="Your resources live in your vault. Payments go directly to your Stellar wallet. No intermediary holds your funds."
            color="indigo"
          />
          <FeatureCard
            variants={itemVariants}
            icon={Bot}
            title="Agent-Ready"
            description="Any AI agent with a funded wallet can access your resources programmatically. No accounts, no OAuth, just HTTP."
            color="cyan"
          />
          <FeatureCard
            variants={itemVariants}
            icon={ShieldCheck}
            title="AI-Verified"
            description="A built-in verification agent checks every submission for originality before listing. It charges for its own work via x402."
            color="emerald"
          />
        </div>

        {/* Glow divider */}
        <div className="glow-line mb-24" />

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          className="text-center pb-20"
        >
          <div className="glass-dark rounded-3xl p-12 md:p-16 relative overflow-hidden">
            {/* Top edge glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="flex items-center justify-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 font-mono">
                Built for the Agentic Economy
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Your Work. <span className="hero-glow">Your Vault.</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Store what you create. Protect it with a payment gate.
              Let any human or AI agent pay to access it.
              Every payment settles on Stellar in seconds.
            </p>
            <Link to="/publish">
              <Button
                size="lg"
                className="h-14 text-base font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow"
              >
                Start Storing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StepCard({ number, title, description, variants }: any) {
  return (
    <motion.div
      variants={variants}
      className="glass-dark rounded-2xl p-8 relative group"
    >
      <div className="text-[11px] font-mono font-bold text-indigo-500 tracking-widest mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay + 400);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "glass-dark rounded-2xl p-6 text-center transition-all duration-700",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"
      )}
    >
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 font-mono">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color, variants }: any) {
  const glowColors: any = {
    indigo: "group-hover:shadow-[inset_0_1px_0_rgba(99,102,241,0.1),0_0_0_1px_rgba(99,102,241,0.05)]",
    cyan: "group-hover:shadow-[inset_0_1px_0_rgba(34,211,238,0.1),0_0_0_1px_rgba(34,211,238,0.05)]",
    emerald: "group-hover:shadow-[inset_0_1px_0_rgba(52,211,153,0.1),0_0_0_1px_rgba(52,211,153,0.05)]",
  };
  const iconColors: any = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    cyan: "text-cyan-400 bg-cyan-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-dark rounded-2xl p-8 group cursor-default transition-all duration-300",
        glowColors[color]
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
          iconColors[color]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
