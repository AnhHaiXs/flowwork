# FlowWork — Documentation

> Onchain freelance escrow on Arc Testnet. USDC-powered, milestone-based, trustless.

## Tài liệu

| File | Nội dung |
|---|---|
| [01-project-overview.md](./01-project-overview.md) | Mục tiêu, tầm nhìn, phạm vi MVP, non-goals |
| [02-features.md](./02-features.md) | Mô tả chi tiết từng tính năng (F1–F8) |
| [03-smart-contract.md](./03-smart-contract.md) | FlowWork.sol: state machine, functions, events, security |
| [04-tech-stack.md](./04-tech-stack.md) | Stack đầy đủ, project structure, dependencies |
| [05-design-system.md](./05-design-system.md) | Design tokens, typography, dark mode, components, UX |
| [06-coding-standards.md](./06-coding-standards.md) | Naming, coding rules, commit convention, review process |
| [07-changelog.md](./07-changelog.md) | Lịch sử thay đổi theo version |

---

## Truy cập tài liệu trong app

Tài liệu được nhúng trực tiếp vào ứng dụng tại path **/docs** — click tab **Docs** trên thanh navigation để đọc toàn bộ tài liệu ngay trong giao diện.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build + test contracts
forge build
forge test

# Lint + typecheck
bun run check
```

## Chain

| | |
|---|---|
| Network | Arc Testnet |
| Chain ID | 5042002 |
| USDC | `0x3600000000000000000000000000000000000000` |
| FlowWork Contract | `0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7` |
| Explorer | https://explorer.testnet.arc.io |

---

## Luồng hoạt động tóm tắt

```
Client                    Contract                  Contributor
  │                          │                          │
  ├─ approve(USDC) ─────────>│                          │
  ├─ createAgreement() ─────>│ lock USDC                │
  │                          │<─── acceptAgreement() ───┤
  │                          │<─── submitDelivery() ────┤
  ├─ approveMilestone() ────>│ credit pendingWithdrawals│
  │                          │<─── withdraw() ──────────┤ pull USDC
  ├─ [all approved] ────────>│ status = Completed       │
```

Nếu có tranh chấp (yêu cầu có arbiter):
```
Client                    Contract                  Arbiter
  │                          │                          │
  ├─ disputeMilestone() ────>│ status = Disputed        │
  │                          │<─── approveMilestone() ──┤
  │                          │ credit contributor       │
```

Nếu arbiter không hành động trong 30 ngày:
```
Client                    Contract
  ├─ forceCloseDispute() ──>│ refund unreleased USDC to pendingWithdrawals
  │                          │ status = Cancelled
```
