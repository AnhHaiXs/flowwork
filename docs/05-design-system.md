# Design System & UI/UX Guidelines

## Tổng quan

FlowWork sử dụng **Arc Light / Arc Dark Design System** — một hệ thống thiết kế tối giản, professional, được định nghĩa qua CSS custom properties (design tokens) và Tailwind utility classes. Không có component library bên ngoài (không dùng MUI, Chakra, shadcn, v.v.).

---

## Dark Mode

FlowWork hỗ trợ **Dark Mode / Light Mode** đầy đủ:

- Toggle button (Sun/Moon) trong header và mobile bottom nav
- Preference lưu vào `localStorage`
- Nếu chưa chọn → tự detect `prefers-color-scheme` của hệ điều hành
- Smooth transition 0.22s trên tất cả color properties

### Cơ chế

```css
/* Light (default) */
:root { --bg: #ffffff; --ink: #122d45; ... }

/* Dark */
[data-theme="dark"] { --bg: #0d1117; --ink: #e6edf3; ... }
```

`data-theme="dark"` được đặt trên `<html>` bởi `useTheme` hook.

---

## Design Tokens (CSS Variables)

Tất cả tokens khai báo trong `src/index.css`. Luôn dùng tokens — không hardcode hex trong JSX.

### Colors — Surfaces

| Token | Light | Dark | Sử dụng |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0d1117` | Background trang |
| `--bg-gradient` | gradient trắng-vàng | gradient đen-navy | Body background |
| `--surface` | `rgba(255,255,255,0.72)` | `rgba(22,27,34,0.80)` | Card, panel |
| `--surface-strong` | `rgba(255,255,255,0.90)` | `rgba(30,36,44,0.95)` | Inputs, elevated |
| `--surface-muted` | `#f5f5f8` | `#161b22` | Muted backgrounds, chips |

### Colors — Text

| Token | Light | Dark | Sử dụng |
|---|---|---|---|
| `--ink` | `#122d45` | `#e6edf3` | Primary text, headings |
| `--ink-2` | `#334155` | `#c9d1d9` | Secondary text |
| `--muted` | `#6b6580` | `#8b949e` | Body text, descriptions |
| `--subtle` | `#8a849c` | `#6e7681` | Placeholders, labels, metadata |

### Colors — Borders

| Token | Light | Dark |
|---|---|---|
| `--border` | `rgba(18,45,69,0.12)` | `rgba(240,246,252,0.12)` |
| `--border-strong` | `rgba(25,53,77,0.50)` | `rgba(240,246,252,0.30)` |

### Colors — Semantic

| Token | Light | Dark | Sử dụng |
|---|---|---|---|
| `--accent` | `#122d45` | `#4a9eff` | Primary CTA, buttons |
| `--success` | `#1a8047` | `#34c472` | Approved, completed |
| `--danger` | `#ba2b4c` | `#f4607a` | Error, disputed |
| `--warning` | `#b45309` | `#f59e42` | Warning, pending review |

### Colors — Status badges

| Token | Light | Dark |
|---|---|---|
| `--status-open` | `#1061a6` | `#4a9eff` |
| `--status-active` | `#1a8047` | `#34c472` |
| `--status-review` | `#b45309` | `#f59e42` |

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

Headings luôn dùng `.display` + `letter-spacing: -0.02em`.

---

## Spacing

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

### ThemeToggle

```tsx
<ThemeToggle compact />     {/* icon-only, dùng trong header */}
<ThemeToggle />             {/* label + icon, dùng standalone */}
```

---

## Layout

### Desktop
- Header sticky: logo + nav + theme toggle + ConnectKit button
- Max-width container căn giữa (max-w-2xl hoặc max-w-4xl)
- Footer 4 columns: Brand, Product, Resources, Onchain

### Mobile
- Bottom navigation bar cố định (Overview, Agreements, New, Profile, Theme toggle)
- `pb-24` để tránh nội dung bị che bởi bottom nav
- Footer ẩn trên mobile (dùng `hidden md:block`)

### Header
- Logo "FlowWork" + desktop nav + ThemeToggle (compact) + ConnectKit button
- Sticky top, backdrop blur, border bottom

---

## CSS Transition (Dark Mode)

```css
*, *::before, *::after {
  transition-property: background-color, color, border-color, box-shadow, fill, stroke;
  transition-duration: 0.22s;
  transition-timing-function: ease;
}
```

Chỉ transition color properties — không transition transforms hay opacity để tránh jank.

---

## Animation & Interaction

- **Transitions:** `transition-colors`, `transition-all duration-500` (progress bar)
- **Hover:** `hover:opacity-70` cho links, `hover:bg-black/5` cho ghost buttons
- **Loading spinner:** `animate-spin`, border trick với `border-transparent` + `borderTopColor: accent`
- **Pulse dot:** `animate-pulse` cho network status indicator
- **Expandable rows:** State toggle, không có animation (clean, không rối)

---

## Nguyên tắc UX

1. **Context-aware actions:** Chỉ hiển thị action phù hợp với role và trạng thái. Client không thấy "Submit delivery". Contributor không thấy "Approve".
2. **Onchain feedback:** Sau mỗi giao dịch, hiển thị toast + explorer link. Người dùng luôn biết chuyện gì xảy ra.
3. **Progressive disclosure:** Milestone rows collapse by default, expand khi cần.
4. **Empty states có hành động:** Mọi empty state đều có CTA rõ ràng.
5. **Error messages human-friendly:** `parseOnchainError()` chuyển raw EVM error thành thông báo dễ hiểu.
6. **Disable khi không hợp lệ:** Buttons bị disable khi form validation chưa pass.
7. **Tiền luôn rõ ràng:** Mọi số tiền USDC hiển thị với 2 chữ số thập phân + USDC icon.
8. **Dark mode không là afterthought:** Tất cả tokens có dark variant, contrast đủ theo WCAG AA.
9. **Tx feedback rõ ràng:** "Waiting for wallet..." → "Submitting onchain..." → toast success.
