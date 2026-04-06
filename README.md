# MindVault

A marketplace where humans and AI agents publish, verify, and trade digital resources. Access is controlled through HTTP 402 payments on Stellar using the x402 protocol.

## The Problem

AI agents can reason, plan, and execute — right up until they need to pay for something. There is no standard way for an agent to buy a dataset, unlock a research paper, or pay for a tool. Subscription models and API keys were designed for humans sitting at keyboards, not autonomous software making thousands of requests.

On the other side, creators have no simple way to monetize digital resources for machine consumption. You can put content behind a login wall, but an AI agent cannot fill out a registration form.

## What MindVault Does

MindVault makes any digital resource purchasable by any HTTP client — human or machine — through a single mechanism: send a request, get a 402 with payment instructions, pay USDC on Stellar, resend the request, get the resource.

Creators publish resources and set their price. Consumers discover resources in the catalog and pay to access them. Every payment goes directly to the creator's Stellar wallet. No intermediary holds funds.

A built-in AI verification agent reviews every submission for originality before it gets listed. This agent is itself an x402-paid service — it charges per verification request through the same protocol consumers use. The platform does not just host a marketplace. It participates in the economy it creates.

## How It Works

1. A creator publishes a resource (file or external link) and sets a price in USDC.
2. The platform's AI agent pays to verify the content for originality via x402. If it passes, the resource goes live.
3. Anyone — a person with a browser wallet or an agent with a funded keypair — requests the resource.
4. The server returns HTTP 402 with the price, destination wallet, and network.
5. The client signs a USDC payment on Stellar and retries the request.
6. The x402 facilitator settles the transaction on-chain. The resource is delivered.

## Three Actors, One Payment Protocol

**Producers** publish resources and earn USDC directly to their Stellar wallet.

**Consumers** pay per access. No accounts, no subscriptions. Connect a wallet and pay.

**The Platform Agent** charges for content verification via the same x402 flow. It is both a gatekeeper and a participant in the marketplace.

## Links

- Live app: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4021](http://localhost:4021)
- Stellar testnet USDC contract: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- x402 protocol: [x402.org](https://www.x402.org/)
- x402 on Stellar docs: [developers.stellar.org/docs/build/agentic-payments/x402](https://developers.stellar.org/docs/build/agentic-payments/x402)

## Running It

Requires Node.js 20+, pnpm, a Supabase project (free tier), and Stellar testnet wallets funded with USDC from [faucet.circle.com](https://faucet.circle.com).

```bash
pnpm install
cp .env.example .env
# Fill in Supabase and Stellar credentials
pnpm db:generate && pnpm db:migrate
pnpm dev

cd web && pnpm install && pnpm dev
```

## What Is Real

Payments are real USDC transactions on Stellar testnet. The AI agent makes real LLM calls and real x402 payments on every publish. The frontend connects real wallets (Freighter) and signs real Soroban auth entries. Creator earnings are tracked from actual on-chain settlements.

## What Is Not Yet Built

Search and filtering. Recurring access. Refund mechanism. Mainnet deployment.

## License

MIT
