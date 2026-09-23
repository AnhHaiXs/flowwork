# FlowWork

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** - what Arc Studio remembers about building this app. It helps future agents (or humans) understand and extend the project.

---

## What This App Does

FlowWork is an onchain freelance escrow platform. A client locks USDC in escrow, defines up to 5 milestones with individual amounts, and a contributor accepts the agreement and submits delivery hashes onchain for each milestone. The client approves each milestone to release USDC to the contributor. Disputes are resolved by an optional arbiter; a 30-day force-close timeout protects against arbiter inaction.

## Deployed Contracts

| Contract | Network | Address | Explorer |
|---|---|---|---|
| FlowWork | Arc Testnet | `0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7` | [View](https://explorer.testnet.arc.io/address/0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7) |

Constructor arg: `usdcToken = 0x3600000000000000000000000000000000000000` (USDC on Arc Testnet)

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```
