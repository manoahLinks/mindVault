import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { api } from "../api/client";
import { PublishForm } from "../components/PublishForm";
import { VerificationModal } from "../components/VerificationModal";
import { 
  Rocket, 
  Sparkles, 
  UserPlus, 
  Mail, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "../components/ui/Button";

export function Publish() {
  const { apiKey, isPublisher, setAuth } = useAuth();
  const { address: walletAddress, connected, connect } = useWallet();
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [verifyingResourceId, setVerifyingResourceId] = useState<string | null>(null);
  const [verifyingContent, setVerifyingContent] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletAddress) return;
    setRegistering(true);
    setRegError(null);

    const form = new FormData(e.currentTarget);

    try {
      const data = await api("/publishers", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          walletAddress,
        }),
      });
      setAuth(data.apiKey, data.name, data.walletAddress);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (!apiKey && !isPublisher) {
    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";
    const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 transition-colors group-focus-within:text-indigo-400";

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  Join the Network
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Become a <span className="text-gradient">MindVault</span> Publisher
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Monetize your code, datasets, and prompts. Connect with AI agents 
                and developers looking for high-quality resources.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Verified Identity", desc: "Build trust with autonomous buyers." },
                { icon: Zap, title: "Instant Settlements", desc: "Receive USDC directly to your wallet." },
                { icon: Rocket, title: "Programmatic Access", desc: "Ready for AI-to-AI transactions." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-1.5 bg-gradient-to-br from-white/10 to-transparent rounded-3xl">
            <div className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-[22px] shadow-2xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-indigo-400" />
                Register Now
              </h2>

              {!connected ? (
                <div className="space-y-6">
                  <p className="text-slate-400 text-sm">
                    Connect your Stellar wallet first. Your wallet address will be used as your publisher identity.
                  </p>
                  <Button
                    onClick={connect}
                    className="w-full h-12 text-base font-bold"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet to Register
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Connected Wallet</p>
                      <p className="text-sm text-white font-mono truncate">{walletAddress}</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <Rocket className={iconClass} />
                    <input
                      name="name"
                      placeholder="Agent Name or Organization"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div className="relative group">
                    <Mail className={iconClass} />
                    <input
                      name="email"
                      type="email"
                      placeholder="Contact Email"
                      required
                      className={inputClass}
                    />
                  </div>
                  <Button
                    type="submit"
                    isLoading={registering}
                    className="w-full h-12 text-base font-bold shadow-indigo-500/20"
                  >
                    Create Publisher Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  {regError && (
                    <p className="text-sm text-red-400 text-center font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                      {regError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Publish a Resource
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Upload your asset and set your price. Every resource undergoes 
          AI verification for originality.
        </p>
      </div>

      <div className="p-1 bg-white/5 rounded-3xl border border-white/5">
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[22px]">
          <PublishForm
            onPublished={(resourceId, content) => {
              setVerifyingResourceId(resourceId);
              setVerifyingContent(content);
            }}
          />
        </div>
      </div>

      {verifyingResourceId && verifyingContent && (
        <VerificationModal
          resourceId={verifyingResourceId}
          content={verifyingContent}
          onClose={() => {
            setVerifyingResourceId(null);
            setVerifyingContent(null);
          }}
        />
      )}
    </div>
  );
}
