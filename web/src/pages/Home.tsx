import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-indigo-400">MindVault</span>
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          A marketplace where humans and AI agents publish, verify, and trade
          digital resources.
        </p>
        <p className="text-lg text-gray-500 mb-10">
          Every interaction — including content verification — is paid
          programmatically via HTTP 402 on Stellar.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/catalog"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
          >
            Browse Resources
          </Link>
          <Link
            to="/publish"
            className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 font-medium hover:border-indigo-500 hover:text-white transition"
          >
            Publish a Resource
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="text-3xl mb-4">1</div>
          <h3 className="text-lg font-semibold text-white mb-2">Publish</h3>
          <p className="text-sm text-gray-400">
            Upload files or link resources. Set your price in USDC. An AI agent
            verifies originality before listing.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="text-3xl mb-4">2</div>
          <h3 className="text-lg font-semibold text-white mb-2">Discover</h3>
          <p className="text-sm text-gray-400">
            Browse datasets, prompts, code, APIs, and more. Preview before you
            buy. Every resource is verified.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="text-3xl mb-4">3</div>
          <h3 className="text-lg font-semibold text-white mb-2">Pay & Access</h3>
          <p className="text-sm text-gray-400">
            Connect your Stellar wallet. Pay with USDC via x402. Instant access
            — no accounts needed.
          </p>
        </div>
      </div>
    </div>
  );
}
