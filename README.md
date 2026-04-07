# MindVault

A payment-protected vault for digital resources. Creators store their work — datasets, prompts, research, code, APIs, any digital creation — and MindVault wraps it with an HTTP 402 paywall powered by Stellar and x402. Anyone with the resource URL, whether a human or an AI agent, can pay USDC to access it.

## The Problem

Creators produce valuable digital work every day. Datasets, research papers, automation workflows, specialized prompts, trained models. But there is no simple way to protect and monetize these resources for both human and machine consumers.

Traditional paywalls require accounts, logins, and subscriptions. That works for humans. It does not work for AI agents. An agent cannot sign up, manage a subscription, or navigate an auth flow. It can make an HTTP request and it can sign a payment. That should be enough.

## What MindVault Does

MindVault gives creators a vault for their digital resources. Each stored resource gets a unique URL with a programmable paywall. When anything — a browser, a script, an AI agent — requests that URL:

1. The vault returns HTTP 402 with the price and the creator's Stellar wallet address.
2. The requester signs a USDC payment on Stellar.
3. The requester retries the request with proof of payment.
4. The vault delivers the resource. The USDC goes directly to the creator. No middleman holds funds.

That is the entire access model. One URL. One payment. One delivery.

## Content Verification

Before a resource goes live in the vault, a built-in AI agent reviews it for originality and quality. This agent is itself an x402-paid service — it charges per verification request through the same protocol that consumers use to access resources.

The platform does not just protect content. It participates in the same payment economy as its users.

## Who Uses MindVault

**Creators** store their resources, set a price, and receive USDC directly to their Stellar wallet every time someone accesses their work.

**AI Agents** discover resource URLs (shared, indexed, or embedded in workflows) and pay to access them programmatically. No API keys. No OAuth. Just an HTTP request and a Stellar payment.

**Humans** connect a browser wallet, pay, and download or view the resource.

All three interact with the same URL, the same 402 response, and the same payment flow.

## Links

- x402 protocol: [x402.org](https://www.x402.org/)
- x402 on Stellar: [developers.stellar.org/docs/build/agentic-payments/x402](https://developers.stellar.org/docs/build/agentic-payments/x402)
- Stellar testnet USDC contract: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- Circle testnet faucet: [faucet.circle.com](https://faucet.circle.com)

## Running It

Requires Node.js 20+, pnpm, a Supabase project (free tier), and Stellar testnet wallets funded with USDC.

```bash
pnpm install
cp .env.example .env
# Fill in Supabase and Stellar credentials
pnpm db:generate && pnpm db:migrate
pnpm dev

cd web && pnpm install && pnpm dev
```

## What Is Real

Payments are real USDC transactions on Stellar testnet. The AI verification agent makes real LLM calls and real x402 payments on every publish. The frontend connects real Stellar wallets (Freighter) and signs real Soroban auth entries. Creator earnings are tracked from actual on-chain settlements.

## What Is Not Yet Built

Search and filtering. Recurring access. Refund mechanism. Mainnet deployment.

## License

MIT
