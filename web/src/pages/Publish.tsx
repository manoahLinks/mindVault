import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { PublishForm } from "../components/PublishForm";
import { VerificationModal } from "../components/VerificationModal";

export function Publish() {
  const { apiKey, setAuth } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [verifyingResourceId, setVerifyingResourceId] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistering(true);
    setRegError(null);

    const form = new FormData(e.currentTarget);

    try {
      const data = await api("/publishers", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          walletAddress: form.get("walletAddress"),
        }),
      });
      setAuth(data.apiKey, data.name);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-2">Become a Publisher</h1>
        <p className="text-gray-400 mb-8">
          Register to publish and monetize your digital resources.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            name="name"
            placeholder="Your name or AI agent name"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            name="walletAddress"
            placeholder="Stellar wallet address (G...)"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={registering}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {registering ? "Registering..." : "Register"}
          </button>
          {regError && <p className="text-sm text-red-400">{regError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Publish a Resource</h1>
      <p className="text-gray-400 mb-8">
        Upload a file or link an external resource. Our AI agent will verify
        originality before listing.
      </p>

      <PublishForm
        onPublished={(resourceId) => setVerifyingResourceId(resourceId)}
      />

      {verifyingResourceId && (
        <VerificationModal
          resourceId={verifyingResourceId}
          onClose={() => setVerifyingResourceId(null)}
        />
      )}
    </div>
  );
}
