# Broadcast System — UI/UX Design Guidelines

> Version: 1.0
> Status: Active
> Purpose: Single Source of Truth for UI/UX behavior and layout

---

# 1. Product Design Philosophy

Broadcast System is a digital communication platform for villages and communities.

The UI should make communication between village administrators and villagers:

- Simple
- Fast
- Clear
- Reliable
- Accessible

The product should feel:

> Modern + Clean + Friendly + Trustworthy

The product should NOT feel like:

- An old government website
- A generic enterprise dashboard
- A complicated SaaS platform
- An overly decorative landing page

---

# 2. Target Users

## 2.1 Administrator / Village Leader

Typical users:

- Village leaders
- Administrators
- Staff

Main tasks:

- Create and manage news
- Broadcast announcements
- Manage villagers
- Manage documents
- View communication statistics
- Manage system settings

UX priorities:

1. Efficiency
2. Clear navigation
3. Fast actions
4. Information hierarchy
5. Data management

---

## 2.2 Villagers

Villagers primarily use the system through LINE LIFF.

Main tasks:

- Read announcements
- View news
- Read important information
- View documents
- Register / verify their account

UX priorities:

1. Mobile-first
2. Simple navigation
3. Easy reading
4. Large touch targets
5. Minimal interaction steps

---

# 3. Design Principles

## 3.1 Clarity First

Every screen must have one obvious primary purpose.

Users should understand:

- Where they are
- What they can do
- What happened
- What they should do next

---

## 3.2 Visual Hierarchy

Important information must visually dominate secondary information.

Priority:

```text
Page Title
    ↓
Primary Action / Important Information
    ↓
Main Content
    ↓
Secondary Information
    ↓
Metadata

## 3.3 Progressive Disclosure

Do not show every piece of information immediately.

Show:

Important information first
Details when needed
Advanced actions only when necessary
## 3.4 Consistency

All screens must feel like the same product.

Do not create:

Different button styles for different pages
Different card styles without a reason
Random colors
Random spacing
Different typography systems
# 4. Admin Application
4.1 Main Layout

Desktop:

┌──────────────────────────────────────────────┐
│ Header                                       │
├──────────────┬───────────────────────────────┤
│              │                               │
│ Sidebar      │ Main Content                  │
│              │                               │
│              │                               │
└──────────────┴───────────────────────────────┘

Recommended:

Sidebar: 240px
Main content: flexible
Content max width: 1440px
Main padding: 24px–32px
5. Admin Navigation

Recommended structure:

Dashboard


News
  ├── All News
  ├── Create News
  └── Categories


Broadcast


Villagers


Documents


Reports


Settings

Navigation rules:

Use icon + label
Highlight active page
Keep navigation predictable
Avoid excessive nested menus
Important actions should be easy to reach
6. Dashboard

The dashboard should answer:

"What is happening in my community?"

Recommended sections:

Page header
Summary statistics
Recent news
Recent broadcasts
Important alerts
Quick actions

Example:

Dashboard


Good morning 👋


┌────────────┐ ┌────────────┐ ┌────────────┐
│ Villagers  │ │ News       │ │ Broadcasts │
│ 1,248      │ │ 32         │ │ 18         │
└────────────┘ └────────────┘ └────────────┘


Recent News
────────────────────────


Important Announcement
Community Meeting
Water Supply Notice


Quick Actions
[Create News] [Broadcast] [Add Villager]

Avoid unnecessary charts.

Every dashboard element must provide useful information.

7. News Management

News is one of the core features.

News management should provide:

News list
Search
Filter
Category
Status
Create
Edit
Delete
Preview

Recommended list structure:

News


[Search................] [Category ▼] [Status ▼]


┌─────────────────────────────────────────────┐
│ Title       Category    Status    Date      │
├─────────────────────────────────────────────┤
│ Announcement News     Published  18 Aug     │
│ Meeting     Event     Draft      17 Aug     │
└─────────────────────────────────────────────┘
8. Create News

The create-news page should focus on content creation.

Recommended structure:

Create News


Title
[____________________________]


Category
[____________________________]


Cover Image
[ Upload Image ]


Content
[                            ]
[                            ]
[                            ]


Attachments
[ Add File ]


Visibility
○ Publish immediately
○ Save as draft


[Cancel] [Save Draft] [Publish]

Rules:

Keep the form readable
Group related fields
Clearly distinguish save and publish
Validate required fields
Warn before leaving with unsaved changes when appropriate
9. Broadcast

Broadcast is a high-impact action.

The UI must clearly communicate:

"This message will be sent to multiple villagers."

Structure:

Broadcast Message


Audience
[ All Villagers ▼ ]


Message
[.............................]


Attachments
[ Add File ]


Preview
┌──────────────────────────┐
│ LINE Message Preview     │
│                          │
│ Announcement             │
│                          │
│ Please be informed...    │
└──────────────────────────┘


[Cancel] [Send Broadcast]

Before sending:

Are you sure?


This message will be sent to 1,248 villagers.


[Cancel] [Confirm Send]

The send button should use the primary action style.

Destructive or irreversible actions must require confirmation.

10. Villager Management

Villager management should prioritize:

Search
Filtering
Identification
Status
Registration state
LINE connection state

Recommended:

Villagers


[Search................] [Status ▼]


┌───────────────────────────────────────────────┐
│ Name      Phone       Status       LINE       │
├───────────────────────────────────────────────┤
│ Somchai   08x-xxx     Active       Connected  │
│ Somsak    09x-xxx     Pending      Connected  │
└───────────────────────────────────────────────┘
11. Villager LIFF Experience

The LIFF experience must be mobile-first.

It should feel like a lightweight mobile application.

Recommended navigation:

┌─────────────────────────┐
│ Community               │
│                         │
│ Important News          │
│ ┌─────────────────────┐ │
│ │ Announcement         │ │
│ │ Read more →          │ │
│ └─────────────────────┘ │
│                         │
│ Latest News             │
│ ┌─────────────────────┐ │
│ │ News                 │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ Home  News  Documents   │
└─────────────────────────┘
12. News Card

News cards should show only information needed to decide whether to open the article.

Show:

Cover image
Category
Title
Short description
Published date
Read more

Do not display the full article inside the card.

13. News Detail

The news detail page is optimized for reading.

Structure:

← Back


Category


News Title


Published date


Hero Image


Article Content


Attachments


Related News

Recommended content width:

max-width: 720px

Avoid unnecessary controls around the article.

14. Documents

Documents should be easy to find and understand.

Show:

Document name
Type
Date
File size when useful
Download / view action

Example:

Documents


┌───────────────────────────────────┐
│ 📄 Community Registration Form   │
│ PDF • 240 KB                     │
│                         [View]   │
└───────────────────────────────────┘
15. Loading States

Never leave the user wondering whether the system is working.

Use:

Skeleton
Spinner
Loading text

For lists, prefer skeleton loading.

Example:

กำลังโหลดข่าว...
16. Empty States

Never show an unexplained empty screen.

Example:

ยังไม่มีข่าวสาร


เมื่อมีการประกาศข่าว ข่าวจะแสดงที่นี่

Admin empty state may include an action:

ยังไม่มีข่าว


เริ่มสร้างข่าวสารแรกของคุณ


[สร้างข่าว]
17. Error States

Errors must be understandable to normal users.

Bad:

AxiosError 500

Good:

ไม่สามารถโหลดข่าวได้


กรุณาลองใหม่อีกครั้ง


[ลองใหม่]

Technical errors may be logged to the console but should not be the primary user-facing message.

18. Success Feedback

After successful actions, provide immediate feedback.

Examples:

บันทึกข่าวเรียบร้อยแล้ว
ส่งประกาศเรียบร้อยแล้ว
เพิ่มลูกบ้านเรียบร้อยแล้ว

Use toast notifications where appropriate.

19. Forms

Every input should have a visible label.

Preferred:

News Title


[________________________]


กรุณากรอกชื่อข่าว

Avoid relying only on placeholders.

Validation should:

Explain the problem
Identify the field
Provide a clear correction path
20. Responsive Design

Design mobile-first.

Breakpoints:

Mobile:
< 640px


Tablet:
640px–1024px


Desktop:
> 1024px

Mobile must not simply be a smaller desktop layout.

Use:

Stacked layouts
Full-width controls
Bottom navigation when appropriate
Large touch targets
21. Accessibility

Minimum requirements:

Semantic HTML
Proper labels
Alt text
Keyboard accessibility
Sufficient color contrast
Visible focus states
Touch targets >= 44px

Do not communicate information using color alone.

22. Animation

Animations should support usability.

Recommended duration:

150ms–250ms

Use animation for:

Hover
Button feedback
Modal
Page transitions
Loading

Avoid decorative animations that distract from communication.

23. AI UI Development Rules

Before modifying or creating UI:

Read this file.
Read DESIGN_SYSTEM.md.
Inspect existing components.
Reuse existing components.
Follow existing design tokens.
Maintain visual consistency.
Implement responsive behavior.
Implement loading, empty, error, and success states.

AI must NOT:

Invent random colors
Invent random spacing
Create duplicate components
Introduce unnecessary gradients
Add excessive animations
Redesign unrelated pages
Change the global design system without justification
24. Definition of Done — UI

A UI page is considered complete when:

 Desktop layout works
 Mobile layout works
 Primary action is obvious
 Loading state exists
 Empty state exists when applicable
 Error state exists
 Success feedback exists where applicable
 Typography follows the design system
 Colors follow the design system
 Spacing follows the design system
 Components are reusable
 Accessibility basics are satisfied
25. Golden Rule

Every screen should feel like it belongs to the same product.

Do not design:

"A cool page."

Design:

"A clear, useful, consistent page inside the Broadcast System."

The final product should feel:

Professional
     +
Friendly
     +
Simple
     +
Trustworthy