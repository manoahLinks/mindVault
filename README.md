# MindVault

A marketplace where humans and AI agents publish, verify, and trade digital resources. Access is controlled through HTTP 402 payments on Stellar using the x402 protocol.

## The Problem

AI agents can reason, plan, and execute. But they cannot easily buy or sell digital resources from each other or from humans. There is no standard, programmable way for an agent to pay for a dataset, unlock a tool, or purchase research output. Subscription models and API keys were designed for humans, not machines.

## What MindVault Does

MindVault is a payment-gated resource marketplace built for the agentic economy. Any participant, whether human or AI, can:

- **Publish** a digital resource (dataset, prompt, code, research, API, file) and set a price in USDC
- **Access** any resource by making an HTTP request. If unpaid, the server returns a 402 with payment instructions. After payment settles on Stellar, the resource is delivered.
- **Verify** content originality through a built-in AI agent that itself charges per request via x402

The entire system runs on a single payment primitive: HTTP 402.

## How It Works

```
Client                    MindVault                  Stellar
  |                          |                          |
  |-- GET /resources/abc --> |                          |
  |                          |                          |
  |<-- 402 Payment Required  |                          |
  |    { price, payTo,       |                          |
  |      network, scheme }   |                          |
  |                          |                          |
  |-- Sign USDC transfer --> |                          |
  |-- Retry with X-Payment ->|                          |
  |                          |-- Verify + Settle -----> |
  |                          |<-- Confirmed ----------- |
  |                          |                          |
  |<-- 200 OK + resource --- |                          |
```

Every resource has its own price and destination wallet. The x402 middleware constructs payment requirements dynamically per resource and delegates verification and settlement to a facilitator (Coinbase on testnet, OpenZeppelin on mainnet).

## The Verification Agent

When a creator publishes a resource, it is not immediately listed. The platform runs a built-in AI agent that reviews the listing for originality and quality.

This agent is itself an x402-paid service. It has its own endpoint (`POST /verify-content`), its own price, and its own Stellar wallet. The platform pays the agent through the same x402 protocol that consumers use to buy resources. External developers and other marketplaces can also call this endpoint and pay for verification.

This means MindVault does not just host a marketplace. It participates in the economy it creates.

The verification flow:

1. Creator publishes a resource. It starts unlisted, status: `pending`.
2. The platform's agent wallet sends a paid request to `POST /verify-content` via x402.
3. The verification endpoint charges USDC, then calls an LLM (via OpenRouter) to analyze the content.
4. If the content passes, the resource is marked `verified` and listed. If not, it is `rejected` with reasons.

## Three Actors, One Protocol

| Actor | Role | How they pay |
|-------|------|-------------|
| **Producers** | Publish resources, set prices, earn USDC | Receive payments to their Stellar wallet |
| **Consumers** | Browse catalog, pay to access resources | x402 payment per request |
| **Platform Agent** | Verifies content originality before listing | Charges per verification via x402 |

All three use the same x402 payment flow. There is no separate payment system for the platform versus the users.

## Architecture

```
mindVault/
  src/
    routes/
      publishers.ts        Registration, profile, analytics, leaderboard
      resources.ts          Publish, catalog, x402-gated access, verification status
      verify.ts             AI verification endpoint (x402 paywalled)
    middleware/
      apiKeyAuth.ts         Publisher authentication
      dynamicPaywall.ts     Per-resource x402 payment gate
    services/
      platformAgent.ts      x402 client that pays for verification
      verificationService.ts  LLM-based originality check (OpenRouter)
      resourceService.ts    Resource CRUD + triggers verification on publish
      publisherService.ts   Publisher CRUD
    storage/
      supabaseStorage.ts    File upload/download via Supabase Storage
    db/
      schema.ts             publishers, resources, verifications, payments
  web/                      React frontend (Vite + Tailwind)
  scripts/
    generate-wallet.ts      Create and fund a Stellar testnet wallet
    setup-usdc.ts           Add USDC trustline and check balances
    e2e-test.ts             Full flow test script
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | Node.js, TypeScript, Express 5 |
| Payments | x402 protocol (`@x402/express`, `@x402/stellar`, `@x402/fetch`) |
| Blockchain | Stellar testnet, USDC via Soroban SAC |
| Database | Supabase Postgres + Drizzle ORM |
| Storage | Supabase Storage |
| AI Verification | OpenRouter (model-flexible, defaults to Claude) |
| Frontend | React, Vite, Tailwind CSS |
| Wallet Connection | @creit.tech/stellar-wallets-kit (Freighter, xBull, etc.) |

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/resources` | Browse listed resources (includes access URLs) |
| GET | `/resources/:id/meta` | Resource preview with price and publisher |
| GET | `/resources/:id/verification` | Verification status and AI feedback |
| GET | `/publishers/leaderboard` | Creator rankings by earnings |

### Publisher (requires `x-api-key` header)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/publishers` | Register as publisher, returns API key |
| GET | `/publishers/me` | Own profile |
| GET | `/publishers/me/resources` | Own resources with status |
| GET | `/publishers/me/analytics` | Earnings, sales, per-resource stats |
| POST | `/resources` | Publish a resource (file upload or link) |
| DELETE | `/resources/:id` | Delist a resource |

### x402 Paywalled (requires USDC payment on Stellar)

| Method | Path | Pays To | Description |
|--------|------|---------|-------------|
| GET | `/resources/:id` | Creator's wallet | Access the resource |
| POST | `/verify-content` | Platform wallet | AI originality check |

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project (free tier works)
- Stellar testnet wallets with USDC

### Setup

```bash
git clone https://github.com/your-repo/mindVault.git
cd mindVault
pnpm install

# Generate testnet wallets
pnpm generate-wallet

# Copy env template and fill in your values
cp .env.example .env

# Run database migrations
pnpm db:generate
pnpm db:migrate

# Fund your agent wallet with testnet USDC
# Go to https://faucet.circle.com -> Stellar Testnet -> paste your PAY_TO address

# Start the backend
pnpm dev

# In another terminal, start the frontend
cd web
pnpm install
pnpm dev
```

Backend runs on `http://localhost:4021`. Frontend runs on `http://localhost:5173`.

### Testing the x402 Flow

Any HTTP client can interact with the marketplace. An unpaid request returns a 402:

```bash
curl http://localhost:4021/resources/<resource-id>
# Returns: 402 Payment Required
# Body: { price, payTo, network, scheme }
```

An agent with a funded Stellar wallet can use `@x402/fetch` to handle the payment automatically:

```typescript
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { createEd25519Signer } from "@x402/stellar";

const signer = createEd25519Signer(AGENT_SECRET_KEY, "stellar:testnet");
const client = new x402Client().register("stellar:testnet", new ExactStellarScheme(signer));
const paidFetch = wrapFetchWithPayment(fetch, client);

const response = await paidFetch("http://localhost:4021/resources/<id>");
// Payment is handled automatically. Resource is delivered.
```

## What is Real

- Resources are published and stored in Supabase (Postgres + Storage)
- Payments are real USDC transactions on Stellar testnet, settled through the x402 facilitator
- The AI verification agent makes real LLM calls via OpenRouter and real x402 payments
- The frontend connects real Stellar wallets (Freighter) and signs real Soroban auth entries
- The creator dashboard tracks actual payment records from the database

## What is Not Yet Built

- Search and filtering on the catalog
- Recurring access or time-limited leases (currently one-time per request)
- Refund mechanism
- Rate limiting on the verification endpoint
- Mainnet deployment (testnet only for now)

## Stellar Integration

MindVault interacts with Stellar in two ways:

1. **Consumer payments**: When a consumer accesses a resource, the x402 middleware constructs a Soroban authorization entry for a USDC transfer. The consumer's wallet signs it, and the facilitator submits the transaction on-chain. Funds go directly to the creator's Stellar wallet.

2. **Platform verification payments**: The platform agent holds its own Stellar keypair. When a resource is published, the agent signs a USDC payment to the platform's verification endpoint through the same x402 protocol. This is a real on-chain transaction on every publish.

Both flows use the Stellar testnet USDC contract (`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`), which is the SAC wrapper for the classic USDC issuer.

## License

MIT
