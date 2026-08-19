
---

# 2. `docs/DESIGN_SYSTEM.md`

อันนี้จะเป็นตัวที่ผมอยากให้ Antigravity **ยึดเป็นกฎ Visual โดยตรง** ครับ

```md
# Broadcast System — Design System

> Version: 1.0
> Status: Active
> Purpose: Visual language and reusable UI component specification

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

Do not create one-off visual styles unless there is a strong product reason.

---

# 2. Design Tokens

Design tokens are the source of truth.

Do not hardcode random values throughout components.

---

# 3. Color Tokens

## Brand

```css
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-primary-active: #1E40AF;
--color-primary-soft: #EFF6FF;

Secondary
--color-secondary: #0F766E;
--color-secondary-hover: #115E59;
--color-secondary-soft: #F0FDFA;
Success
--color-success: #16A34A;
--color-success-hover: #15803D;
--color-success-soft: #F0FDF4;
Warning
--color-warning: #D97706;
--color-warning-hover: #B45309;
--color-warning-soft: #FFFBEB;
Error
--color-error: #DC2626;
--color-error-hover: #B91C1C;
--color-error-soft: #FEF2F2;
Neutral
--color-background: #F8FAFC;
--color-surface: #FFFFFF;


--color-text-primary: #0F172A;
--color-text-secondary: #475569;
--color-text-muted: #94A3B8;


--color-border: #E2E8F0;
--color-border-strong: #CBD5E1;
4. Color Usage Rules

Use colors according to semantic meaning.

Primary:

Main actions
Active navigation
Links
Selected controls

Secondary:

Supporting actions
Community-related highlights

Success:

Successful operations
Active states
Completed states

Warning:

Pending states
Warnings
Attention-required information

Error:

Failed operations
Validation errors
Delete actions

Do not use color only for decoration.

5. Typography

Primary font:

Noto Sans Thai

Fallback:

system-ui, sans-serif
Font Weights
Regular: 400
Medium: 500
Semibold: 600
Bold: 700

Avoid unnecessary use of 800/900.

6. Typography Scale
Display
48px
line-height: 1.15
font-weight: 700

Use rarely.

H1
32px
line-height: 1.25
font-weight: 700
H2
24px
line-height: 1.3
font-weight: 700
H3
20px
line-height: 1.4
font-weight: 600
Body Large
18px
line-height: 1.6
font-weight: 400
Body
16px
line-height: 1.6
font-weight: 400
Body Small
14px
line-height: 1.5
font-weight: 400
Caption
12px
line-height: 1.4
font-weight: 400

Do not use text below 12px.

7. Spacing Tokens

Use a 4px base spacing system.

--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

Preferred common spacing:

8px
12px
16px
24px
32px

Avoid arbitrary spacing values.

8. Border Radius
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;

Usage:

Buttons       → 8px
Inputs        → 8px
Cards         → 12px
Containers    → 16px
Status badges → full

Do not use excessive rounded corners.

9. Shadows

Use subtle shadows.

--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.08);


--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.10);


--shadow-lg: 0 10px 24px rgba(15, 23, 42, 0.12);

Default components should prefer shadow-sm.

Cards should not look like floating objects everywhere.

10. Borders

Default:

border: 1px solid var(--color-border);

Use borders to separate content when necessary.

Do not combine:

Heavy borders
Large shadows
Strong backgrounds

all at once.

Keep the visual hierarchy clean.

11. Container

Desktop:

max-width: 1440px
margin: auto
padding: 24px–32px

Content-heavy pages:

max-width: 720px

Example:

News article:

max-width: 720px

Dashboard:

max-width: 1440px
12. Buttons
Primary

Use for the main action.

Example:

[Create News]
[Send Broadcast]
[Save]

Visual characteristics:

Primary background
White text
8px radius
Medium font weight
Clear hover state
Secondary

Use for supporting actions.

Examples:

[Cancel]
[Preview]
[Back]

Use neutral background or outline.

Danger

Use for destructive actions.

Examples:

[Delete]
[Remove]

Use error color.

Button Height

Recommended:

Small: 36px
Medium: 40px
Large: 44px

Minimum touch target:

44px
13. Input

Default input:

Height: 40px–44px
Border radius: 8px
Border: 1px
Padding: 12px

States:

Default
Hover
Focus
Error
Disabled

Focus state must be visually obvious.

14. Textarea

Recommended:

min-height: 120px
resize: vertical

Do not force users to write long content inside very small textareas.

15. Select

Selects must visually match inputs.

Do not create custom select styles unless necessary.

16. Checkbox / Radio

Use native semantics.

Ensure:

Large enough target
Clear selected state
Visible focus state
17. Card

Default card:

Background: white
Border: 1px solid #E2E8F0
Radius: 12px
Padding: 16px–24px

Cards should group related information.

Do not put every piece of information inside a card.

18. News Card

Structure:

┌────────────────────────────┐
│                            │
│        Cover Image         │
│                            │
├────────────────────────────┤
│ Category                   │
│ News Title                 │
│ Short description...       │
│                            │
│ 18 Aug 2026    Read more → │
└────────────────────────────┘

Recommended:

Radius: 12px
Image aspect ratio: 16:9
Consistent card height when displayed in grids
19. Badge

Use badges for:

Status
Categories
Labels

Examples:

Published
Draft
Pending
Important

Badge styles:

Success → green
Warning → amber
Error → red
Neutral → gray
Primary → blue

Do not use badges for ordinary text.

20. Avatar

Use for:

User profiles
Administrators
Villager identity

Recommended sizes:

Small: 32px
Medium: 40px
Large: 48px
21. Table

Tables are primarily for admin interfaces.

Rules:

Clear column headers
Consistent row height
Horizontal scrolling on mobile
Actions grouped in one column
Avoid excessive columns

Recommended row height:

48px–56px
22. Modal

Modal structure:

┌──────────────────────────────┐
│ Title                    ×   │
├──────────────────────────────┤
│                              │
│ Content                      │
│                              │
├──────────────────────────────┤
│             [Cancel] [Save]  │
└──────────────────────────────┘

Use modal for:

Confirmation
Short forms
Important warnings

Do not use modal for large workflows.

23. Toast

Toast should be:

Short
Clear
Temporary

Examples:

บันทึกข่าวเรียบร้อยแล้ว
ส่งประกาศเรียบร้อยแล้ว

Recommended duration:

3–5 seconds

Do not use toast for critical information that users must read carefully.

24. Loading Components

Components:

Spinner
Skeleton
Progress

Use skeletons for content-heavy lists.

Example:

┌──────────────────────┐
│ ███████████████      │
│ ██████████           │
│ ████████████████     │
└──────────────────────┘
25. Empty State

Structure:

Icon / Illustration


Title


Short explanation


Optional primary action

Example:

📄


ยังไม่มีเอกสาร


เอกสารที่เผยแพร่จะแสดงที่นี่


[เพิ่มเอกสาร]
26. Error State

Structure:

Error Icon


ไม่สามารถโหลดข้อมูลได้


กรุณาลองใหม่อีกครั้ง


[ลองใหม่]

Technical details should remain in developer logs.

27. Navigation
Sidebar

Recommended width:

240px

Navigation item height:

40px–44px

Active item should have:

Primary color
Clear background
Strong text weight
28. Header

Header should contain:

Page context
User profile
Notifications when applicable
Important global actions

Do not overcrowd the header.

29. Mobile Navigation

For LIFF/mobile experience:

Use:

Bottom Navigation

Recommended:

Home
News
Documents
Profile

Maximum recommended primary navigation items:

4–5
30. Iconography

Use one consistent icon library.

Recommended:

Lucide Icons

Rules:

Same stroke style
Same visual weight
Do not mix multiple icon libraries
Icons should support labels, not replace them for important actions
31. Images

News images should use consistent aspect ratios.

Recommended:

16:9

Use:

object-fit: cover;

when displaying thumbnails.

Images must have:

alt text
32. Responsive Rules
Mobile
< 640px

Use:

Single column
Full-width controls
Large touch targets
Reduced padding
Bottom navigation where appropriate
Tablet
640px–1024px

Use:

1–2 column layouts
Collapsible sidebar
Responsive tables
Desktop
> 1024px

Use:

Sidebar
Multi-column grids
Larger content areas
33. Grid System

Recommended:

4px base
12-column desktop grid

Example:

Desktop:


[ 3 columns ][ 3 ][ 3 ][ 3 ]


Tablet:


[ 6 columns ][ 6 ]


Mobile:


[ 12 columns ]

Do not force grids where content does not benefit from them.

34. Z-Index

Use a predictable hierarchy.

--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-modal: 1200;
--z-toast: 1300;

Avoid random z-index values.

35. Animation

Default transition:

transition-duration: 150ms;

Maximum normal UI transition:

250ms

Use:

ease-out

for entering UI.

Avoid excessive motion.

36. Tailwind Mapping

If Tailwind CSS is used, map the design system to Tailwind configuration or CSS variables.

Do not repeatedly hardcode:

bg-[#2563EB]
rounded-[13px]
mt-[17px]

Prefer reusable tokens/classes.

Example:

bg-primary
text-primary
border-border
rounded-md
shadow-sm
37. Component Architecture

Recommended:

src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Skeleton.jsx
│   │   └── EmptyState.jsx
│   │
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── MobileNavigation.jsx
│   │
│   └── news/
│       ├── NewsCard.jsx
│       ├── NewsList.jsx
│       └── NewsDetail.jsx

Components should be reusable.

Avoid page-specific duplicates when an existing component can be reused.

38. Component Naming

Use clear names.

Good:

NewsCard
NewsList
NewsForm
ConfirmDialog
LoadingState
EmptyState

Avoid:

Box1
Card2
NewThing
CustomThing
BlueButton

Names should describe purpose, not appearance.

39. Design Anti-Patterns

Do NOT:

Use more than necessary colors
Use gradients everywhere
Use huge rounded containers
Use excessive shadows
Use tiny text
Use excessive animations
Mix icon libraries
Create random spacing
Create random button styles
Use inconsistent card designs
Use color without semantic meaning
Overload dashboards with charts
Make every section a card
40. AI Implementation Rules

When AI modifies frontend code:

Step 1

Read:

docs/UI_DESIGN.md
docs/DESIGN_SYSTEM.md
Step 2

Inspect existing components.

Step 3

Reuse existing components.

Step 4

Use existing tokens.

Step 5

Implement responsive behavior.

Step 6

Check:

Desktop
Tablet
Mobile
Loading
Empty
Error
Success
Step 7

Do not modify unrelated UI.

41. Visual Quality Checklist

Before merging UI changes:

Colors
 Uses design tokens
 Semantic colors are correct
 Contrast is readable
Typography
 Correct font
 Correct hierarchy
 No text below 12px
Spacing
 Uses spacing scale
 Consistent gaps
 No arbitrary values
Components
 Reuses existing components
 Consistent radius
 Consistent shadows
 Consistent states
Responsive
 Mobile
 Tablet
 Desktop
Accessibility
 Labels
 Alt text
 Keyboard support
 Focus states
 Touch targets >= 44px
42. Golden Rule

The Design System is the visual source of truth.

If a new component is needed:

Check whether an existing component can be reused.
If not, design the new component using existing tokens.
Add the component to the reusable UI library.
Document important new patterns.

The goal is not:

"Make every page look impressive."

The goal is:

"Make the entire Broadcast System feel like one coherent, modern product."

43. Product Visual Identity

The final visual identity should communicate:

Modern
   +
Simple
   +
Friendly
   +
Trustworthy
   +
Community-focused

The UI should feel appropriate for both:

Village administrators
        +
Villagers

without making either audience feel like they are using a complicated system.