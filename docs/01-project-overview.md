# FlowWork — Project Overview

## Mục tiêu dự án

FlowWork là một ứng dụng escrow phi tập trung (dApp) chạy trên **Arc Testnet**, cho phép hai bên (client và contributor) ký kết và thực thi hợp đồng công việc hoàn toàn onchain thông qua USDC.

### Vấn đề cốt lõi

| Vấn đề | Hiện tại | FlowWork giải quyết |
|---|---|---|
| Freelancer bị quỵt tiền | Không có cơ chế đảm bảo | USDC lock trước, chỉ release khi approve |
| Client mất tiền cọc | Contributor biến mất | Cancellation refund khi Open/sau deadline |
| Không có bằng chứng giao hàng | Thoả thuận miệng, off-chain | Delivery hash onchain, bất biến |
| Tranh chấp không minh bạch | Không có trọng tài trung lập | Arbiter onchain, phán quyết onchain |

### Cách FlowWork giải quyết

1. Client lock USDC vào smart contract escrow ngay khi tạo agreement.
2. USDC chỉ được giải phóng khi client approve từng milestone.
3. Contributor submit delivery hash onchain — bằng chứng vĩnh viễn, không thể giả mạo.
4. Nếu tranh chấp, arbiter độc lập có quyền phán quyết.
5. Mọi hành động là giao dịch onchain, hoàn toàn minh bạch và kiểm chứng được.

---

## Tầm nhìn sản phẩm

> "Biến mọi hợp đồng công việc thành một thỏa thuận bất biến giữa hai địa chỉ ví — không cần tin tưởng, không cần trung gian, chỉ cần code."

### Đối tượng người dùng

| Vai trò | Mô tả |
|---|---|
| **Client** | Người thuê công việc, lock USDC trả trước, approve khi hài lòng |
| **Contributor** | Freelancer / contractor, submit delivery hash onchain, nhận USDC sau approval |
| **Arbiter** | Bên thứ ba trung lập (tùy chọn), phán quyết tranh chấp khi hai bên không đồng ý |

---

## Phạm vi MVP (đã ship)

- [x] Tạo agreement với tối đa 5 milestones, mỗi milestone có số USDC riêng
- [x] Contributor accept agreement onchain
- [x] Contributor submit delivery hash (URL, IPFS CID, text) cho từng milestone
- [x] Client approve từng milestone, giải phóng USDC (pull-payment)
- [x] Client dispute milestone nếu có arbiter được chỉ định
- [x] Arbiter phán quyết milestone bị dispute
- [x] Client hủy agreement (khi Open hoặc Active sau deadline)
- [x] Client force-close dispute sau 30 ngày arbiter không hành động
- [x] Rút USDC về ví (pull-payment pattern via `withdraw()`)
- [x] Dashboard thống kê: balance, active/completed count, in-escrow USDC
- [x] Dark mode / Light mode với system preference detection
- [x] Footer 4 columns với onchain info
- [x] Vercel Analytics
- [x] Tài liệu đầy đủ tại `/docs`

---

## Non-goals (ngoài phạm vi)

- Không có hệ thống reputation hay rating
- Không có chat hay nhắn tin trong app
- Không có multi-sig hay DAO governance
- Không có mainnet (chỉ Arc Testnet)
- Không có file storage (chỉ hash/URL, không lưu file thực)
- Không có notifications real-time (không có backend)
- Không có contributor inaction timeout (audit finding được chấp nhận — xem `03-smart-contract.md`)

---

## Contract đã deploy

| | |
|---|---|
| Network | Arc Testnet |
| Address | `0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7` |
| ArcScan | https://explorer.testnet.arc.io/address/0x7bde6df4d2f103b69d1f4ae10f8f0f743a424ce7 |
| Source | `contracts/FlowWork.sol` |
