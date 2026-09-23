# FlowWork — Project Overview

## Mục tiêu dự án

FlowWork là một ứng dụng escrow phi tập trung (dApp) chạy trên **Arc Testnet**, cho phép hai bên (client và contributor) ký kết và thực thi hợp đồng công việc hoàn toàn onchain thông qua USDC.

Vấn đề cốt lõi mà FlowWork giải quyết:

- **Freelancer bị quỵt tiền** sau khi hoàn thành công việc, vì không có cơ chế đảm bảo thanh toán.
- **Client bị mất tiền cọc** khi contributor không giao hàng và biến mất.
- **Không có bằng chứng onchain** về việc giao hàng hay thanh toán.
- **Tranh chấp thiếu trọng tài minh bạch** — mọi thứ diễn ra off-chain, dễ gian lận.

FlowWork giải quyết bằng cách:

1. Client lock USDC vào smart contract escrow ngay khi tạo agreement.
2. USDC chỉ được giải phóng khi client approve từng milestone cụ thể.
3. Contributor submit delivery hash onchain — bằng chứng vĩnh viễn, không thể giả mạo.
4. Nếu tranh chấp, một arbiter độc lập có quyền phán quyết (approve hoặc giữ lại).
5. Mọi hành động đều là giao dịch onchain, hoàn toàn minh bạch và kiểm chứng được.

---

## Tầm nhìn sản phẩm

> "Biến mọi hợp đồng công việc thành một thỏa thuận bất biến giữa hai địa chỉ ví — không cần tin tưởng, không cần trung gian, chỉ cần code."

**Đối tượng người dùng mục tiêu:**

| Vai trò | Mô tả |
|---|---|
| **Client** | Người thuê công việc, lock USDC trả trước, approve khi hài lòng |
| **Contributor** | Freelancer / contractor, submit delivery hash onchain, nhận USDC sau approval |
| **Arbiter** | Bên thứ ba trung lập (tùy chọn), phán quyết tranh chấp khi hai bên không đồng ý |

---

## Phạm vi MVP

- Tạo agreement với tối đa 5 milestones, mỗi milestone có số USDC riêng
- Contributor accept agreement onchain
- Contributor submit delivery hash (URL, IPFS CID, text) cho từng milestone
- Client approve từng milestone, giải phóng USDC (pull-payment)
- Client dispute milestone nếu có arbiter được chỉ định
- Arbiter phán quyết milestone bị dispute
- Client hủy agreement (khi Open hoặc Active sau deadline)
- Client force-close dispute sau 30 ngày arbiter không hành động
- Rút USDC về ví (pull-payment pattern)
- Dashboard thống kê: balance, active/completed count, in-escrow USDC

---

## Non-goals (ngoài phạm vi)

- Không có hệ thống reputation hay rating
- Không có chat hay nhắn tin trong app
- Không có multi-sig hay DAO governance
- Không có mainnet (chỉ Arc Testnet)
- Không có file storage (chỉ hash/URL, không lưu file thực)
- Không có notifications real-time (không có backend)
