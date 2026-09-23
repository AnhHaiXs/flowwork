# Tech Stack

## Frontend

| Thư viện | Version | Mục đích |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | ~7.0 | Type safety |
| Vite | ^6.0 | Build tool + HMR dev server |
| Tailwind CSS | ^3.4 | Utility-first CSS |
| DM Sans | font | Body text |
| Space Grotesk | font | Display headings (`.display`) |
| JetBrains Mono | font | Addresses, hash, code (`.mono`) |

## Onchain / Web3

| Thư viện | Version | Mục đích |
|---|---|---|
| wagmi | ^2.19 | React hooks cho EVM (useReadContract, useWriteContract, v.v.) |
| viem | ^2.56 | Low-level EVM client |
| ConnectKit | ^1.9 | Wallet connection modal UI |
| @tanstack/react-query | ^5.62 | Data fetching, cache cho contract reads |
| @web3icons/react | ^4.0 | Token icons (USDC badge) |

## Smart Contract

| Tool | Version | Mục đích |
|---|---|---|
| Solidity | ^0.8.20 | Contract language |
| Foundry (forge) | latest | Compile + test |
| OpenZeppelin Contracts | 5.1.0 | ReentrancyGuard, IERC20, SafeERC20 |

> OpenZeppelin bị pin ở 5.1.0 vì từ 5.2.0 có `mcopy` opcode (Cancun EVM) không tương thích với Arc Testnet (Paris EVM target).

## UI Components

| Thư viện | Mục đích |
|---|---|
| lucide-react | Icon set (size, stroke-based SVG) |
| sonner | Toast notifications |
| framer-motion | Có sẵn (chưa dùng, sẵn sàng cho animation) |

## Dev Tools

| Tool | Mục đích |
|---|---|
| oxlint | Linter (fast, no eslint) |
| bun | Package manager + runtime |
| TypeScript strict mode | Type checking |
| `bun run check` | Chạy lint + typecheck cùng lúc |

## Chain

| | Giá trị |
|---|---|
| Network | Arc Testnet |
| Chain ID | 5042002 |
| Native gas | USDC (Arc đặc biệt: gas token = USDC) |
| USDC ERC-20 | `0x3600000000000000000000000000000000000000` |
| USDC Decimals | 6 |
| Explorer | https://explorer.testnet.arc.io |

## Project structure

```
/home/user/app/
├── src/
│   ├── App.tsx                   # Router/shell (thin composition root)
│   ├── main.tsx                  # Entry point, providers
│   ├── config.ts                 # wagmi config (chains, connectors)
│   ├── contract.ts               # ABI + contract address constants
│   ├── types.ts                  # Domain types (Agreement, Milestone, enums, AppView)
│   ├── utils.ts                  # Pure helpers (format, parse, encode)
│   ├── onchain-facts.ts          # Chain/token registry (generated)
│   ├── onchain-money.ts          # Amount parsing/formatting (generated)
│   ├── onchain-wait.ts           # Transaction state machine (generated)
│   ├── index.css                 # Tailwind + design tokens (CSS vars)
│   ├── components/
│   │   ├── Layout.tsx            # Shell: header + mobile bottom nav
│   │   ├── WalletGate.tsx        # HOC: require connected wallet
│   │   ├── AgreementCard.tsx     # Summary card cho list/dashboard
│   │   ├── MilestoneRow.tsx      # Expandable row với actions
│   │   ├── StatusBadge.tsx       # Agreement/Milestone status pills
│   │   ├── TxButton.tsx          # Button với pending/confirming states
│   │   └── EmptyState.tsx        # Empty state pattern
│   └── views/
│       ├── Dashboard.tsx         # F1: Overview + stats
│       ├── AgreementList.tsx     # F2: Danh sách + filter
│       ├── CreateAgreement.tsx   # F3: Form tạo agreement
│       ├── AgreementDetail.tsx   # F4: Chi tiết + actions
│       └── Profile.tsx           # F6: Ví + withdraw
├── contracts/
│   ├── FlowWork.sol              # Smart contract chính
│   └── out/FlowWork.sol/         # Foundry artifacts
├── docs/                         # Project documentation (đây)
├── AGENTS.md                     # Project memory (Arc Studio)
└── package.json
```
