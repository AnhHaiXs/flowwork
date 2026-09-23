# Smart Contract — FlowWork.sol

## Tổng quan

- **File:** `contracts/FlowWork.sol`
- **Language:** Solidity `^0.8.20`
- **Chain:** Arc Testnet (Chain ID: 5042002)
- **USDC Token:** `0x3600000000000000000000000000000000000000` (6 decimals)
- **Inherits:** `ReentrancyGuard` (OpenZeppelin 5.1.0)
- **Pattern thanh toán:** Pull-payment (pendingWithdrawals)

---

## Trạng thái Agreement

```
Open → Active → Completed
             ↓
          Disputed → Cancelled (forceCloseDispute sau 30 ngày)
             ↓
           (arbiter approve) → Active/Completed
Open → Cancelled (client hủy ngay)
Active → Cancelled (client hủy sau deadline)
```

| Enum | Giá trị | Mô tả |
|---|---|---|
| `Open` | 0 | Đã tạo, chờ contributor accept |
| `Active` | 1 | Contributor đã accept, đang thực hiện |
| `Completed` | 2 | Tất cả milestones approved |
| `Cancelled` | 3 | Đã hủy, tiền hoàn về client |
| `Disputed` | 4 | Đang tranh chấp, chờ arbiter |

## Trạng thái Milestone

| Enum | Giá trị | Mô tả |
|---|---|---|
| `Pending` | 0 | Chờ contributor submit |
| `Submitted` | 1 | Contributor đã submit delivery hash |
| `Approved` | 2 | Client/arbiter đã approve, USDC credited |
| `Disputed` | 3 | Client đã dispute, chờ arbiter |

---

## State variables

| Variable | Type | Mô tả |
|---|---|---|
| `usdc` | `IERC20 immutable` | Địa chỉ USDC token (set khi deploy) |
| `agreementCount` | `uint256` | Bắt đầu từ 1, tăng dần |
| `DISPUTE_TIMEOUT` | `uint256 constant` | 30 days |
| `_agreements` | `mapping(uint256 => Agreement)` | Private, tất cả agreements |
| `_milestonesByAgreement` | `mapping(uint256 => Milestone[])` | Private, milestones theo agreementId |
| `_clientAgreements` | `mapping(address => uint256[])` | IDs theo địa chỉ client |
| `_contributorAgreements` | `mapping(address => uint256[])` | IDs theo địa chỉ contributor |
| `pendingWithdrawals` | `mapping(address => uint256) public` | USDC chờ rút (pull-payment) |

---

## Functions

### Write functions

#### `createAgreement(contributor, arbiter, title, milestoneAmounts[], milestoneTitles[], deadline)`
- Caller: Client
- Guard: `nonReentrant`
- Validation: contributor != address(0), contributor != caller, title ≤ 100 chars, 1–5 milestones, tất cả amount > 0, deadline == 0 hoặc > now
- Effect: lock USDC (`safeTransferFrom`), tạo Agreement + Milestones, emit `AgreementCreated`
- Balance check: `balanceBefore/After` để guard fee-on-transfer tokens
- USDC amount phải được approve trước

#### `acceptAgreement(agreementId)`
- Caller: Contributor
- Điều kiện: status == Open
- Effect: status → Active, emit `AgreementAccepted`

#### `submitDelivery(agreementId, milestoneIndex, deliveryHash)`
- Caller: Contributor
- Điều kiện: status == Active, milestone.status == Pending, deliveryHash != bytes32(0)
- Effect: milestone.status → Submitted, lưu hash + timestamp, emit `DeliverySubmitted`

#### `approveMilestone(agreementId, milestoneIndex)`
- Caller: Client (khi Active) hoặc Arbiter (khi Disputed)
- Guard: `nonReentrant`
- Effect: milestone.status → Approved, `pendingWithdrawals[contributor] += amount`, nếu tất cả approved → status = Completed, emit `MilestoneApproved`

#### `disputeMilestone(agreementId, milestoneIndex)`
- Caller: Client
- Điều kiện: status == Active, milestone.status == Submitted, **arbiter != address(0)** (bắt buộc)
- Effect: milestone.status → Disputed, agreement.status → Disputed, emit `MilestoneDisputed`

#### `forceCloseDispute(agreementId)`
- Caller: Client
- Guard: `nonReentrant`
- Điều kiện: status == Disputed, block.timestamp > updatedAt + 30 days
- Effect: status → Cancelled, `pendingWithdrawals[client] += unreleased`, emit `AgreementCancelled`

#### `cancelAgreement(agreementId)`
- Caller: Client
- Guard: `nonReentrant`
- Nhánh Open: hoàn toàn bộ totalAmount
- Nhánh Active: chỉ được khi deadline != 0 && block.timestamp > deadline, hoàn unreleased amount
- Effect: status → Cancelled, credit pendingWithdrawals, emit `AgreementCancelled`

#### `withdraw()`
- Caller: Bất kỳ ai có `pendingWithdrawals > 0`
- Guard: `nonReentrant`
- Effect: zero out balance → `safeTransfer` về caller, emit `WithdrawalClaimed`
- Pattern: Checks-Effects-Interactions để phòng reentrancy

### Read functions

| Function | Returns |
|---|---|
| `getAgreement(id)` | `Agreement memory` |
| `getMilestone(id, index)` | `Milestone memory` |
| `getMilestones(id)` | `Milestone[] memory` |
| `getClientAgreements(addr)` | `uint256[] memory` |
| `getContributorAgreements(addr)` | `uint256[] memory` |

---

## Events

| Event | Indexed fields |
|---|---|
| `AgreementCreated(id, client, contributor, totalAmount)` | id, client, contributor |
| `AgreementAccepted(id)` | id |
| `AgreementCompleted(id)` | id |
| `AgreementCancelled(id)` | id |
| `DeliverySubmitted(agreementId, milestoneIndex, deliveryHash)` | agreementId |
| `MilestoneApproved(agreementId, milestoneIndex, amount)` | agreementId |
| `MilestoneDisputed(agreementId, milestoneIndex)` | agreementId |
| `WithdrawalClaimed(recipient, amount)` | recipient |

---

## Security: những gì đã được xử lý

| Vấn đề | Giải pháp |
|---|---|
| Reentrancy | `ReentrancyGuard` trên tất cả write functions có transfer |
| Push payment bị block (blocklist) | Pull-payment pattern: tất cả USDC credit vào `pendingWithdrawals`, pull bằng `withdraw()` |
| Dispute không có lối thoát | `disputeMilestone` chỉ cho phép khi `arbiter != address(0)` |
| Arbiter offline/biến mất | `forceCloseDispute()` sau 30 ngày |
| Escrow lock khi active + không deadline | Client chỉ cancel active khi có deadline đã qua |
| Fee-on-transfer token | Balance check trước/sau `safeTransferFrom` |

## Vấn đề còn mở (được chấp nhận)

1. **Client inaction khi Active không deadline:** Nếu agreement Active và không có deadline, client không hành động → contributor bị kẹt. Giải pháp: luôn đặt deadline khi tạo agreement.
2. **Client cancel sau deadline với milestones đã submitted:** Client có thể lấy lại tiền dù contributor đã deliver. Giải pháp: hai bên thỏa thuận deadline hợp lý và contributor nên raise dispute kịp thời nếu có arbiter.

---

## Build & Test

```bash
bun run contracts:build   # forge build
bun run contracts:test    # forge test
```

Artifact: `contracts/out/FlowWork.sol/FlowWork.json`
