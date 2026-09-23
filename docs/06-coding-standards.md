# Coding Standards

## Naming Conventions (Quy tắc đặt tên)

### TypeScript / React

| Loại | Convention | Ví dụ |
|---|---|---|
| Component | PascalCase | `AgreementCard`, `MilestoneRow` |
| Hook | camelCase, prefix `use` | `useFlowWork`, `useAgreement` |
| Utility function | camelCase | `formatUsdc`, `parseOnchainError` |
| Type / Interface | PascalCase | `Agreement`, `MilestoneStatus` |
| Enum | PascalCase (type) + PascalCase (member) | `AgreementStatus.Active` |
| Constant | SCREAMING_SNAKE_CASE | `FLOWWORK_ADDRESS`, `USDC_DECIMALS` |
| Props interface | `{ComponentName}Props` | `AgreementCardProps` |
| CSS variable | kebab-case, `--` prefix | `--accent`, `--surface-muted` |
| File: component | PascalCase.tsx | `AgreementCard.tsx` |
| File: hook | camelCase.ts | `useFlowWork.ts` |
| File: util | camelCase.ts | `utils.ts` |
| File: view | PascalCase.tsx, trong `views/` | `Dashboard.tsx` |

### Solidity

| Loại | Convention | Ví dụ |
|---|---|---|
| Contract | PascalCase | `FlowWork` |
| Function (public/external) | camelCase | `createAgreement`, `withdraw` |
| Function (internal/private) | camelCase, `_` prefix | `_requireAgreement` |
| State variable (private mapping) | camelCase, `_` prefix | `_agreements` |
| State variable (public) | camelCase | `agreementCount`, `pendingWithdrawals` |
| Constant | SCREAMING_SNAKE_CASE | `DISPUTE_TIMEOUT` |
| Struct | PascalCase | `Agreement`, `Milestone` |
| Enum | PascalCase | `AgreementStatus` |
| Enum value | PascalCase | `AgreementStatus.Open` |
| Event | PascalCase | `AgreementCreated` |
| Error message | `"ContractName: description"` | `"FlowWork: only client"` |
| Modifier | camelCase | `nonReentrant` |

---

## TypeScript Rules

### Strict mode
- `tsconfig.json` bật `strict: true` — không có `any` ngầm định
- Phải khai báo kiểu rõ ràng cho props, state, function return
- `// eslint-disable-next-line @typescript-eslint/no-explicit-any` chỉ khi bắt buộc (raw contract data)

### Bigint handling
```ts
// Đúng: dùng BigInt arithmetic
const total = amounts.reduce((sum, a) => sum + a, 0n)

// Sai: ép kiểu sang number rồi tính
const total = amounts.reduce((sum, a) => sum + Number(a), 0)
```

Khi cần display, dùng `formatUsdc(bigintValue)` từ `utils.ts`.

### Import order
```ts
// 1. React
import { useState, useEffect } from 'react'
// 2. Third-party
import { useAccount, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
// 3. Internal absolute (@/)
import { AppView } from '@/types'
import { FLOWWORK_ABI, FLOWWORK_ADDRESS } from '@/contract'
// 4. Internal relative
import { AgreementCard } from './AgreementCard'
```

### Hooks pattern
```ts
// Một hook = một concern
export function useAgreement(id: bigint | undefined) { ... }
export function useMilestones(agreementId: bigint | undefined) { ... }
export function useUsdcBalance(address: `0x${string}` | undefined) { ... }
```

---

## React Rules

### Component size
- Mỗi component tối đa ~200–300 dòng. Lớn hơn → tách ra component con.
- Views (Dashboard, CreateAgreement, v.v.) có thể đến ~400 dòng vì chứa nhiều logic.

### State management
- Local state với `useState` cho UI state (form, expanded, step)
- Không có global state (Redux, Zustand) — contract reads là source of truth
- `useReadContract` / `useReadContracts` từ wagmi cho onchain data

### Side effects
```ts
// Đúng: dùng useEffect cho reactions to async
useEffect(() => {
  if (isApproveSuccess) {
    toast.success('USDC approved')
    refetchAllowance()
    setStep('create')
  }
}, [isApproveSuccess])

// Sai: gọi toast trực tiếp trong render
if (isApproveSuccess) toast.success('...') // runs every render
```

### Key prop
```tsx
// Dùng stable unique key — không dùng index nếu list có thể reorder
{agreements.map((a) => (
  <AgreementCard key={String(a.id)} agreement={a} />
))}
```

---

## CSS / Tailwind Rules

- **Không tạo CSS file mới** — dùng Tailwind utilities + inline style cho dynamic values
- **Inline style chỉ cho design tokens và dynamic values:**
  ```tsx
  style={{ color: 'var(--ink)', width: `${progress}%` }}
  ```
- **Không hardcode hex colors trong JSX** — luôn dùng CSS variables
- **Không dùng `@apply`** ngoại trừ `.input-field` đã có trong `index.css`
- **Responsive:** mobile-first, breakpoint `lg:` cho desktop adjustments

---

## Contract Coding Rules (Solidity)

### Checks-Effects-Interactions
```solidity
// Luôn theo thứ tự: kiểm tra → cập nhật state → gọi external
function withdraw() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender]; // check
    pendingWithdrawals[msg.sender] = 0;              // effect
    usdc.safeTransfer(msg.sender, amount);           // interaction
    emit WithdrawalClaimed(msg.sender, amount);
}
```

### Guard pattern
```solidity
// Dùng internal helper để validate và return storage ref
function _requireAgreement(uint256 id) internal view returns (Agreement storage) {
    Agreement storage a = _agreements[id];
    require(a.id != 0, "FlowWork: agreement does not exist");
    return a;
}
```

### Error messages
- Format: `"ContractName: description ngắn gọn"`
- Không dùng custom errors (để dễ debug với wagmi/viem)

### nonReentrant
- Bắt buộc cho mọi function có `safeTransfer` hoặc `safeTransferFrom`
- Không cần cho pure read functions

---

## Quy tắc Commit

### Format
```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types

| Type | Khi nào dùng |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor code, không thêm feature/fix bug |
| `style` | Thay đổi UI/CSS thuần túy |
| `contract` | Thay đổi smart contract |
| `docs` | Cập nhật documentation |
| `chore` | Config, deps, tooling |
| `test` | Thêm/sửa tests |

### Ví dụ

```
feat(create): add deadline validation to CreateAgreement form
fix(milestone): prevent submit button flash when tx confirming
contract(flowwork): add forceCloseDispute with 30-day timeout
docs: add smart contract reference and feature descriptions
chore: pin @openzeppelin/contracts to 5.1.0
```

### Quy tắc
- Subject line: tối đa 72 ký tự, lowercase, không có dấu chấm cuối
- Imperative mood: "add feature" không phải "added feature"
- Body: giải thích WHY nếu cần, không phải WHAT (code đã nói rồi)
- Mỗi commit = một logical change. Không gộp nhiều thứ không liên quan.

---

## Quy trình Review

### Trước khi tạo PR / merge

Chạy bắt buộc:
```bash
bun run check          # lint + typecheck
bun run contracts:build  # forge build (nếu có thay đổi contract)
bun run contracts:test   # forge test (nếu có thay đổi contract)
```

Tất cả phải pass — không có errors (warnings được chấp nhận).

### Checklist PR

**Frontend:**
- [ ] Lint pass, typecheck pass
- [ ] Không có `any` mới (trừ khi có comment giải thích)
- [ ] Design tokens được dùng, không hardcode màu
- [ ] Responsive (mobile + desktop) đã test
- [ ] Loading states và error states được handle
- [ ] Toast notification phù hợp sau action onchain
- [ ] Explorer links cho transactions quan trọng

**Smart Contract:**
- [ ] `forge build` pass
- [ ] `forge test` pass
- [ ] Checks-Effects-Interactions được tuân thủ
- [ ] `nonReentrant` trên mọi function có transfer
- [ ] Error messages theo format `"FlowWork: ..."`
- [ ] Events emit đầy đủ sau state changes

---

## Tiêu chuẩn chất lượng

### Code quality
- Zero TypeScript errors (bắt buộc)
- Zero lint errors (bắt buộc)
- Lint warnings: acceptable nhưng cần giải thích trong PR
- Test coverage contract: happy path + revert paths cho mọi function

### UX quality
- Wallet không kết nối → WalletGate, không crash
- Contract chưa deploy → banner cảnh báo, không crash
- Transaction pending → loading state rõ ràng
- Transaction fail → toast với error message human-friendly
- Transaction success → toast success + explorer link

### Security
- Không log/expose private keys, entity secrets, API keys
- Không hardcode địa chỉ contract — dùng constant từ `contract.ts`
- Không trust user input trong contract — validate trước khi gọi
- Không `any` trên critical money path (amounts, addresses)

### Performance
- Contract reads sử dụng `useReadContracts` để batch khi có thể
- `query: { enabled: ... }` để skip reads khi không cần thiết
- Không re-render không cần thiết (memo khi cần)
