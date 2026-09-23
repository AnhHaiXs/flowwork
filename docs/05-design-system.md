# Design System & UI/UX Guidelines

## Tổng quan

FlowWork sử dụng **Arc Light Design System** — một hệ thống thiết kế tối giản, professional, được định nghĩa qua CSS custom properties (design tokens) và Tailwind utility classes. Không có component library bên ngoài (không dùng MUI, Chakra, shadcn, v.v.).

---

## Design Tokens (CSS Variables)

Tất cả tokens được khai báo trong `src/index.css` `:root {}`.

### Colors — Surfaces

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--bg` | `#ffffff` | Background trang |
| `--bg-gradient` | linear-gradient 3 stop | Body background gradient |
| `--surface` | `rgba(255,255,255,0.72)` | Card, panel background |
| `--surface-strong` | `rgba(255,255,255,0.90)` | Input fields, elevated elements |
| `--surface-muted` | `#f5f5f8` | Muted backgrounds, chips |

### Colors — Text

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--ink` | `#122d45` | Primary text, headings |
| `--ink-2` | `#334155` | Secondary text |
| `--muted` | `#6b6580` | Body text, descriptions |
| `--subtle` | `#8a849c` | Placeholders, labels, metadata |

### Colors — Borders

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--border` | `rgba(18,45,69,0.12)` | Default border |
| `--border-strong` | `rgba(25,53,77,0.50)` | Scrollbar, focused borders |

### Colors — Semantic

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--accent` | `#122d45` | Primary CTA, buttons, links |
| `--accent-hover` | `#1061a6` | Hover state cho accent |
| `--focus` | `#85b1ed` | Focus ring |
| `--success` | `#1a8047` | Approved, completed, positive |
| `--danger` | `#ba2b4c` | Error, disputed, destructive |
| `--warning` | `#b45309` | Warning, pending review |

### Colors — Status badges

| Token | Sử dụng |
|---|---|
| `--status-open` / `--status-open-bg` | Agreement Open |
| `--status-active` / `--status-active-bg` | Agreement Active |
| `--status-disputed-bg` | Agreement Disputed |
| `--status-review` / `--status-review-bg` | Milestone Submitted/Review |
| `--status-complete-bg` | Completed |

---

## Typography

### Font families

```css
body           → 'DM Sans', sans-serif        /* body text */
.display       → 'Space Grotesk', sans-serif  /* headings, numbers */
.mono          → 'JetBrains Mono', Menlo      /* addresses, hashes, code */
```

### Scale (Tailwind)

| Class | Size | Dùng cho |
|---|---|---|
| `text-xs` | 12px | Labels, metadata, captions |
| `text-sm` | 14px | Body text, form labels |
| `text-base` | 16px | Section headings |
| `text-lg` | 18px | Sub-headings |
| `text-xl` | 20px | Page headings (detail) |
| `text-2xl` | 24px | Page headings (dashboard) |
| `text-3xl` | 30px | Large numbers (value card) |

### Heading style

```tsx
<h1 className="display text-2xl font-700" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
  Overview
</h1>
```

Headings luôn dùng class `.display` + `letter-spacing: -0.02em` để có cảm giác tight, modern.

---

## Spacing

Dùng Tailwind spacing scale. Patterns thường gặp:

| Pattern | Class | Dùng khi |
|---|---|---|
| Card padding | `p-4` hoặc `p-5` | Cards thông thường |
| Section gap | `space-y-5` hoặc `space-y-6` | Giữa các sections trong page |
| Item gap | `gap-2` hoặc `gap-3` | Trong flex row |
| Page container | `max-w-2xl mx-auto px-4 lg:px-6 py-6` | Views |
| Dashboard | `max-w-4xl mx-auto px-4 lg:px-6 py-6` | Dashboard view |
| Mobile safe | `pb-24 lg:pb-8` | Tránh bottom nav trên mobile |

---

## Border Radius

| Pattern | Value | Dùng khi |
|---|---|---|
| Card lớn | `rounded-2xl` | Cards, sections chính |
| Card nhỏ | `rounded-xl` | Milestone rows, inner elements |
| Button | `rounded-xl` | Primary/outline buttons |
| Badge | `rounded-full` | Status pills |
| Input | `rounded-[12px]` (`.input-field`) | Form inputs |

---

## Components chuẩn

### Card

```tsx
<div
  className="rounded-2xl border p-4"
  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
>
  ...
</div>
```

### Primary Button (CTA)

```tsx
<button
  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
  style={{ background: 'var(--accent)' }}
>
  ...
</button>
```

### Outline Button

```tsx
<button
  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border"
  style={{ color: 'var(--ink)', borderColor: 'var(--border-strong)' }}
>
  ...
</button>
```

### Input Field

```tsx
<input className="input-field w-full" placeholder="..." />
```

Class `.input-field` định nghĩa sẵn trong `index.css`.

### Status Badge

```tsx
<AgreementBadge status={agreement.status} size="sm" />
<MilestoneBadge status={milestone.status} />
```

### TxButton (Transaction Button)

```tsx
<TxButton
  label="Approve & Release"
  isPending={isApprovePending}
  isConfirming={isApproveConfirming}
  onClick={handleApprove}
  fullWidth
/>
```

Tự động show loading spinner khi pending/confirming.

### EmptyState

```tsx
<EmptyState
  icon={FileText}
  title="No agreements yet"
  description="Create your first onchain work agreement."
  action={{ label: 'Create agreement', onClick: () => onNav('create') }}
/>
```

---

## Layout

### Desktop
- Sidebar navigation (ẩn, chỉ dùng header)
- Max-width container căn giữa
- Content area: max-w-2xl hoặc max-w-4xl tùy view

### Mobile
- Bottom navigation bar cố định (Dashboard, Agreements, Create, Profile)
- `pb-24` để tránh nội dung bị che

### Header
- Logo "FlowWork" + ConnectKit wallet button
- Không có navigation links ở header trên mobile

---

## Animation & Interaction

- **Transitions:** `transition-colors`, `transition-all duration-500` (progress bar)
- **Hover:** `hover:opacity-70` cho links, `hover:bg-black/5` cho ghost buttons
- **Loading spinner:** `animate-spin`, border trick với `border-transparent` + `borderTopColor: accent`
- **Expandable rows:** State toggle, không có animation (clean, không rối)

---

## Nguyên tắc UX

1. **Context-aware actions:** Chỉ hiển thị action phù hợp với role và trạng thái hiện tại. Client không thấy "Submit delivery". Contributor không thấy "Approve".
2. **Onchain feedback:** Sau mỗi giao dịch, hiển thị toast + explorer link. Người dùng luôn biết chuyện gì đã xảy ra.
3. **Progressive disclosure:** Milestone rows collapse by default, expand khi cần. Tránh information overload.
4. **Empty states có hành động:** Mọi empty state đều có CTA rõ ràng để user biết phải làm gì.
5. **Error messages human-friendly:** `parseOnchainError()` chuyển raw EVM error thành thông báo dễ hiểu.
6. **Disable khi không hợp lệ:** Buttons bị disable khi form validation chưa pass — không cho phép submit sai.
7. **Tiền luôn rõ ràng:** Mọi số tiền USDC đều hiển thị với 2 chữ số thập phân + USDC icon (`TokenUSDC`).
