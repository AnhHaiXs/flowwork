# Tính năng — Chi tiết đầy đủ

## F1 — Dashboard (Tổng quan)

**Mô tả:** Màn hình chính sau khi kết nối ví. Hiển thị snapshot tổng quan về tình trạng agreements của user.

**Chi tiết:**
- Stat cards: USDC balance trong ví, số agreements Active, số Completed, tổng USDC đang in-escrow
- Recent agreements: 3 agreement mới nhất, click để vào detail
- "How FlowWork works" section: hiển thị khi chưa có agreement nào
- Banner cảnh báo khi contract chưa deploy
- Button "New agreement" dẫn đến Create view

**Dữ liệu từ contract:**
- `getClientAgreements(address)` + `getContributorAgreements(address)` → lấy danh sách ID
- `getAgreement(id)` × N → load từng agreement
- ERC-20 `balanceOf(address)` trên USDC token

---

## F2 — Agreement List (Danh sách)

**Mô tả:** Danh sách tất cả agreements mà user tham gia (với vai trò client hoặc contributor).

**Chi tiết:**
- Tab filter: All / As Client / As Contributor
- AgreementCard: title, status badge, progress bar, total amount, vai trò của user
- Click card → navigate đến AgreementDetail
- EmptyState khi chưa có agreement

---

## F3 — Create Agreement (Tạo thỏa thuận)

**Mô tả:** Form tạo mới một agreement. Client nhập thông tin, approve USDC, ký transaction.

**Chi tiết:**
- **Fields:**
  - Title: max 100 ký tự
  - Contributor address: địa chỉ ví của người làm việc (bắt buộc, không được là địa chỉ của chính mình)
  - Arbiter address: tùy chọn, để trống = không có trọng tài (lưu ý: nếu không có arbiter thì không thể dispute)
  - Deadline: date picker, tùy chọn
  - Milestones: 1–5 items, mỗi item có title và USDC amount
- **Flow 2 bước:**
  1. Nếu USDC allowance chưa đủ → "Approve USDC" (ERC-20 approve)
  2. "Create Agreement" (contract write, lock USDC)
- Hiển thị tổng USDC cần lock, so sánh với balance
- Validation realtime cho từng field
- Sau khi tạo → navigate sang AgreementDetail

**Gọi contract:**
- `USDC.approve(FlowWork, totalAmount)`
- `FlowWork.createAgreement(contributor, arbiter, title, amounts[], titles[], deadline)`

---

## F4 — Agreement Detail (Chi tiết thỏa thuận)

**Mô tả:** Màn hình trung tâm của app. Hiển thị đầy đủ trạng thái agreement và cho phép thực hiện các action theo vai trò.

**Chi tiết:**
- Header: title, status badge, vai trò của user (client/contributor/arbiter)
- Value card: total USDC, released USDC, progress bar, milestone count
- Parties card: địa chỉ client/contributor/arbiter với explorer link, ngày tạo, deadline
- Status callout: thông báo contextual theo trạng thái (waiting/disputed/completed/cancelled)
- **Milestones list:** danh sách tất cả milestones (expandable)
- Action buttons: Accept / Cancel (tùy theo status và role)

**Action theo role:**

| Trạng thái | Role | Action có thể làm |
|---|---|---|
| Open | Contributor | Accept Agreement |
| Open | Client | Cancel Agreement |
| Active | Contributor | Submit Delivery (từng milestone) |
| Active | Client | Approve Milestone, Dispute Milestone |
| Disputed | Arbiter | Approve Milestone |
| Disputed | Client | Force Close Dispute (sau 30 ngày) |
| Active + deadline qua | Client | Cancel Agreement (hoàn tiền phần chưa release) |

---

## F5 — MilestoneRow (Component tương tác milestone)

**Mô tả:** Row expandable trong AgreementDetail. Mỗi milestone là một đơn vị công việc độc lập.

**Chi tiết khi expanded:**
- Hiển thị delivery hash onchain (nếu đã submit)
- Ngày submit, ngày approved
- **Contributor:** input field để paste URL/CID/text → encode thành bytes32 → `submitDelivery()`
- **Client:** Approve & Release button → `approveMilestone()` → USDC credited vào `pendingWithdrawals`
- **Client:** Dispute button → `disputeMilestone()` (chỉ khi có arbiter)
- Explorer link sau khi approve

---

## F6 — Profile (Ví & rút tiền)

**Mô tả:** Màn hình quản lý ví và rút USDC từ `pendingWithdrawals`.

**Chi tiết:**
- Hiển thị địa chỉ ví
- USDC balance (ERC-20)
- **Pending Withdrawals:** số USDC chờ rút (từ milestone approval hoặc cancellation refund)
- Button "Withdraw USDC" → `FlowWork.withdraw()` → transfer USDC về ví
- Contract explorer link
- Disconnect wallet button

---

## F7 — Wallet Connection

**Mô tả:** Quản lý kết nối ví. WalletGate bảo vệ mọi view yêu cầu ví.

**Chi tiết:**
- ConnectKit modal (injected wallet: MetaMask, v.v.)
- WalletGate component: hiển thị prompt kết nối khi chưa connect
- Tự động nhận diện network Arc Testnet (Chain ID: 5042002)
- Header hiển thị ConnectButton

---

## F8 — Smart Contract: FlowWork.sol

Xem chi tiết tại `docs/03-smart-contract.md`.
