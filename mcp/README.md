# MindVault MCP Server

An MCP server that lets AI agents browse and buy MindVault resources using x402 payments on Stellar.

## What it does

This server exposes MindVault's vault as tools that any MCP-enabled AI system can use. An agent can set up a Stellar wallet, browse available resources, and pay USDC to access them — all through natural conversation.

## Tools

| Tool | Description |
|------|-------------|
| `mindvault_setup_wallet` | Create a Stellar wallet using the sponsored account protocol. No XLM needed. |
| `mindvault_wallet_info` | Check wallet address and USDC balance |
| `mindvault_browse` | List all available resources in the vault |
| `mindvault_preview` | Get details and price for a specific resource |
| `mindvault_buy` | Pay USDC via x402 and retrieve the resource |
| `mindvault_agent_status` | Check the verification agent's earnings and activity |

## Setup

```bash
cd mcp
pnpm install
pnpm build
```

### Claude Code

```bash
claude mcp add mindvault node /path/to/mindVault/mcp/dist/index.js
```

### Codex

```bash
codex mcp add mindvault -- node /path/to/mindVault/mcp/dist/index.js
```

### Custom API endpoint

By default the server points to the public MindVault API. To use a different instance:

```bash
claude mcp add mindvault -e MINDVAULT_API=https://your-server.com node /path/to/mindVault/mcp/dist/index.js
```

## First use

1. Start a new conversation with your AI assistant
2. Ask it to set up a MindVault wallet
3. The agent creates a sponsored Stellar wallet (USDC trustline included, no XLM required)
4. Fund the wallet with testnet USDC at https://faucet.circle.com (select Stellar Testnet)
5. Ask the agent to browse and buy resources

## How payments work

When the agent calls `mindvault_buy`, it hits the resource URL and receives an HTTP 402 with payment instructions. The x402 client automatically signs a USDC payment on Stellar and retries the request. The resource is delivered after on-chain settlement. The agent's wallet key is stored locally at `~/.mindvault-agent-wallet.json`.
