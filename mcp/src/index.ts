import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  Keypair,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { createEd25519Signer } from "@x402/stellar";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const MINDVAULT_API = process.env.MINDVAULT_API || "https://mindvault-hyr3.onrender.com";
const WALLET_PATH = join(process.env.HOME || ".", ".mindvault-agent-wallet.json");
const SPONSORED_ACCOUNT_API = "https://stellar-sponsored-agent-account.onrender.com";
const NETWORK = "stellar:testnet";
const HORIZON_URL = "https://horizon-testnet.stellar.org";

// Wallet management
interface WalletConfig {
  publicKey: string;
  secretKey: string;
  createdAt: string;
  apiKey?: string;
  publisherName?: string;
}

function loadWallet(): WalletConfig | null {
  if (!existsSync(WALLET_PATH)) return null;
  try {
    return JSON.parse(readFileSync(WALLET_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveWallet(config: WalletConfig) {
  writeFileSync(WALLET_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

// Create paidFetch from a secret key
function createPaidFetch(secretKey: string) {
  const signer = createEd25519Signer(secretKey, NETWORK);
  const client = new x402Client().register(
    NETWORK,
    new ExactStellarScheme(signer)
  );
  return wrapFetchWithPayment(fetch, client);
}

// MCP Server
const server = new McpServer({
  name: "mindvault",
  version: "1.0.0",
});

// Tool: Setup wallet using sponsored account
server.tool(
  "mindvault_setup_wallet",
  "Create a new Stellar wallet for this agent using Stellar's sponsored account protocol. The wallet is USDC-ready with no XLM needed upfront. After creation, fund it with testnet USDC from https://faucet.circle.com",
  {},
  async () => {
    const existing = loadWallet();
    if (existing) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Wallet already exists.\n\nPublic Key: ${existing.publicKey}\nCreated: ${existing.createdAt}\n\nTo check balance, use mindvault_wallet_info.`,
          },
        ],
      };
    }

    try {
      // Generate keypair locally
      const keypair = Keypair.random();

      // Request sponsored account creation
      const createRes = await fetch(`${SPONSORED_ACCOUNT_API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_key: keypair.publicKey() }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        return {
          content: [{ type: "text" as const, text: `Failed to create sponsored account: ${err.message || createRes.statusText}` }],
        };
      }

      const { xdr, network_passphrase } = await createRes.json();

      // Sign the transaction
      const tx = TransactionBuilder.fromXDR(xdr, network_passphrase);
      tx.sign(keypair);

      // Submit
      const submitRes = await fetch(`${SPONSORED_ACCOUNT_API}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xdr: tx.toXDR() }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json();
        return {
          content: [{ type: "text" as const, text: `Failed to submit sponsored account: ${err.message || submitRes.statusText}` }],
        };
      }

      const result = await submitRes.json();

      // Save wallet
      const walletConfig: WalletConfig = {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        createdAt: new Date().toISOString(),
      };
      saveWallet(walletConfig);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              "Stellar wallet created with sponsored account.",
              "",
              `Public Key: ${keypair.publicKey()}`,
              `Explorer: ${result.explorer_url}`,
              "",
              "The wallet has a USDC trustline and is ready to receive funds.",
              `Fund it with testnet USDC at: https://faucet.circle.com`,
              "Select 'Stellar Testnet' and paste the public key above.",
              "",
              "Once funded, you can use mindvault_buy to purchase resources.",
            ].join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// Tool: Wallet info + balance
server.tool(
  "mindvault_wallet_info",
  "Check the agent's Stellar wallet address and USDC balance",
  {},
  async () => {
    const wallet = loadWallet();
    if (!wallet) {
      return {
        content: [{ type: "text" as const, text: "No wallet configured. Run mindvault_setup_wallet first." }],
      };
    }

    try {
      const horizon = new Horizon.Server(HORIZON_URL);
      const account = await horizon.loadAccount(wallet.publicKey);

      const usdc = account.balances.find(
        (b: any) => b.asset_code === "USDC"
      );
      const xlm = account.balances.find(
        (b: any) => b.asset_type === "native"
      );

      return {
        content: [
          {
            type: "text" as const,
            text: [
              `Wallet: ${wallet.publicKey}`,
              `USDC Balance: ${usdc ? (usdc as any).balance : "0"} USDC`,
              `XLM Balance: ${xlm ? (xlm as any).balance : "0"} XLM`,
              `Created: ${wallet.createdAt}`,
              `MindVault API: ${MINDVAULT_API}`,
            ].join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Wallet: ${wallet.publicKey}\nError fetching balance: ${err.message}` }],
      };
    }
  }
);

// Tool: Browse catalog
server.tool(
  "mindvault_browse",
  "Browse available resources in the MindVault catalog. Returns listed resources with titles, prices, and descriptions.",
  {},
  async () => {
    try {
      const res = await fetch(`${MINDVAULT_API}/resources`);
      const resources = await res.json();

      if (!Array.isArray(resources) || resources.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No resources listed in the vault." }],
        };
      }

      const listing = resources.map((r: any, i: number) =>
        `${i + 1}. ${r.title}\n   Price: $${r.price} USDC | Type: ${r.resourceType} | By: ${r.publisherName}\n   ID: ${r.id}${r.description ? `\n   ${r.description}` : ""}`
      ).join("\n\n");

      return {
        content: [{ type: "text" as const, text: `MindVault Catalog (${resources.length} resources):\n\n${listing}` }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error browsing catalog: ${err.message}` }],
      };
    }
  }
);

// Tool: Preview resource
server.tool(
  "mindvault_preview",
  "Get detailed information about a specific resource including price, publisher, and verification status",
  { resource_id: z.string().describe("The resource ID to preview") },
  async ({ resource_id }) => {
    try {
      const res = await fetch(`${MINDVAULT_API}/resources/${resource_id}/meta`);
      if (!res.ok) {
        return { content: [{ type: "text" as const, text: "Resource not found." }] };
      }

      const r = await res.json();
      return {
        content: [
          {
            type: "text" as const,
            text: [
              `Title: ${r.title}`,
              `Description: ${r.description || "None"}`,
              `Price: $${r.price} USDC`,
              `Type: ${r.resourceType}`,
              `Publisher: ${r.publisherName}`,
              `Verification: ${r.verificationStatus}`,
              `Access URL: ${MINDVAULT_API}/resources/${r.id}`,
              "",
              "Use mindvault_buy with this resource_id to purchase and access it.",
            ].join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// Tool: Buy resource via x402
server.tool(
  "mindvault_buy",
  "Pay for and access a MindVault resource using x402 on Stellar. Automatically handles the HTTP 402 payment flow — signs a USDC payment and retrieves the resource content.",
  { resource_id: z.string().describe("The resource ID to purchase") },
  async ({ resource_id }) => {
    const wallet = loadWallet();
    if (!wallet) {
      return {
        content: [{ type: "text" as const, text: "No wallet configured. Run mindvault_setup_wallet first." }],
      };
    }

    try {
      const paidFetch = createPaidFetch(wallet.secretKey);
      const res = await paidFetch(`${MINDVAULT_API}/resources/${resource_id}`);

      if (!res.ok) {
        const body = await res.text();
        return {
          content: [{ type: "text" as const, text: `Payment or access failed (${res.status}): ${body}` }],
        };
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();

        let text = "Resource accessed successfully.\n\n";
        if (data.receipt) {
          text += `Payment Receipt:\n  Amount: $${data.receipt.amount} USDC\n  Paid To: ${data.receipt.paidTo}\n  Payment ID: ${data.receipt.paymentId}\n  Date: ${data.receipt.paidAt}\n\n`;
        }
        if (data.url) {
          text += `Resource URL: ${data.url}`;
        } else {
          text += `Content: ${JSON.stringify(data, null, 2)}`;
        }

        return { content: [{ type: "text" as const, text }] };
      } else {
        const blob = await res.blob();
        return {
          content: [
            {
              type: "text" as const,
              text: `File downloaded successfully.\nSize: ${blob.size} bytes\nType: ${contentType}\nPayment completed via x402 on Stellar.`,
            },
          ],
        };
      }
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// Tool: Register as publisher
server.tool(
  "mindvault_register",
  "Register as a publisher on MindVault using the agent's wallet address. Returns an API key for publishing resources.",
  {
    name: z.string().describe("Publisher name"),
    email: z.string().describe("Contact email"),
  },
  async ({ name, email }) => {
    const wallet = loadWallet();
    if (!wallet) {
      return {
        content: [{ type: "text" as const, text: "No wallet configured. Run mindvault_setup_wallet first." }],
      };
    }

    try {
      const res = await fetch(`${MINDVAULT_API}/publishers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          walletAddress: wallet.publicKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { content: [{ type: "text" as const, text: `Registration failed: ${data.error}` }] };
      }

      // Save API key to wallet file
      const walletConfig = loadWallet()!;
      walletConfig.apiKey = data.apiKey;
      walletConfig.publisherName = data.name;
      saveWallet(walletConfig);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              "Registered as publisher.",
              "",
              `Name: ${data.name}`,
              `Wallet: ${data.walletAddress}`,
              `API Key: ${data.apiKey}`,
              "",
              "API key saved. You can now use mindvault_publish to publish resources.",
            ].join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }] };
    }
  }
);

// Tool: Publish resource + pay for verification
server.tool(
  "mindvault_publish",
  "Publish a resource to MindVault and pay for AI verification via x402. The agent's wallet pays the verification fee in USDC.",
  {
    title: z.string().describe("Resource title"),
    description: z.string().optional().describe("Resource description"),
    price: z.string().describe("Price in USDC (e.g. '0.50')"),
    externalUrl: z.string().describe("URL to the resource"),
  },
  async ({ title, description, price, externalUrl }) => {
    const wallet = loadWallet();
    if (!wallet) {
      return {
        content: [{ type: "text" as const, text: "No wallet configured. Run mindvault_setup_wallet first." }],
      };
    }

    const apiKey = wallet.apiKey;
    if (!apiKey) {
      return {
        content: [{ type: "text" as const, text: "Not registered as publisher. Run mindvault_register first." }],
      };
    }

    try {
      // Step 1: Publish the resource
      const pubRes = await fetch(`${MINDVAULT_API}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ title, description, price, externalUrl }),
      });

      const resource = await pubRes.json();
      if (!pubRes.ok) {
        return { content: [{ type: "text" as const, text: `Publish failed: ${resource.error}` }] };
      }

      // Step 2: Pay for verification via x402
      const paidFetch = createPaidFetch(wallet.secretKey);
      const content = [
        `Title: ${title}`,
        description ? `Description: ${description}` : null,
        `URL: ${externalUrl}`,
        `Price: $${price} USDC`,
      ].filter(Boolean).join("\n");

      const verifyRes = await paidFetch(`${MINDVAULT_API}/verify-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, resourceId: resource.id }),
      });

      let verifyResult = null;
      if (verifyRes.ok) {
        verifyResult = await verifyRes.json();
      }

      return {
        content: [
          {
            type: "text" as const,
            text: [
              "Resource published and verification paid.",
              "",
              `Resource ID: ${resource.id}`,
              `Title: ${title}`,
              `Price: $${price} USDC`,
              `Access URL: ${MINDVAULT_API}/resources/${resource.id}`,
              "",
              verifyResult
                ? `Verification: ${verifyResult.isOriginal ? "PASSED" : "REJECTED"} (${Math.round(verifyResult.confidence * 100)}% confidence)`
                : "Verification: Payment submitted, awaiting result.",
              verifyResult?.flags?.length
                ? `Flags: ${verifyResult.flags.join(", ")}`
                : "",
            ].filter(Boolean).join("\n"),
          },
        ],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error: ${err.message}` }] };
    }
  }
);

// Tool: Agent status
server.tool(
  "mindvault_agent_status",
  "Check the MindVault verification agent's status, earnings, and recent activity",
  {},
  async () => {
    try {
      const res = await fetch(`${MINDVAULT_API}/agent/status`);
      const data = await res.json();

      const { agent, stats, recentActivity } = data;

      let text = [
        `Agent: ${agent.name}`,
        `Status: ${agent.status}`,
        `Wallet: ${agent.walletAddress}`,
        `Price: $${agent.pricePerVerification} ${agent.currency} per verification`,
        "",
        `Total Verifications: ${stats.totalVerifications}`,
        `Verified: ${stats.verified} | Rejected: ${stats.rejected}`,
        `Total Earned: $${stats.totalEarned} ${agent.currency}`,
        `Avg Confidence: ${stats.avgConfidence}`,
      ].join("\n");

      if (recentActivity.length > 0) {
        text += "\n\nRecent Activity:";
        for (const a of recentActivity.slice(0, 5)) {
          text += `\n  ${a.isOriginal ? "PASS" : "FAIL"} | ${a.resourceTitle} | ${Math.round(a.confidence * 100)}% confidence`;
        }
      }

      return { content: [{ type: "text" as const, text }] };
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  }
);

// Start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
