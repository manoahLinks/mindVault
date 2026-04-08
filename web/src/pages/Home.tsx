import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Bot,
  Lock,
  Vault,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";
import { useEffect, useRef, useState } from "react";

export function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div ref={containerRef} className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Dynamic Cursor Glow */}
      <div
        className="pointer-events-none absolute -inset-px z-30 transition duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.15), transparent 40%)`,
        }}
      />

      {/* Animated Grid */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
      </div>

      {/* Noise Texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none opacity-[0.03] z-1" />

      {/* Top center glow - Multi-layered */}
      <div className="absolute top-[-10%] left-1/2 -track-x-1/2 w-[100%] h-[70%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[-5%] left-1/3 w-[50%] h-[40%] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Hero */}
        <div className="relative pt-20 pb-32 md:pt-36 md:pb-48">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 z-20">
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-10">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-white/10 group cursor-default hover:border-indigo-500/30 transition-colors">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-300 font-mono">
                    Stellar Protocol <span className="text-slate-600 font-normal mx-1">//</span> Agent-Native
                  </span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={itemVariants}
                className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-10"
              >
                <span className="text-white drop-shadow-2xl">Digital Vaults</span>
                <br />
                <span className="hero-glow inline-block py-2">for the AI Era</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-slate-400 max-w-[42ch] leading-relaxed mb-14 font-medium"
              >
                Monetize datasets, models, and code for both humans and AI agents.
                <span className="text-slate-500 italic block mt-2 font-normal text-lg">
                  HTTP 402 Paywalls • Stellar Settlements • Agent Verification
                </span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-6"
              >
                <Link to="/catalog">
                  <Button
                    size="lg"
                    className="h-16 px-10 text-lg font-black hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all bg-indigo-600 hover:bg-indigo-500 active:scale-95"
                  >
                    Enter the Catalog
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/publish">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 px-10 text-lg font-black glass border-white/10 hover:bg-white/5 active:scale-95"
                  >
                    Store Resource
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Visual - The Animating Vault */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <motion.div
                variants={itemVariants}
                className="relative z-20 group"
                style={{
                  perspective: "2000px"
                }}
              >
                {/* Background ambient glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-cyan-400/5 blur-[80px] rounded-full -z-10" />
                
                {/* The Vault Image with Cursor Parallax */}
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 1, 0, -1, 0]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{
                    x: (mousePos.x - window.innerWidth / 2) / 60,
                    y: (mousePos.y - window.innerHeight / 2) / 60,
                  }}
                  className="relative cursor-none"
                >
                  <div className="absolute -inset-10 bg-gradient-to-br from-indigo-500/30 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <img 
                    src="/assets/hero-vault.png" 
                    alt="MindVault Secure Digital Vault"
                    className="w-full max-w-[550px] drop-shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all duration-700 group-hover:scale-[1.05] group-hover:drop-shadow-[0_0_80px_rgba(99,102,241,0.7)]"
                  />

                  {/* Floating floating "status" nodes */}
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[-10%] glass-dark p-3 rounded-2xl border-white/10 shadow-2xl flex items-center gap-3 backdrop-blur-3xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-slate-300">VAULT_ACTIVE</span>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[20%] left-[-15%] glass-dark p-3 rounded-2xl border-white/10 shadow-2xl flex items-center gap-3 backdrop-blur-3xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-slate-300">USDC_READY</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Large floating text in background */}
          <div className="absolute bottom-0 right-[-10%] text-[20rem] font-black text-white/[0.02] leading-none pointer-events-none select-none tracking-tighter">
            VAULT
          </div>
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
          className="text-center pb-20 relative"
        >
          {/* Abstract background layer for depth */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-5xl opacity-20 -z-10 blur-sm pointer-events-none">
            <img src="/assets/abstract-layers.png" alt="" className="w-full h-auto" />
          </div>

          <div className="glass-dark rounded-3xl p-12 md:p-16 relative overflow-hidden backdrop-blur-2xl">
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
