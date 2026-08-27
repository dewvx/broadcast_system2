# Broadcast System — Design System

> Version: 2.0
> Status: Active
> Purpose: Visual language, reusable UI component specification, and motion system
>
> ## Changelog v2.0 (2026-08-26)
> - Typography scale redesigned for **elderly-accessible Thai reading** (larger body, taller line-height, 10–11px text eliminated)
> - Added **Motion System** (duration/easing tokens, per-pattern specs, reduced-motion support)
> - `text-muted` darkened `#94A3B8` → `#64748B` for WCAG AA contrast
> - Touch target floor raised to **44px** everywhere including bottom navigation
> - Framer Motion adopted for page transitions, exit animations, staggered lists

---

# 1. Design System Philosophy

The Broadcast System Design System exists to keep every interface visually consistent.

All frontend screens should use:

- The same colors
- The same typography
- The same spacing
- The same border radius
- The same component behavior
- The same interaction patterns
- The same motion language

Do not create one-off visual styles unless there is a strong product reason.

## 1.1 Who we design for

Two audiences, one visual language:

| Audience | Surface | Priority |
|---|---|---|
| Village leaders / admins | Web dashboard | Efficiency, clarity |
| Villagers (incl. elderly) | LINE LIFF (mobile) | Readability, large targets, minimal steps |

**Elderly-first rule:** if a choice benefits elderly villagers without hurting admins, take it. Bigger text, clearer contrast, obvious feedback.

The identity should feel: **Modern + Simple + Friendly + Trustworthy + Community-focused**

---

# 2. Design Tokens

Design tokens are the source of truth. They are implemented in `frontend/tailwind.config.js`.

Do not hardcode random values throughout components.
Never write `bg-[#2563EB]`, `rounded-[13px]`, `mt-[17px]`, `text-[10px]`.

---

# 3. Color Tokens

## Brand

| Token | Value |
|---|---|
| `--color-primary` | `#2563EB` |
| `--color-primary-hover` | `#1D4ED8` |
| `--color-primary-active` | `#1E40AF` |
| `--color-primary-soft` | `#EFF6FF` |
| `--color-secondary` | `#0F766E` |
| `--color-secondary-hover` | `#115E59` |
| `--color-secondary-soft` | `#F0FDFA` |

## Semantic

| Token | Value |
|---|---|
| `--color-success` | `#16A34A` (`hover #15803D`, `soft #F0FDF4`) |
| `--color-warning` | `#D97706` (`hover #B45309`, `soft #FFFBEB`) |
| `--color-error` | `#DC2626` (`hover #B91C1C`, `soft #FEF2F2`) |

## Neutral

| Token | Value |
|---|---|
| `--color-background` | `#F8FAFC` |
| `--color-surface` | `#FFFFFF` |
| `--color-text-primary` | `#0F172A` |
| `--color-text-secondary` | `#475569` |
| `--color-text-muted` | `#64748B` ← **v2.0 (was #94A3B8, failed AA contrast)** |
| `--color-border` | `#E2E8F0` |
| `--color-border-strong` | `#CBD5E1` |

Contrast floors (WCAG AA):

- Text on background/surface: ≥ 4.5:1
- Large headings (≥ 24px): ≥ 3:1
- Never use `slate-300`/`slate-400` for user-facing text. Allowed only for disabled states and decorative dividers.

## 4. Color Usage Rules

Use colors according to semantic meaning.

- **Primary** — main actions, active navigation, links, selected controls
- **Secondary** — supporting actions, community highlights
- **Success** — completed operations, active states
- **Warning** — pending states, attention-required information
- **Error** — failures, validation errors, delete actions

Do not use color only for decoration. Do not communicate meaning by color alone (pair with icon/text).

---

# 5. Typography

Primary font: **Noto Sans Thai**
Fallback: `system-ui, sans-serif`
Loaded via Google Fonts, weights 400 / 500 / 600 / 700 only.

Thai-specific rules (non-negotiable):

- Line-height for Thai body text: **≥ 1.6** (vowels/tone marks stack above and below)
- Never set `leading-none` or `leading-tight` on running Thai text (short single-line labels only)
- Avoid unnecessary weight 800/900

## 6. Typography Scale (v2.0 — Elderly Accessible)

| Token | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| `display` | 36px | 1.25 | 700 | Rarely — hero moments only |
| `h1` | 28px | 1.35 | 700 | Page titles |
| `h2` | 22px | 1.4 | 700 | Section titles |
| `h3` | 19px | 1.5 | 600 | Card titles, sub-sections |
| `body-lg` | **18px** | 1.7 | 400 | LIFF reading text, important paragraphs |
| `body` | 16px | 1.7 | 400 | Default body (admin), form labels |
| `body-sm` | **14px** | 1.6 | 400 | Secondary info, input helper text |
| `meta` | **12px** | 1.5 | 500 | Timestamps, IDs, non-essential metadata |

Hard floors:

- **14px** = smallest size for any text the user must read or interact with (labels, nav, buttons, descriptions)
- **12px** = absolute floor, metadata/timestamps only
- **10–11px is banned.** All existing instances must be migrated.

Tailwind classes map to these tokens: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-body-sm`, `text-meta` (configured in `tailwind.config.js`).

---

# 7. Spacing Tokens

4px base system:

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px;  --space-8: 32px; --space-10: 40px;
--space-12: 48px; --space-16: 64px;
```

Preferred common spacing: 8, 12, 16, 24, 32.
Avoid arbitrary spacing values.

# 8. Border Radius

```css
--radius-sm: 8px;    /* buttons, inputs */
--radius-md: 12px;   /* cards */
--radius-lg: 16px;   /* containers, sheets */
--radius-xl: 20px;   /* hero surfaces */
--radius-full: 9999px; /* badges, avatars */
```

Do not use excessive rounded corners.

# 9. Shadows

```css
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.08);
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.10);
--shadow-lg: 0 10px 24px rgba(15, 23, 42, 0.12);
```

Default components prefer `shadow-sm`. Cards should not look like floating objects everywhere. Hover may elevate `sm → md` (see Motion).

# 10. Borders

Default: `border: 1px solid var(--color-border)`.

Do not combine heavy borders + large shadows + strong backgrounds all at once.

# 11. Container

- Desktop dashboard: `max-width 1440px`, padding 24–32px
- Content-heavy pages (news article, forms): `max-width 720px`
- LIFF content column: full width, horizontal padding 16–20px

---

# 12. Buttons

Variants: `primary` (main action), `secondary` (supporting), `outline`, `ghost`, `danger`, `dangerOutline`.

Sizes (height × font):

| Size | Height | Font | Use |
|---|---|---|---|
| sm | 38px | 14px (body-sm) | Dense tables, secondary rows actions |
| md | 44px | 16px (body) | Default everywhere |
| lg | 52px | 18px (body-lg) | LIFF primary actions, login |

Rules:

- Radius 8px, font-weight 500
- Minimum touch target **44px** — use `sm` only inside data tables
- Micro-interaction: `active:scale-[0.98]` press feedback; hover darkens per token
- Loading state shows inline spinner, keeps width stable
- One primary button per view region

# 13. Input

- Height 44–48px (v2.0: raised from 40px for easier targeting)
- Radius 8px, border 1px, padding 12–14px
- Font 16px minimum (prevents iOS zoom-on-focus)
- States: default / hover / focus / error / disabled — focus ring must be visually obvious (`focus:ring-2 focus:ring-primary/30`)
- Label above every input; error message below with role="alert"

# 14. Textarea

`min-height: 140px`, `resize: vertical`. Do not force long content into tiny boxes.

# 15. Select

Must visually match inputs. Native semantics first.

# 16. Checkbox / Radio

Native semantics, large touch area (whole label clickable, ≥ 44px row height).

# 17. Card

Background white, border 1px `#E2E8F0`, radius 12px, padding 16–24px.
Cards group related information. Do not put every piece of information inside a card.

Hover elevation (interactive cards only, desktop): `-translate-y-0.5` + `shadow-md`, transition 180ms.

# 18. News Card

```
┌────────────────────────────┐
│        Cover Image 16:9    │
├────────────────────────────┤
│ Category badge             │
│ News Title (h3)            │
│ Short description...       │
│ 18 Aug 2026      Read more →│
└────────────────────────────┘
```

Radius 12px, image aspect-ratio 16:9 with `object-cover`, consistent height in grids. Entrance: staggered fade-up (see Motion §M6).

# 19. Badge

For status/categories/labels only. Styles: success green, warning amber, error red, neutral gray, primary blue. Minimum font 12px, height ≥ 24px, radius full. Not for ordinary text.

# 20. Avatar

Sizes: small 32px, medium 40px, large 48px.

# 21. Table

Primarily admin interfaces. Clear headers, consistent rows 52–56px tall, horizontal scroll on mobile, actions grouped in one column, avoid excessive columns.

# 22. Modal

```
┌──────────────────────────────┐
│ Title                    ×   │
├──────────────────────────────┤
│ Content                      │
├──────────────────────────────┤
│             [Cancel] [Save]  │
└──────────────────────────────┘
```

Entrance: backdrop fades (180ms) + panel scales 0.96→1 with 12px rise (240ms, ease-out). Exit reverses (150ms).
Use for confirmations, short forms, important warnings — not large workflows. Destructive actions require confirmation modal.

# 23. Toast

Short, clear, temporary (3–5s). Slide+fade from top on desktop, top of safe-area on mobile. Examples: "บันทึกข่าวเรียบร้อยแล้ว". Never for critical information requiring careful reading.

# 24. Loading Components

Spinner, Skeleton, Progress.

- Lists/content-heavy pages: **skeleton with shimmer** matching final layout shape
- Actions: inline spinner inside button
- Content appears with fade-up when loaded — never abrupt swap

```
┌──────────────────────┐
│ ███████████████      │
│ ██████████           │
│ ████████████████     │
└──────────────────────┘
```

# 25. Empty State

Icon → Title → short explanation → optional primary action.

```
📄
ยังไม่มีเอกสาร
เอกสารที่เผยแพร่จะแสดงที่นี่
[เพิ่มเอกสาร]
```

# 26. Error State

Error icon → "ไม่สามารถโหลดข้อมูลได้" → "กรุณาลองใหม่อีกครั้ง" → [ลองใหม่].
Technical details stay in developer logs.

# 27. Navigation

Sidebar (desktop admin): width 256px, item height 44px, icon + label, active item = primary soft background + primary text + semibold. Active state transitions smoothly (see Motion §M8).

Header: page context, user profile, notifications. Do not overcrowd.

# 28. Bottom Navigation (LIFF)

Items: Home / News / Documents / Profile (max 5). Height **64px + iOS safe-area inset**, icon 24px, label **14px minimum**, touch target ≥ 44px full-width each. Active tab animates an indicator pill behind the icon (layoutId) and pops the icon subtly.

# 29. Iconography

Lucide Icons only. Same stroke style and weight. Icons support labels, never replace them for important actions.

# 30. Images

News images 16:9, `object-fit: cover`, mandatory alt text.

# 31. Responsive Rules

- Mobile < 640px: single column, full-width controls, large touch targets, bottom nav
- Tablet 640–1024px: 1–2 columns, collapsible sidebar, responsive tables
- Desktop > 1024px: sidebar, multi-column grids

Mobile must not be a shrunken desktop layout.

# 32. Grid System

4px base, 12-column desktop grid. Desktop 4×3, tablet 2×6, mobile 12×1 stacked. Do not force grids where content does not benefit.

# 33. Z-Index

```css
--z-base: 0; --z-dropdown: 1000; --z-sticky: 1100; --z-modal: 1200; --z-toast: 1300;
```

Avoid random z-index values.

---

# M. Motion System (new in v2.0)

## M1. Principles

Motion exists to **guide attention and explain change**, never to decorate:

1. Every animation answers "what just changed?" — otherwise remove it
2. Fast and subtle: nothing exceeds 300ms except skeleton loops
3. Enter with ease-out, exit quickly with ease-in
4. Respect `prefers-reduced-motion` — always
5. Max one entrance pattern per view (staggered list **or** page transition, not both competing)

## M2. Duration Tokens

| Token | Value | Use |
|---|---|---|
| `fast` | 120ms | Hovers, presses, toggles |
| `base` | 180ms | Fades, color/opacity changes, card lift |
| `slow` | 280ms | Modals, sheets, page-level entrances |

Tailwind: `duration-fast`, `duration-base`, `duration-slow` (extend `transitionDuration`).

## M3. Easing

| Name | Curve | Use |
|---|---|---|
| `enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering (decelerate) |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving (accelerate) |

CSS var: `--ease-enter`, `--ease-exit`. Framer: `easeOut` / `easeIn` presets acceptable.

## M4. Reduced Motion

Global CSS guard in `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Framer Motion: wrap animated surfaces with `useReducedMotion()` where transform-heavy.

## M5. Micro-interactions

- **Button press**: `active:scale-[0.98]`, duration-fast
- **Card hover** (desktop only): lift −2px + shadow sm→md, duration-base
- **Nav item hover**: background tint fade, duration-fast
- **Input focus**: border-color + ring fade-in, duration-fast
- **Toggle/checkbox**: native where possible; custom ones animate check draw ≤ 180ms

## M6. List Entrance (stagger)

Cards/list rows animate once on mount: opacity 0→1 + translateY 12px→0, stagger children 40ms, capped total ~400ms. Implement with a shared framer-motion `variants` object (`FadeStagger` / `FadeItem`) exported from `src/components/motion/`.

Rules: only on initial mount, not on filter/search re-renders (use plain render there); skip if reduced motion.

## M7. Page Transitions

Route changes wrapped in `AnimatePresence`: outgoing page fades out (150ms), incoming fades in + rises 8px (240ms). No horizontal slides between unrelated pages.

## M8. Navigation Feedback

- Sidebar active item: soft-primary background fades in, 2px leading bar grows top→bottom (180ms)
- Bottom nav active tab: indicator pill moves via `layoutId` spring (stiffness ~400, damping ~30), icon scales 1→1.08 on select

## M9. Feedback Loops

- Success toast: slide down + fade in (240ms), auto-dismiss with fade out (150ms)
- Destructive confirm: modal per §22; panel shake is **banned**
- Broadcast send success: toast + optimistic list prepend with fade-up highlight fading over 2s

## M10. Motion Anti-Patterns

Do NOT:

- Infinite looping animations on content surfaces (spinners/skeletons excepted)
- Parallax, scroll-jacking, bouncy overshoot on everything
- Animating layout properties (width/height/top/left) — use transform/opacity
- Stagger > 8 items or delay > 50ms/item
- Animations longer than 300ms for interaction feedback

---

# 34. Tailwind Mapping

Map every token through `tailwind.config.js`. Prefer semantic utility names:

```
bg-primary  text-text-secondary  border-border  rounded-md  shadow-sm
text-h1 … text-meta  duration-fast/base/slow
animate-fade-up  animate-fade-in  animate-scale-in  animate-shimmer
```

Never hardcode hex/px values in JSX.

# 35. Component Architecture

```
src/
├── components/
│   ├── ui/          # Button, Input, Select, Textarea, Card, Badge,
│   │                # Modal, Toast, Skeleton, EmptyState, Pagination
│   ├── motion/      # FadeStagger/FadeItem variants, PageTransition wrapper
│   ├── layout/      # AdminLayout, LiffLayout, ProtectedRoute
│   └── news/        # feature components (NewsCard, ...)
```

Components are reusable. Avoid page-specific duplicates.

# 36. Component Naming

Descriptive of purpose, not appearance: `NewsCard`, `ConfirmDialog`, `LoadingState`, `EmptyState`.
Avoid: `Box1`, `BlueButton`, `NewThing`.

# 37. Design Anti-Patterns

Do NOT:

- Use more colors than necessary, gradients everywhere
- Huge rounded containers, excessive shadows
- Tiny text (< 14px for readable content), cramped line-height for Thai
- Excessive/infinite animations, mixed icon libraries
- Random spacing, random button styles, inconsistent cards
- Color without semantic meaning, chart-overloaded dashboards, everything-is-a-card layouts

# 38. AI Implementation Rules

When modifying frontend code:

1. Read `docs/UI_DESIGN.md` + this file
2. Inspect existing components; reuse before creating
3. Use existing tokens (color/type/spacing/motion)
4. Implement responsive behavior + loading/empty/error/success states
5. Check desktop / tablet / mobile
6. Do not modify unrelated UI; do not change global tokens without updating this file first

# 39. Visual Quality Checklist

Before merging UI changes:

- Colors: uses tokens · semantic · contrast AA
- Typography: correct font/hierarchy · no text < 14px readable · Thai line-height ≥ 1.6
- Spacing: scale-consistent gaps, no arbitrary values
- Components: reused · consistent radius/shadow/states
- Responsive: mobile · tablet · desktop
- Accessibility: labels · alt text · keyboard · focus visible · touch ≥ 44px
- Motion: follows M1–M10 · reduced-motion respected · no infinite loops

# 40. Golden Rule

The goal is not "make every page look impressive."

The goal is: **"Make the entire Broadcast System feel like one coherent, modern, friendly product that a 70-year-old villager can read comfortably."**

If a new component is needed: reuse → design with existing tokens → add to ui library → document the pattern here.
