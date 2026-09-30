# Tasks: Frontend Design Specification

Version 1.0 · Target stack: React + Tailwind · API: `http://localhost:3000`

This document is the single source of truth for the frontend. Every value is decided. If a value is not in this document, the answer is "use the nearest token already defined here", never a new value.

**Assumptions**

1. The app is a single-page app with two URL shapes: `/` (overview + list) and `/tasks/:id` (overview + list with the detail sheet open). Filter and page live in the query string: `/?status=in_progress&page=2`. Reason: reloading or sharing a URL restores exactly what the reviewer was looking at.
2. The product name shown in the UI is "Tasks".
3. Icons come from Lucide. Every icon name below is a Lucide name. Default icon size 16px, stroke width 1.75.
4. Two fonts, both from Google Fonts: Inter (400, 500, 600) for everything, Geist Mono (400, 500) for dates, counts, priorities and labels. See 2.8.
5. Page size is fixed at 10 tasks. Reason: 10 cards fit in one desktop viewport with the stats row visible above them.
6. "Now" for overdue checks is the browser clock at render time, re-evaluated every 60 seconds.

---

## 1. Design principles

| # | Principle | What it decides |
|---|---|---|
| P1 | The product has no accent hue. Action is ink; colour belongs to data. | Primary buttons, focus rings and links are near-black on light and near-white on dark. Status and priority own the four data hues (2.4). Selection is carried by fill, border and weight, never by a colour. The one warm element is the amber mark, and it appears only in the wordmark and inside the primary button. |
| P2 | Every piece of state has a shape and a word, not just a color. | Status badges carry an icon and a label, priority carries a bar glyph and a label, overdue carries a triangle and the word "Overdue". |
| P3 | Never offer an action the API cannot honor. | No unassign, no priority filter, no clickable overdue tile, no total page count, no assignee on the create form. |
| P4 | Empty is a designed screen. | The zero-task state gets its own layout, copy and a one-click way to populate the app. |
| P5 | Motion confirms, it never performs. | Nothing animates longer than 240ms, nothing bounces, nothing loops except skeleton pulse and spinners. |

---

## 2. Design tokens

Themes: `light` and `dark`. Default is the OS setting (`prefers-color-scheme`). The user can override from the header theme menu; the choice is stored in `localStorage` under the key `tasks-theme` with values `"system"`, `"light"`, `"dark"`. The `<html>` element gets `class="dark"` when dark is active.

The product has no accent hue. The primary action is ink — near-black on light, near-white on dark — and colour is spent only where it carries data. One warm mark, an amber chip, carries the product's identity. This is what keeps four status colours, three priority colours and a destructive red legible in a dense list: nothing competes with them for attention.

### 2.1 Neutral ramp (raw values, identical in both themes)

| Step | Hex |
|---|---|
| `n-0` | `#FFFFFF` |
| `n-25` | `#F7F8FA` |
| `n-50` | `#EEF0F2` |
| `n-100` | `#E5E8EC` |
| `n-200` | `#DADEE3` |
| `n-300` | `#C5CAD1` |
| `n-350` | `#ACB2BB` |
| `n-400` | `#959BA5` |
| `n-450` | `#858C96` |
| `n-500` | `#6E757F` |
| `n-550` | `#5C626B` |
| `n-600` | `#4D525A` |
| `n-700` | `#393D44` |
| `n-800` | `#272A30` |
| `n-850` | `#1B1D22` |
| `n-900` | `#131519` |
| `n-950` | `#0B0B0C` |

The ramp is cool: the blue channel leads red by 3 to 10 points at every step. `n-50` `#EEF0F2` is the page, and every surface above it is lighter or a card. A warm gray dropped into this ramp reads as a stain.

### 2.2 Semantic neutral tokens

| Token | Light | Dark | Used for |
|---|---|---|---|
| `bg-canvas` | `n-50` `#EEF0F2` | `n-950` `#0B0B0C` | Page background |
| `bg-surface` | `n-0` `#FFFFFF` | `#151619` | Task cards, stat tiles, inputs, top bar |
| `bg-raised` | `n-0` `#FFFFFF` | `#1E2025` | Modal, sheet, menu, dialog |
| `bg-subtle` | `n-100` `#E5E8EC` | `#24272C` | Hover fill on cards, menu items, ghost buttons; segmented control track |
| `bg-muted` | `n-200` `#DADEE3` | `n-800` `#272A30` | Neutral badge fill, skeleton blocks |
| `bg-inverse` | `n-900` `#131519` | `#1E2025` | Toast background (toasts are always dark) |
| `border-default` | `n-200` `#DADEE3` | `#292C32` | Card, tile, top bar bottom, dividers |
| `border-strong` | `n-300` `#C5CAD1` | `#3B3F46` | Card border on hover, secondary button border |
| `border-input` | `#828993` | `#6B7079` | Text input, textarea, select, date input borders |
| `text-primary` | `#0F0F10` | `#FAFAFA` | Titles, body, values |
| `text-secondary` | `n-600` `#4D525A` | `#ACB2BB` | Descriptions, labels, meta |
| `text-tertiary` | `n-550` `#5C626B` | `#959BA5` | Placeholders, timestamps, helper text |
| `text-disabled` | `n-400` `#959BA5` | `n-550` `#5C626B` | Disabled control labels |
| `text-on-accent` | `#FFFFFF` | `#0B0B0C` | Label on primary and danger buttons |
| `text-inverse` | `n-50` `#EEF0F2` | `#FAFAFA` | Toast text |
| `scrim` | `rgba(11,11,12,0.40)` | `rgba(0,0,0,0.66)` | Behind modal, sheet, dialog |

`text-primary` is `#0F0F10` rather than `n-900`, a shade blacker than the ramp, because it is also the primary button fill and a button wants to be the darkest thing on the page.

### 2.3 Accent (ink)

| Token | Light | Dark | Used for |
|---|---|---|---|
| `accent` | `#0F0F10` | `#FAFAFA` | Primary button fill, checkbox fill on hover |
| `accent-hover` | `#26282D` | `#E3E4E7` | Primary button hover |
| `accent-active` | `#393D44` | `#CBCDD2` | Primary button pressed |
| `accent-subtle` | `n-100` `#E5E8EC` | `#26292F` | Selected stat tile fill, selected menu item fill |
| `accent-subtle-text` | `#0F0F10` | `#FAFAFA` | Text and icon on `accent-subtle` |
| `accent-text` | `#0F0F10` | `#FAFAFA` | Links, text buttons, selected segment label |
| `focus-ring` | `#0F0F10` | `#FAFAFA` | 2px focus outline on every focusable element |

Selection is carried by fill, border and weight rather than by hue: a selected stat tile takes `accent-subtle` with a 1px `accent` border at 40% (light `rgba(15,15,16,0.40)`, dark `rgba(250,250,250,0.35)`) and its label goes to weight 600. Losing the coloured selection state is the cost of an ink accent; the fill plus border plus weight shift is what replaces it, and all three must be present.

**The mark.** One warm element, used in exactly two places — the wordmark square and the leading chip inside the primary button.

| Token | Value | Notes |
|---|---|---|
| `mark-gradient` | `linear-gradient(150deg, #FDBE3B 0%, #F08C1A 100%)` | Same in both themes |
| `mark-ink` | `#3A2405` | Glyph inside the chip; 5.91:1 on the darker stop |

The chip is the only saturated colour in the top bar, so it reads as identity rather than as a control. It never appears on a secondary button, a menu item or a card.

### 2.4 Semantic colors

Four data hues, each with one job, plus the ink accent and the mark above.

| Hue | Job |
|---|---|
| Blue | In progress, and `info` |
| Green | Done |
| Amber | Overdue, and medium priority |
| Red | Destructive, errors, high priority |

Amber appears both in the mark and on overdue. That is deliberate rather than a collision: the mark is a 24px gradient square in the top bar, overdue is flat amber text and a tinted tile, and the two never sit within the same block. Amber is simply this product's warm signal.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `blue-text` | `#1D4ED8` | `#9EC2FF` | In progress icon and text outside a fill |
| `blue-subtle` | `#E9F0FE` | `#16233D` | In progress badge fill, info toast disc |
| `blue-subtle-text` | `#1A45BE` | `#AECBFF` | Text and icon on `blue-subtle` |
| `success-text` | `#136B33` | `#5BD68A` | Done status text and icon, completed checkbox fill |
| `success-subtle` | `#E9F6ED` | `#0E2A1A` | Done badge fill, success toast icon disc |
| `warning-text` | `#8A5206` | `#F5B83D` | Overdue text, overdue tile value |
| `warning-subtle` | `#FCF3E2` | `#2A2110` | Overdue tile fill |
| `warning-border` | `#C08A2E` | `#7A5E1C` | Overdue tile border |
| `danger` | `#C0261A` | `#F0533F` | Danger button fill |
| `danger-hover` | `#A31F14` | `#FF6A55` | Danger button hover |
| `danger-active` | `#85190F` | `#FF8271` | Danger button pressed |
| `danger-text` | `#C0261A` | `#FF8A75` | Error messages, destructive menu item, invalid input border |
| `danger-subtle` | `#FDECEA` | `#3A1712` | Form error banner fill, destructive menu item hover |
| `danger-subtle-text` | `#A31F14` | `#FFA593` | Text on `danger-subtle` |
| `info-text` | `#1A45BE` | `#AECBFF` | Same as `blue-subtle-text` |
| `info-subtle` | `#E9F0FE` | `#16233D` | Same as `blue-subtle` |

Both the primary and the danger button carry white ink in light and `#0B0B0C` ink in dark, because in dark both fills are bright.

### 2.5 Status pairings

| Status | Label | Icon | Light fill / text | Dark fill / text |
|---|---|---|---|---|
| `todo` | "To do" | `Circle` | `bg-muted` `#DADEE3` / `text-secondary` `#4D525A` | `n-800` `#272A30` / `#ACB2BB` |
| `in_progress` | "In progress" | `CircleDashed` | `blue-subtle` `#E9F0FE` / `blue-subtle-text` `#1A45BE` | `#16233D` / `#AECBFF` |
| `done` | "Done" | `CircleCheck` | `success-subtle` `#E9F6ED` / `success-text` `#136B33` | `#0E2A1A` / `#5BD68A` |

### 2.6 Priority pairings

Priority is rendered as glyph + label directly on the card surface with no fill, in the mono family (2.8), uppercase.

| Priority | Label | Icon | Light text (on `#FFFFFF`) | Dark text (on `#151619`) |
|---|---|---|---|---|
| `low` | "LOW" | `SignalLow` | `n-600` `#4D525A` | `#ACB2BB` |
| `medium` | "MEDIUM" | `SignalMedium` | `#8A5206` | `#F5B83D` |
| `high` | "HIGH" | `SignalHigh` | `#C0261A` | `#FF8A75` |

### 2.7 Contrast ratios (WCAG 2.x, computed)

Body text target 4.5:1, large text (24px+ or 18.66px+ bold) and non-text UI 3:1. Every pairing below meets its target. Disabled text is exempt under WCAG 1.4.3 and is listed for completeness.

| Pairing | Light | Dark |
|---|---|---|
| `text-primary` on `bg-canvas` | 16.77 | 18.85 |
| `text-primary` on `bg-surface` | 19.16 | 17.33 |
| `text-primary` on `bg-raised` | 19.16 | 15.61 |
| `text-primary` on `bg-subtle` | 15.59 | 14.35 |
| `text-secondary` on `bg-surface` | 7.86 | 8.59 |
| `text-secondary` on `bg-canvas` | 6.88 | 9.34 |
| `text-secondary` on `bg-raised` | 7.86 | 7.73 |
| `text-secondary` on `bg-subtle` | 6.40 | 7.11 |
| `text-secondary` on `bg-muted` (todo badge) | 5.82 | 6.82 |
| `text-tertiary` on `bg-surface` | 6.15 | 6.47 |
| `text-tertiary` on `bg-canvas` | 5.38 | 7.04 |
| `text-tertiary` on `bg-subtle` | 5.00 | 5.36 |
| `text-tertiary` on `bg-raised` | 6.15 | 5.83 |
| `text-disabled` on `bg-subtle` (exempt) | 2.28 | 2.44 |
| `border-input` on `bg-surface` (non-text) | 3.53 | 3.63 |
| `border-input` on `bg-canvas` (non-text) | 3.09 | 3.95 |
| `border-input` on `bg-raised` (non-text) | 3.53 | 3.27 |
| `text-on-accent` on `accent` | 19.16 | 18.85 |
| `text-on-accent` on `accent-hover` | 14.75 | 15.47 |
| `text-on-accent` on `accent-active` | 10.91 | 12.37 |
| `accent-text` on `bg-surface` | 19.16 | 17.33 |
| `accent-text` on `bg-canvas` | 16.77 | 18.85 |
| `accent-subtle-text` on `accent-subtle` | 15.59 | 13.97 |
| `focus-ring` on `bg-surface` (non-text) | 19.16 | 17.33 |
| `focus-ring` on `bg-canvas` (non-text) | 16.77 | 18.85 |
| `focus-ring` on `bg-raised` (non-text) | 19.16 | 15.61 |
| Status `in_progress` text on fill | 6.96 | 9.53 |
| Status `done` text on fill | 5.94 | 8.38 |
| `blue-text` on `bg-surface` | 6.70 | 10.01 |
| `success-text` on `bg-surface` | 6.61 | 9.85 |
| Priority `low` on `bg-surface` | 7.86 | 8.59 |
| Priority `medium` on `bg-surface` | 6.38 | 10.17 |
| Priority `high` on `bg-surface` | 5.94 | 7.88 |
| `warning-text` on `warning-subtle` (overdue tile) | 5.79 | 8.92 |
| `text-primary` on `warning-subtle` | 17.39 | 15.20 |
| `text-secondary` on `warning-subtle` | 7.14 | 7.53 |
| `warning-border` on `bg-surface` (non-text) | 3.04 | 2.97 |
| `danger-text` on `bg-surface` | 5.94 | 7.88 |
| `danger-text` on `bg-canvas` | 5.20 | 8.57 |
| `danger-subtle-text` on `danger-subtle` | 6.65 | 8.43 |
| `text-on-accent` on `danger` | 5.94 | 5.63 |
| `text-on-accent` on `danger-hover` | 7.60 | 6.97 |
| `text-on-accent` on `danger-active` | 9.80 | 8.14 |
| `mark-ink` on the mark gradient, darker stop | 5.91 | 5.91 |
| Avatar ink on avatar gradient, darker stop (2.14) | 6.26 | 6.26 |
| `text-inverse` on `bg-inverse` (toast) | 16.00 | 15.61 |

### 2.8 Typography

Two families, no display face. The headline character comes from setting Inter at weight 600 with heavy negative tracking and a line height equal to the font size — tight and flush, not large and loose.

```
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, "Liberation Mono", monospace
```

Loaded from Google Fonts: Inter 400, 500, 600; Geist Mono 400, 500. Both `display=swap`, both preconnected.

Font features on `body`: `font-feature-settings: "cv11", "ss01"`. Every number in a stat tile, a pager or a date uses `font-variant-numeric: tabular-nums`; the mono family is already tabular.
Rendering: `-webkit-font-smoothing: antialiased` in both themes.

| Token | Family | Size | Line height | Weight | Letter spacing | Used for |
|---|---|---|---|---|---|---|
| `display` | sans | 34px / 2.125rem | 34px | 600 | -0.04em | Stat tile values |
| `title-1` | sans | 30px / 1.875rem | 30px | 600 | -0.04em | Page heading "Overview", empty state title |
| `title-2` | sans | 20px / 1.25rem | 24px | 600 | -0.03em | Detail sheet task title |
| `title-3` | sans | 17px / 1.0625rem | 22px | 600 | -0.025em | Modal and dialog titles |
| `body-strong` | sans | 14px / 0.875rem | 20px | 500 | -0.015em | Task card title, button labels, input values |
| `body` | sans | 14px / 0.875rem | 20px | 400 | -0.01em | Descriptions, form inputs, body copy |
| `small` | sans | 13px / 0.8125rem | 18px | 400 | -0.005em | Card description preview, helper text, toast body |
| `caption` | sans | 12px / 0.75rem | 16px | 500 | -0.005em | Status badges, form labels |
| `mono` | mono | 11px / 0.6875rem | 16px | 500 | 0.02em | Meta row dates, priority labels, "Showing 1–10", page label, stat footnotes |
| `overline` | mono | 10px / 0.625rem | 14px | 500 | 0.06em | Stat tile labels (uppercase), section labels in the detail sheet |

Line height equals font size for `display` and `title-1`. That is the setting that makes a heading read as set type rather than as large text, and it is why those two tokens carry -0.04em: at 1.0 leading, default tracking looks airy and wrong.

Mono carries anything that is a fact rather than a sentence — a date, a count, a priority, a range. It is uppercase wherever it is a label. Wordmark "Tasks" uses sans 16px, weight 600, -0.03em.

### 2.9 Spacing scale (4px base)

| Token | Value | Typical use |
|---|---|---|
| `space-0` | 0 | Reset |
| `space-0.5` | 2px | Icon to badge edge nudge |
| `space-1` | 4px | Gap inside badges between icon and text |
| `space-1.5` | 6px | Gap inside buttons between icon and label |
| `space-2` | 8px | Gap between task cards, between meta items |
| `space-3` | 12px | Gap checkbox to text in card, input horizontal padding |
| `space-4` | 16px | Card padding, mobile page gutter, stat tile gap |
| `space-5` | 20px | Stat tile padding, form field vertical gap |
| `space-6` | 24px | Modal padding, desktop page gutter, header to stats |
| `space-8` | 32px | Top of page content to heading |
| `space-10` | 40px | Stats row to list section |
| `space-12` | 48px | Empty state vertical padding |
| `space-16` | 64px | Bottom page padding |

### 2.10 Radii

| Token | Value | Used for |
|---|---|---|
| `radius-xs` | 7px | Mark chip, kbd chips, skeleton value blocks |
| `radius-sm` | 10px | Buttons, inputs, selects, icon buttons, menu items, segmented control segments |
| `radius-md` | 16px | Task cards, stat tiles, menus, toasts, form error banner |
| `radius-lg` | 20px | Modal, confirmation dialog, empty state container |
| `radius-full` | 9999px | Badges, assignee chip, avatar, checkbox circle, skeleton lines |

The detail sheet has radius 0 on desktop (flush with the viewport edge) and `radius-lg` on its top corners on mobile.

Nesting rule: a radius inside another radius is the outer value minus the padding between them, floored at `radius-xs`. The segmented control track is `radius-sm` + 2px padding = 12px, with `radius-sm` segments inside it. The mark chip inside the primary button is `radius-xs` inside `radius-sm`.

### 2.11 Border widths

| Token | Value | Used for |
|---|---|---|
| `border-1` | 1px | Every border in the product |
| `border-1.5` | 1.5px | Task checkbox circle outline |
| `ring-2` | 2px | Focus ring (`outline: 2px solid focus-ring; outline-offset: 2px`) |

### 2.12 Elevation

Cards sit on a tinted canvas, so they barely need a shadow to separate — a hairline of contact plus a wide, very soft throw. Nothing in the product uses a tight dark drop shadow.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(15,15,16,0.05), 0 6px 18px -12px rgba(15,15,16,0.20)` | `0 1px 2px rgba(0,0,0,0.50)` | Cards, stat tiles, inputs, secondary buttons at rest |
| `shadow-sm` | `0 1px 2px rgba(15,15,16,0.05), 0 10px 28px -14px rgba(15,15,16,0.26)` | `0 1px 2px rgba(0,0,0,0.55), 0 10px 28px -14px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.05)` | Card hover, stat tile hover |
| `shadow-md` | `0 4px 12px -4px rgba(15,15,16,0.10), 0 16px 36px -20px rgba(15,15,16,0.28)` | `0 4px 12px -4px rgba(0,0,0,0.55), 0 16px 36px -20px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)` | Menus, toasts |
| `shadow-lg` | `0 8px 20px -8px rgba(15,15,16,0.14), 0 28px 60px -32px rgba(15,15,16,0.45)` | `0 8px 20px -8px rgba(0,0,0,0.65), 0 28px 60px -32px rgba(0,0,0,0.90), inset 0 0 0 1px rgba(255,255,255,0.07)` | Modal, dialog, sheet |
| `shadow-ink` | `0 6px 20px -8px rgba(15,15,16,0.35)` | `0 6px 20px -8px rgba(0,0,0,0.70)` | Primary button hover only |

In dark mode elevation is carried mostly by surface lightness (`bg-surface` then `bg-raised`) and the inset white hairline, because black shadows are nearly invisible on a near-black canvas.

### 2.13 Motion

| Token | Value |
|---|---|
| `duration-instant` | 0ms |
| `duration-fast` | 120ms |
| `duration-base` | 160ms |
| `duration-slow` | 240ms |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `ease-linear` | `linear` |

| Interaction | Duration | Easing | Properties |
|---|---|---|---|
| Button, icon button, menu item hover and press | `duration-fast` 120ms | `ease-standard` | background-color, border-color, color, box-shadow |
| Card hover | `duration-base` 160ms | `ease-standard` | border-color, box-shadow |
| Focus ring | `duration-instant` | none | outline appears immediately |
| Segmented control indicator slide | `duration-base` 160ms | `ease-standard` | transform, width |
| Checkbox fill on complete | `duration-base` 160ms | `ease-standard` | background-color, border-color; check icon scales 0.6 to 1 |
| Status badge swap | `duration-fast` 120ms | `ease-standard` | cross-fade opacity |
| Modal and dialog enter | `duration-slow` 240ms | `ease-enter` | opacity 0 to 1, scale 0.97 to 1, translateY 8px to 0 |
| Modal and dialog exit | `duration-base` 160ms | `ease-exit` | opacity 1 to 0, scale 1 to 0.98 |
| Scrim enter / exit | 240ms / 160ms | `ease-standard` | opacity |
| Sheet enter (desktop) | `duration-slow` 240ms | `ease-enter` | translateX 100% to 0 |
| Sheet exit (desktop) | `duration-base` 160ms | `ease-exit` | translateX 0 to 100% |
| Sheet and modal enter (mobile bottom sheet) | 240ms | `ease-enter` | translateY 100% to 0 |
| Toast enter | `duration-slow` 240ms | `ease-enter` | opacity 0 to 1, translateY 12px to 0 |
| Toast exit | `duration-base` 160ms | `ease-exit` | opacity 1 to 0, translateX 0 to 24px |
| Card enter (new task created) | `duration-slow` 240ms | `ease-enter` | opacity 0 to 1, translateY -4px to 0 |
| Card exit (deleted) | `duration-base` 160ms | `ease-exit` | opacity 1 to 0, height to 0, then list gap collapses |
| Stat value change | `duration-base` 160ms | `ease-standard` | old number fades out while new fades in (no counting animation) |
| Skeleton pulse | 1400ms, infinite, alternate | `ease-linear` | opacity 1 to 0.55 |
| Spinner | 700ms, infinite | `ease-linear` | rotate 360deg |
| Tooltip appear | 120ms after 500ms hover delay | `ease-standard` | opacity |

**Reduced motion** (`prefers-reduced-motion: reduce`): all transform animations are removed. Opacity transitions stay but are capped at 120ms. Skeleton pulse is replaced by a static `bg-muted` block. Spinner keeps rotating (it is a status signal, not decoration).

### 2.14 Avatar

The API gives only a free-text string for `assignee`, so a person is a monogram. One fill, not a set: a soft amber gradient from the same family as the mark.

| Token | Value |
|---|---|
| `avatar-gradient` | `linear-gradient(150deg, #FDE4A8 0%, #F6C25C 100%)` |
| `avatar-ink` | `#5A3A05` — 6.26:1 on the darker stop |

Same in both themes. It is paler than the mark chip so the two are never confused at a glance, and it is the only warm element inside a card.

One fill for everyone rather than a colour hashed from the name: the app has no user accounts, so a per-person colour would imply an identity the API cannot back, and a wall of differently coloured discs would compete with the status badges for the eye. The name text next to the monogram is what distinguishes people.

### 2.15 Watermark

One decorative element in the whole product, taken straight from the reference's giant ghost type.

```
font: 600 clamp(180px, 22vw, 300px)/1 var(--font-sans);
letter-spacing: -0.05em;
color: light rgba(15,15,16,0.035) / dark rgba(255,255,255,0.035);
```

Content: the word "Tasks". Positioned once per page, anchored to the bottom-right of the main container and allowed to bleed past both edges, sitting at `z-index: 0` under all content. It is `aria-hidden="true"` and `user-select: none`.

Removed entirely below 768px, where it has no room to bleed and simply reads as a smudge behind the cards.

No dot grids, no gradients, no illustrations. This is the only ornament.

---

## 3. Layout system

### 3.1 Page shell anatomy (top to bottom)

| # | Region | Height / spacing | Contents |
|---|---|---|---|
| 1 | Connection banner (only when API unreachable after first load) | 40px, full width | See 6.6 |
| 2 | Top bar | 56px, sticky at top, `bg-surface` at 85% opacity with `backdrop-filter: saturate(180%) blur(8px)`, bottom border `border-default` | Left: wordmark. Right: theme menu icon button, 8px gap, "New task" primary button |
| 3 | Main container | max-width 960px, centered, horizontal padding = page gutter | Everything below |
| 4 | Page header | 32px from top bar | `title-1` "Overview"; 4px below it, `small` in `text-secondary`: "Stored in memory on the API. Everything resets when the server restarts." |
| 5 | Stats row | 24px below page header | 4 stat tiles |
| 6 | List toolbar | 40px below stats row | Left: status segmented control. Right: `mono` `text-tertiary` range text "Showing 1–10" (en dash between numbers is the only dash in the UI and is required typographically) |
| 7 | Task list | 12px below toolbar | Stack of task cards, 8px gap |
| 8 | Pagination | 16px below list | Pagination control, right aligned |
| 9 | Bottom padding | 64px | none |

Overlays (not in flow): detail sheet (right edge), modal (centered), confirmation dialog (centered), toasts (bottom right), menus (anchored).

Wordmark: a 24×24px square with `radius-xs`, fill `mark-gradient`, containing the `Check` icon at 14px in `mark-ink` `#3A2405`, then 8px gap, then "Tasks" in sans 16px weight 600 at -0.03em. This chip and the one inside the primary button are the only saturated colour in the top bar. The whole wordmark is a link to `/`.

The whole wordmark is a link to `/` (clears filter and page).

### 3.2 Container and grid

| Property | Value |
|---|---|
| Container max-width | 960px (content area; 1008px including 24px gutters) |
| Page gutter | 16px below 640px, 24px at 640px and above |
| Stats grid | 4 equal columns at ≥768px, gap 16px; 2 columns at <768px, gap 12px |
| Task list | single column, full container width, gap 8px |
| Form grid (modal) | 1 column for Title and Description; Status, Priority, Due date in 3 equal columns with 12px gap at ≥640px; stacked with 20px gap below 640px |
| Detail sheet property grid | 2 columns: label 112px fixed, value fills; row height 36px; row gap 4px |

### 3.3 Breakpoints

| Name | Min width | What changes |
|---|---|---|
| base | 0px | Gutter 16px. Stats 2×2. "New task" in top bar becomes a 36px icon button (`Plus`) with `aria-label="New task"`. Segmented control scrolls horizontally with no visible scrollbar, 16px fade mask on the right edge. Range text "Showing 1–10" hides. Modal and detail sheet render as bottom sheets at 100% width, max-height `calc(100dvh - 24px)`. Card quick action "More" button is always visible (no hover on touch). Toasts center at bottom, width `calc(100vw - 32px)`. |
| `sm` | 640px | Gutter 24px. "New task" shows the full labeled button. Range text shows. Modal becomes centered dialog, 560px wide. Form row puts Status / Priority / Due date in 3 columns. Toasts move to bottom right, 360px wide. |
| `md` | 768px | Stats become 4 columns. Detail sheet becomes a right-side panel 480px wide, full height. Card "More" button hides until card hover or focus-within. |
| `lg` | 1024px | No layout change. Keyboard shortcut hints (kbd chips) appear inside tooltips and next to the "New task" button label. Reason: below 1024px the device is likely touch, where hints are noise. |
| `xl` | 1280px | No change. Container stays 960px; extra width becomes canvas. |

---

## 4. Component inventory

Conventions for every interactive component unless stated otherwise:

- **focus-visible**: `outline: 2px solid focus-ring; outline-offset: 2px`. Appears only for keyboard focus (`:focus-visible`), never on mouse click.
- **disabled**: `cursor: not-allowed`, `opacity: 1` (no opacity trick), colors switch to the disabled values listed per component. Disabled elements are also `aria-disabled="true"` and remain in the tab order only where stated.
- **Hit target**: minimum 36×36px on pointer devices, 44×44px under 640px (achieved with padding or an invisible hit area, visual size unchanged).

### 4.1 Button

Anatomy (left to right): [leading icon 16px, optional] · 6px · [label] · 6px · [trailing kbd chip, optional, ≥1024px only]. When loading: [spinner 16px] replaces the leading icon (or is inserted before the label if no icon), label stays, width is locked to its pre-loading width so it never jumps.

| Size | Height | Horizontal padding | Font | Icon | Radius |
|---|---|---|---|---|---|
| `sm` | 28px | 10px | `caption` weight 500 | 14px | `radius-xs` 7px |
| `md` (default) | 36px | 14px | `body-strong` | 16px | `radius-sm` 10px |
| `lg` | 40px | 16px | `body-strong` | 16px | `radius-sm` 10px |

`lg` is used only in the empty state. Everything else is `md` unless noted.

**The mark chip.** The primary "New task" button carries the amber chip (2.3) as its leading element instead of a plain icon: a 28×28px square at `radius-xs`, `mark-gradient` fill, `Plus` icon 14px in `mark-ink`, sitting inside the button's left padding (button padding becomes 5px left, 15px right at `md`). No other button variant has it, and the chip is the only place a `md` primary button differs from the table above.

| Variant | Default | Hover | Active (pressed) | Disabled |
|---|---|---|---|---|
| `primary` | bg `accent`, text `text-on-accent`, no border, `shadow-xs` | bg `accent-hover`, `shadow-ink` | bg `accent-active`, `translateY(0.5px)`, `shadow-xs` | bg `bg-muted`, text `text-disabled`, no shadow |
| `secondary` | bg `bg-surface`, text `text-primary`, border 1px `border-strong`, `shadow-xs` | bg `bg-subtle` | bg `bg-muted` | bg `bg-surface`, border `border-default`, text `text-disabled` |
| `ghost` | transparent, text `text-secondary` | bg `bg-subtle`, text `text-primary` | bg `bg-muted` | transparent, text `text-disabled` |
| `danger` | bg `danger`, text `text-on-accent` | bg `danger-hover` | bg `danger-active` | bg `bg-muted`, text `text-disabled` |
| `danger-ghost` | transparent, text `danger-text` | bg `danger-subtle` | bg `danger-subtle`, `translateY(0.5px)` | transparent, text `text-disabled` |

| State | Behavior |
|---|---|
| focus-visible | Standard ring |
| loading | Spinner (Lucide `LoaderCircle`, rotating) in the label color, button gets `aria-busy="true"` and ignores clicks, colors stay at default (not disabled colors) |
| error | Buttons have no error state. Errors surface in the form banner or a toast. |
| selected | Not applicable to buttons (use segmented control) |
| empty | Not applicable |

Kbd chip (inside primary "New task"): 18px tall, min-width 18px, padding 0 5px, `radius-xs` 7px, 11px mono at weight 500, bg `rgba(255,255,255,0.18)`, text `text-on-accent`. Content: "N".

### 4.2 Icon button

Anatomy: [icon] centered in a square.

| Size | Box | Icon | Radius |
|---|---|---|---|
| `sm` | 28×28px | 16px | `radius-xs` 7px |
| `md` | 32×32px | 16px | `radius-sm` 10px |
| `lg` | 36×36px | 18px | `radius-sm` 10px |

| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| `ghost` (default) | transparent, icon `text-secondary` | bg `bg-subtle`, icon `text-primary` | bg `bg-muted` | icon `text-disabled` |
| `outline` | bg `bg-surface`, border 1px `border-strong`, icon `text-secondary` | bg `bg-subtle`, icon `text-primary` | bg `bg-muted` | border `border-default`, icon `text-disabled` |

| State | Behavior |
|---|---|
| focus-visible | Standard ring |
| loading | Icon swaps to rotating `LoaderCircle` at the same size |
| selected | Used only by the theme menu trigger while its menu is open: bg `bg-muted`, icon `text-primary` |
| error / empty | Not applicable |

Every icon button has an `aria-label` and a tooltip with the same text (tooltip: `bg-inverse`, `text-inverse`, `caption`, padding 4px 8px, `radius-sm`, 6px offset from trigger, 500ms delay; at ≥1024px it appends the shortcut as a kbd chip).

Icon buttons used in the app: theme menu (`Sun` in light, `Moon` in dark, "Theme"), card more actions (`Ellipsis`, "More actions"), sheet close (`X`, "Close"), sheet edit (`Pencil`, "Edit task"), modal close (`X`, "Close"), toast dismiss (`X`, "Dismiss"), mobile new task (`Plus`, "New task").

### 4.3 Text input

Anatomy (top to bottom): [label, `caption`, `text-secondary`] · 6px · [field] · 6px · [helper or error text, `small`] . Required marker: none on the field; the Title label reads "Title" and the helper handles errors. Reason: only one field is required, so a marker adds noise.

Field: height 36px, padding 0 12px, `body` text, bg `bg-surface`, border 1px `border-input`, `radius-sm`, `shadow-xs`. Placeholder `text-tertiary`.

| State | Visual |
|---|---|
| default | as above |
| hover | border `n-500` light / `n-400` dark |
| focus-visible (also applied on mouse focus for text fields) | border `focus-ring`, plus `box-shadow: 0 0 0 3px` of `focus-ring` at 20% alpha (light `rgba(15,15,16,0.14)`, dark `rgba(250,250,250,0.18)`); no offset outline |
| active | same as focus |
| disabled | bg `bg-subtle`, border `border-default`, text `text-disabled`, no shadow |
| loading | Not used on inputs; the form's submit button carries loading, inputs become `readonly` (look unchanged) while submitting |
| error | border `danger-text`, focus glow uses `danger-text` at 20% alpha, helper text replaced with error text in `danger-text` prefixed by `CircleAlert` 14px, 4px gap; input gets `aria-invalid="true"` and `aria-describedby` pointing to the error |
| selected | Not applicable |
| empty | Shows placeholder |

Character counter: appears at the right of the helper row only once length ≥ 100 for Title (limit 120): "104/120" in `text-tertiary`, turns `danger-text` at 120. Input blocks typing past 120 via `maxLength`.

### 4.4 Textarea

Same anatomy, colors and states as text input. Differences: min-height 96px (4 lines at 20px + 16px padding), padding 8px 12px, vertical resize only, max-height 240px then scrolls. Limit 2000 characters; counter appears at ≥1800 as "1850/2000".

### 4.5 Select

Custom-styled native `<select>` (native for free keyboard and mobile pickers). Anatomy: [leading icon 16px, 8px from left] · 8px · [value text] · [trailing `ChevronDown` 16px `text-tertiary`, 10px from right]. Height 36px, padding left 34px when a leading icon is present else 12px, padding right 34px.

Colors and states identical to text input. Leading icon shows the icon of the current value (status icon in status color for status select; signal icon in priority color for priority select). Option labels are the exact labels from 2.5 and 2.6.

Sizes: `md` 36px (forms). `sm` 28px, `caption` text, used inline in the detail sheet property grid, with transparent border at rest and `border-input` on hover and focus (reads as text until interacted with).

### 4.6 Date input

Native `<input type="date">` styled like text input, with a trailing clear icon button when a value is set.

Anatomy: [`Calendar` icon 16px `text-tertiary`, 10px from left] · 8px · [date text] · [clear icon button `sm` ghost, `X` 14px, `aria-label="Clear due date"`, 4px from right]. `color-scheme: light` or `dark` is set on the input to match the theme so the native picker matches.

States identical to text input. Empty shows the browser's native placeholder in `text-tertiary`.

Value conversion (fixed rule): the picker yields `YYYY-MM-DD`; send `dueDate` as the end of that day in the user's local time converted to ISO, i.e. local `23:59:59.999` then `toISOString()`. Reason: the API's overdue rule compares against now, so a midnight timestamp would mark a task due today as overdue all day. When reading, display the local calendar date of the ISO string.

Minimum date: none. Picking a past date is allowed; the helper text then reads "This date is in the past, so the task will show as overdue." in `warning-text` (not an error, does not block submit).

### 4.7 Task card

The primary list unit. One card per task.

Container: `bg-surface`, border 1px `border-default`, `radius-md`, `shadow-xs`, padding 14px 16px, min-height 64px. The entire card is clickable and opens the detail sheet. Implementation of the click target: the title is a real link to `/tasks/:id`, and a stretched pseudo-element on that link covers the whole card, so the card is one click target while the tab stops are only the checkbox, the title link and the more actions button, in that order.

Anatomy, horizontal (left to right):

| Order | Part | Size | Gap to next |
|---|---|---|---|
| 1 | Complete checkbox | 18px circle, 36px hit area | 12px |
| 2 | Content column (flex 1, min-width 0) | fills | 16px |
| 3 | Priority indicator | auto | 8px |
| 4 | More actions icon button (`sm` ghost) | 28px | none |

Content column, vertical (top to bottom):

| Order | Part | Style | Gap to next |
|---|---|---|---|
| 1 | Title | `body-strong`, `text-primary`, single line, ellipsis | 2px |
| 2 | Description preview (only if `description !== ""`) | `small`, `text-secondary`, single line, ellipsis | 8px |
| 3 | Meta row | flex, wrap, gap 8px, align center | none |

Meta row items in order (each only when applicable):

1. Status badge (always).
2. Due date (when `dueDate !== null`): `Calendar` 14px + text, `mono` uppercase, `text-secondary`. Overdue variant: `TriangleAlert` 14px + "OVERDUE · SEP 28", both `warning-text`.
3. Assignee chip (when `assignee !== null`).
4. Completed stamp (when `status === "done"` and `completedAt !== null`): `CircleCheck` 14px + "Completed Sep 30", `caption`, `text-tertiary`.

Date text format for all relative dates: "Today", "Tomorrow", "Yesterday"; otherwise "Sep 28"; if not the current year, "Sep 28, 2027". Month is short English (`en-US`, `month: "short", day: "numeric"`).

Complete checkbox:

| Task state | Visual | Interaction |
|---|---|---|
| not done, default | 18px circle, border 1.5px `border-input` (`n-450` light / `n-500` dark), transparent fill | Click → complete (PATCH) |
| not done, hover | border `accent`, `Check` icon 12px appears at 40% opacity in `accent` | |
| not done, focus-visible | standard ring around the 18px circle | Space or Enter completes |
| completing (in flight, optimistic) | fill `success-text`, border `success-text`, `Check` 12px in `bg-surface` color, 160ms fill animation | ignores further clicks |
| done | same as completing, not interactive (`aria-disabled="true"`, `aria-checked="true"`), tooltip "Completed. Change status from the task menu to reopen." | none |

`role="checkbox"`, `aria-label="Mark “{title}” complete"`.

Card states:

| State | Visual |
|---|---|
| default | as above |
| hover | border `border-strong`, `shadow-sm`, more actions button fades in (≥768px) |
| focus-visible (title link or any control inside) | card border `focus-ring` 1px plus standard 2px ring on the focused control itself; more actions button visible |
| active (pressed on card body) | bg `bg-subtle` |
| selected (its detail sheet is open) | bg `accent-subtle` at 50%: light `#F2F4F6`, dark `#1E2025`; border `accent` at 40%: light `rgba(15,15,16,0.40)`, dark `rgba(250,250,250,0.35)` |
| done | title `text-secondary` with `text-decoration: line-through` in `n-300` light / `n-600` dark, description hidden, card otherwise unchanged |
| disabled | Not used. Cards are never disabled. |
| loading (a mutation on this task is in flight, non-optimistic, e.g. assign or delete) | card opacity 0.6, pointer events off, `aria-busy="true"` |
| error | A failed optimistic update reverts the card and plays a 2-cycle horizontal shake: `translateX` 0 → -3px → 3px → 0, 240ms total, `ease-standard` (skipped under reduced motion); the toast carries the message |
| empty | Not applicable (list empty states in 4.16) |

### 4.8 Status badge

Anatomy: [status icon 12px] · 4px · [label]. Height 20px, padding 0 8px 0 6px, `radius-full`, `caption` weight 500. Colors from 2.5.

| Variant | Use |
|---|---|
| `default` | As above, in cards and sheet header |
| `large` | Height 24px, padding 0 10px 0 8px, icon 14px, `small` weight 500. Used in the detail sheet header only. |

States: badges are static (no hover, focus, disabled). Changing status swaps icon, label and colors with a 120ms cross-fade. Badges have no `aria-label`; the visible label is the accessible name.

### 4.9 Priority indicator

Anatomy: [signal icon 16px, stroke width 2.5] · 4px · [label `mono`, uppercase]. No background, no border. Colors from 2.6. Height 20px. The icon is larger and heavier than the 16px / 1.75 default because the signal bars sit in the lower half of the glyph and become unreadable at 14px.

| Variant | Use |
|---|---|
| `full` (default) | Icon + label. Used in cards at ≥640px and in the sheet. |
| `compact` | Icon only with `aria-label="Priority: High"` and a tooltip "High priority". Used in cards below 640px. |

States: static. Low priority icon is `SignalLow` which renders one filled bar; medium two; high three. The bar count is the non-color signal.

### 4.10 Assignee chip

The API gives only a free-text string, so a person is a monogram plus the name. The monogram uses the single amber gradient in 2.14 for everyone. It is the only warm element inside a card, and the name beside it is what distinguishes people.

Anatomy: [avatar 18px circle] · 6px · [name]. Chip itself has no background or border in cards. Name: `caption` weight 500, `text-secondary`, max-width 160px, ellipsis, full name in `title` attribute.

Avatar: 18px circle, fill `avatar-gradient`, initials in `avatar-ink` `#5A3A05`, 9px sans, weight 600, letter-spacing 0.02em, uppercase, centered. Same values in both themes.

When the initials fall back to the `User` icon, the icon takes `avatar-ink` at 11px.

Initials rule: trim the string, split on whitespace. Two or more words: first character of first word + first character of last word. One word: first character only. If the first character is not a letter or digit, use the `User` icon at 11px instead of text. Examples: "Priya Sharma" → "PS", "alex" → "A", "Mary Jane Watson" → "MW", "@ops" → icon.

| Size | Avatar | Name font | Where |
|---|---|---|---|
| `sm` | 18px | `caption` | Card meta row |
| `md` | 24px, 11px initials | `body` `text-primary` | Detail sheet |

States: static in cards. In the sheet the chip is not interactive; the "Reassign" button next to it is.

Unassigned (only in the detail sheet, never in cards): dashed 18px circle outline 1px `border-strong` with `User` icon 12px `text-tertiary`, followed by "Unassigned" in `body` `text-tertiary`.

### 4.11 Stat tile

Anatomy (top to bottom), padding 20px:

| Order | Part | Style | Gap to next |
|---|---|---|---|
| 1 | Header row: [icon 14px] · 6px · [label] | `overline`, `text-secondary`, uppercase | 12px |
| 2 | Value | `display`, `text-primary`, tabular nums | 4px |
| 3 | Footnote | `small`, `text-tertiary` | none |

Container: `bg-surface`, border 1px `border-default`, `radius-md`, `shadow-xs`, min-height 120px.

Tiles and copy:

| Tile | Icon | Label | Footnote when > 0 | Footnote when 0 | Clickable |
|---|---|---|---|---|---|
| To do | `Circle` | "To do" | "Not started" | "Not started" | Yes, sets filter `todo` |
| In progress | `CircleDashed` | "In progress" | "Being worked on" | "Being worked on" | Yes, sets filter `in_progress` |
| Done | `CircleCheck` | "Done" | "Completed" | "Completed" | Yes, sets filter `done` |
| Overdue | `TriangleAlert` | "Overdue" | "Past due and not done" | "Nothing past due" | No |

The overdue tile is not clickable because the API has no overdue filter and filtering one page client-side would lie about the result set (P3).

| State | Visual |
|---|---|
| default | as above |
| hover (clickable tiles) | border `border-strong`, `shadow-sm`, cursor pointer |
| focus-visible (clickable tiles are `<button>`s with `aria-pressed`) | standard ring |
| active | bg `bg-subtle` |
| selected (its status is the active filter) | bg `accent-subtle`, border `accent` at 40% (same values as selected card), label and icon `accent-subtle-text`, `aria-pressed="true"`. Clicking a selected tile clears the filter back to All. |
| disabled | Not used |
| loading | Value replaced by a skeleton block 56×32px, footnote by a skeleton line 96×12px |
| error | Value shows "–" in `text-tertiary` and the footnote reads "Couldn't load" in `danger-text`; the row shows one inline "Retry" text button (`accent-text`, `caption`) at the right of the stats section heading row |
| empty (value 0) | Value renders "0" in `text-tertiary` instead of `text-primary` |
| **warning** (overdue tile, value > 0) | bg `warning-subtle`, border `warning-border`, icon, label and value in `warning-text`, footnote `text-secondary`. The number reads as an alert, not a neutral count. |

Overdue tile when 0: neutral like other tiles, icon switches to `CircleCheck` in `success-text`, value "0" in `text-tertiary`.

### 4.12 Modal / sheet

Two shells share one set of rules.

**Modal** (create, edit): centered, width 560px, max-height `calc(100dvh - 64px)`, `bg-raised`, `radius-lg`, `shadow-lg`, no border in light, the dark shadow hairline acts as border.

Anatomy (top to bottom):

| Part | Spec |
|---|---|
| Header | padding 20px 24px 0; row: [title `title-3`] ... [close icon button `md` ghost] |
| Body | padding 20px 24px; scrolls if taller than available space; fields stacked with 20px gap |
| Footer | padding 16px 24px, top border 1px `border-default`; row: [left: kbd hint "⌘ Enter to save" `caption` `text-tertiary`, ≥1024px only; on non-Mac "Ctrl Enter to save"] ... [right: secondary "Cancel" · 8px · primary submit] |

**Sheet** (task detail): desktop ≥768px docked right, width 480px, full viewport height, `bg-raised`, left border 1px `border-default`, `shadow-lg`. Below 768px, a bottom sheet: full width, max-height `calc(100dvh - 24px)`, top corners `radius-lg`, 36×4px drag handle (`n-300` / `n-700`, `radius-full`) centered 8px from the top (visual affordance only; swipe-down closes when scrolled to top).

Scrim: `scrim` token, covers the viewport under both. The desktop sheet uses the scrim too. Reason: the list behind it must not receive clicks that would change what the sheet shows.

| State | Behavior |
|---|---|
| default / open | Focus moves to the first focusable element (modal: Title input; sheet: close button). Background gets `inert`. Body scroll locked. |
| closing | Exit animation, then focus returns (see 8.5) |
| loading (submitting) | Submit button loading, Cancel stays enabled and cancels by closing (request continues; its result still updates the list), inputs `readonly`, Esc and scrim click still close |
| error | Form error banner at the top of the body: `danger-subtle` bg, `danger-subtle-text`, `radius-md`, padding 10px 12px, `CircleAlert` 16px · 8px · message `small`. 16px below it the first field. |
| empty | Not applicable |
| selected / hover / disabled / focus-visible | Not applicable to the shell; see contents |

Dismiss: Esc, close button, scrim click, and on mobile swipe down. If the form is dirty, dismissing asks nothing and discards. Reason: the forms are short and a "discard changes?" dialog on a portfolio CRUD app adds friction without protecting meaningful work.

### 4.13 Toast

Position: bottom right, 24px from the right and bottom edges (≥640px); bottom center, 16px from bottom, below 640px. Stack upward with 8px gap, max 3 visible; a 4th pushes the oldest out.

Anatomy: [status icon 16px] · 10px · [message column] · 12px · [action text button, optional] · 4px · [dismiss icon button `sm`]. Width 360px, padding 12px 12px 12px 14px, `bg-inverse`, `text-inverse`, `radius-md`, `shadow-md`. Message: `small` weight 500; optional second line `small` weight 400 at 75% opacity.

| Variant | Icon | Icon color | Auto dismiss | Live region |
|---|---|---|---|---|
| `success` | `CircleCheck` | `#5BD68A` | 4000ms | `polite` |
| `error` | `CircleAlert` | `#FF8A75` | 8000ms | `assertive` |
| `info` | `Info` | `#AECBFF` | 4000ms | `polite` |

Toast colors are the dark theme values in both themes, since the toast is always dark.

| State | Behavior |
|---|---|
| hover or focus-within | pauses the auto-dismiss timer |
| action button | text button, `caption` weight 600, `#FAFAFA`, hover underline |
| dismiss focus-visible | standard ring in `#FAFAFA` |

### 4.14 Skeleton

Blocks with bg `bg-muted`, pulse per 2.13. Lines use `radius-full`; blocks use the radius of the thing they stand in for.

| Skeleton | Parts |
|---|---|
| Stat tile skeleton | Real tile container with: label line 64×10px, 16px gap, value block 56×32px `radius-sm`, 8px gap, footnote line 96×12px |
| Task card skeleton | Real card container with: circle 18px, 12px gap, column [title line width varies 45% / 60% / 38% / 52% / 70% by row index mod 5, 12px tall; 10px gap; meta row: pill 64×20px, 8px, line 72×12px] |

Skeleton regions get `aria-hidden="true"`; the list container gets `aria-busy="true"` and a visually hidden "Loading tasks" text.

### 4.15 Pagination control

The API returns bare arrays with no total, so the control is Previous / Next with a lookahead, not numbered pages.

Anatomy (right aligned): [page label `mono` `text-secondary`: "PAGE 2"] · 12px · [secondary button `sm` "Previous" with `ChevronLeft`] · 8px · [secondary button `sm` "Next" with trailing `ChevronRight`].

**How "Next" knows whether a next page exists:** whenever page N is requested, page N+1 is requested in parallel with the same `status` and `limit=10`. Next is enabled only when page N+1 returned at least one task. The N+1 result is cached and shown instantly when Next is clicked (then N+2 is prefetched). This is exact, costs one extra request, and never shows a Next that leads to an empty page. Totals from `/tasks/stats` are not used to compute page counts because the two responses are separate requests and can disagree after a concurrent change, which would render a wrong "of N".

| State | Behavior |
|---|---|
| Hidden | When page 1 has fewer than 10 tasks and N+1 is empty (whole result fits one page), the entire control is not rendered. |
| First page | "Previous" disabled (disabled secondary style), stays in tab order with `aria-disabled` so screen reader users hear it. |
| Middle page | Both enabled. |
| **Last page** | "Next" disabled with tooltip "You're on the last page"; page label stays "Page N". The range text in the toolbar reads "Showing 21–24". |
| hover / active / focus-visible | Per button spec |
| loading (page change in flight, not cached) | The clicked button shows its spinner; list cards drop to opacity 0.6 after 150ms delay |
| error | Page fails to load: the list area shows the list error state (6.5); the control stays at the previous page's values |
| Page emptied (last task on page N > 1 was deleted or completed out of a filter) | Automatically go to page N−1, no toast |
| Out of range URL (`?page=9` returns `[]`) | Replace URL with page 1 and load it, no toast |

Range text: "Showing {(page−1)×10+1}–{(page−1)×10+count}".

### 4.16 Empty state

Container: centered column inside a `bg-surface` box with 1px dashed `border-strong`, `radius-lg`, padding 48px 24px, text centered, max content width 400px. The page watermark (2.15) is not drawn behind it; the empty state is the one region that stays plain.

Anatomy (top to bottom):

| Order | Part | Spec | Gap to next |
|---|---|---|---|
| 1 | Icon disc | 48px circle, `bg-subtle`, icon 22px `text-secondary` | 16px |
| 2 | Title | `title-3`, `text-primary` | 6px |
| 3 | Body | `small`, `text-secondary` | 20px |
| 4 | Actions | row, gap 8px, centered | none |

Variants (copy in section 6): `no-tasks`, `filter-empty` (one per status), `load-error`. The icon disc is the only graphic; no illustrations.

States: actions follow button states; the container is not interactive.

### 4.17 Confirmation dialog

Centered, width 400px (below 640px: `calc(100vw - 32px)`, still centered, not a bottom sheet, because it is a short decision). `bg-raised`, `radius-lg`, `shadow-lg`, padding 24px. `role="alertdialog"`.

Anatomy (top to bottom): [title `title-3`] · 8px · [body `small` `text-secondary`] · 24px · [actions row right-aligned: secondary "Cancel" · 8px · danger confirm].

| State | Behavior |
|---|---|
| open | Focus goes to **Cancel** (the safe action). Enter activates the focused button. |
| loading | Confirm shows spinner and label stays; Cancel disabled; Esc disabled until the response returns |
| error | Dialog stays open; an error line appears under the body: `CircleAlert` 14px + message in `danger-text` `small`, 12px above the actions; Confirm re-enabled |
| 404 on confirm | Dialog closes, the task is removed from the list anyway, info toast (see API mapping) |

### 4.18 Segmented control (status filter)

Anatomy: track with 4 segments: "All", "To do", "In progress", "Done". Each segment: [label] · 6px · [count]. Track: height 32px, padding 2px, bg `bg-subtle`, `radius-sm`+2 = 12px. Segment: height 28px, padding 0 10px, `radius-sm`, `caption` weight 500, `text-secondary`. Count: `caption` tabular, `text-tertiary`, taken from `/tasks/stats` (All = todo + in_progress + done). Counts are display only, never used for pagination.

| State | Visual |
|---|---|
| default | as above |
| hover | label `text-primary` |
| focus-visible | ring on the segment |
| selected | sliding indicator under it: bg `bg-surface` (light) / `n-700` `#393D44` (dark), `shadow-xs`; label `text-primary` weight 600; count `text-secondary` |
| disabled | While first load is in flight, whole control `aria-disabled` and counts show "·" |
| loading | Not shown on the control; the list shows loading |

`role="radiogroup"` with `aria-label="Filter by status"`, each segment `role="radio"`. Arrow keys move and select; Home/End jump.

### 4.19 Menu (more actions, theme)

Anchored popover, min-width 200px, padding 4px, `bg-raised`, border 1px `border-default`, `radius-md`, `shadow-md`, 4px offset from trigger, aligned to trigger's right edge.

Item: height 32px, padding 0 8px, `radius-sm`, [icon 16px `text-secondary`] · 8px · [label `body`] · auto · [kbd chip `caption` `text-tertiary`, ≥1024px]. Divider: 1px `border-default`, margin 4px 0.

| State | Visual |
|---|---|
| hover / keyboard highlight | bg `bg-subtle` |
| focus-visible | highlight, no ring (roving highlight is the focus indicator inside menus) |
| destructive item | label and icon `danger-text`; highlight bg `danger-subtle` |
| selected (theme menu current option) | trailing `Check` 16px in `accent-text` |
| disabled | label `text-disabled`, not focusable |

Enter/exit: opacity + scale 0.98 to 1, 120ms `ease-standard`, transform origin top right.

Task more actions menu items, in order:

| Item | Icon | Kbd | Shown when |
|---|---|---|---|
| "Mark complete" | `CircleCheck` | X | `status !== "done"` |
| "Set status" (submenu: "To do", "In progress", "Done") | `CircleDashed` | S | always; current status has the check; picking "Done" uses the complete endpoint |
| "Edit" | `Pencil` | E | always |
| "Assign…" | `UserPlus` | A | `assignee === null` |
| "Reassign…" | `UserPen` | A | `assignee !== null` |
| divider | | | |
| "Delete" | `Trash2` | ⌫ | always, destructive |

Theme menu items: "System" (`Monitor`), "Light" (`Sun`), "Dark" (`Moon`).

---

## 5. Screens

### 5.1 Dashboard / stats overview

Location: top of `/`, regions 4 and 5 of the shell.

**Layout**: page header, then the stats grid (4 × 1 at ≥768px, 2 × 2 below). Tile order left to right: To do, In progress, Done, Overdue. Overdue is last so the eye ends on the alert.

**Data**: `GET /tasks/stats` on load and after every successful create, edit, status change, due date change, complete and delete. Assign does not trigger it because it cannot change any count.

**What the user can do**:

| Action | Result |
|---|---|
| Click / Enter on "To do", "In progress" or "Done" tile | Sets the list filter to that status, resets page to 1, scrolls the list toolbar into view if it is below the fold (smooth scroll, instant under reduced motion) |
| Click a selected tile | Clears the filter to All |
| Overdue tile | Not interactive; `aria-label="3 overdue tasks, past due and not done"` on a non-focusable element |

**Overdue as a warning**: when `overdue > 0`, the tile uses the warning treatment from 4.11 and the value is `warning-text`. The overdue count is also mirrored in the document title: "(3 overdue) Tasks". When 0, the title is "Tasks".

### 5.2 Task list

Location: `/`, regions 6 to 8.

**Toolbar**: segmented control left ("All · 12", "To do · 4", "In progress · 3", "Done · 5" visually, with the counts as separate spans). Range text right.

**List**: 10 cards max. Order is exactly the order the API returns (no client re-sorting, because re-sorting one page of an unsorted server list would make paging inconsistent).

**Quick actions per card**:

| Action | Mouse | Keyboard (card focused) |
|---|---|---|
| Open detail | Click card | Enter |
| Complete | Click checkbox | X, or Tab to checkbox + Space |
| Set status | More → Set status | S opens the menu at the status submenu |
| Edit | More → Edit | E |
| Assign / Reassign | More → Assign… / Reassign… (opens detail sheet with the assign field already in edit mode) | A |
| Delete | More → Delete (opens confirmation) | Delete or Backspace |

**Filter behavior**: selecting a segment updates `?status=`, resets page to 1, requests `GET /tasks?status={s}&page=1&limit=10` plus the page 2 lookahead. "All" omits `status`. While loading, the old cards stay visible at opacity 0.6 (after 150ms), then swap with no animation. Reason: a skeleton flash on every filter click feels slower than a brief dim.

**After a mutation that removes a card from the current filter** (e.g. completing a task while filtered to "To do"): the card stays in place showing its new state for 1200ms, then exits with the card exit animation, then the page and lookahead refetch. Reason: the user sees the result of their action before the item leaves.

### 5.3 Create task

Trigger: "New task" button in the top bar, "New task" in the empty state, or the N key anywhere (when focus is not in a text field and no overlay is open).

Shell: modal, title "New task".

Fields, top to bottom:

| Field | Label | Control | Placeholder / default | Validation |
|---|---|---|---|---|
| Title | "Title" | text input, autofocus | "What needs to be done?" | Required after trim. Error: "Add a title to create the task." Max 120. |
| Description | "Description" | textarea | "Add details, links or context (optional)" | Max 2000 |
| Status | "Status" | select | "To do" | none |
| Priority | "Priority" | select | "Medium" | none |
| Due date | "Due date" | date input | empty | Past date shows warning helper, does not block |

Assignee is not on this form because `POST /tasks` does not accept it; assigning happens from the detail sheet, where the dedicated endpoint lives.

Footer: "Cancel" secondary, "Create task" primary. Enter in the Title field submits; ⌘/Ctrl + Enter submits from any field.

Validation timing: Title error shows on submit attempt, then live-clears as soon as the field is non-empty. The submit button is never disabled for validation (a disabled button hides the reason); it is only in loading state while submitting.

Request: `POST /tasks` with `title` (trimmed), `description` (trimmed, `""` if empty), `status`, `priority`, `dueDate` (ISO or omitted when empty). If the chosen status is "done", the body sends `status: "todo"` and, on success, immediately calls `PATCH /tasks/:id/complete` so `completedAt` is stamped. The modal waits for both.

Success: modal closes, success toast "Task created", focus moves to the new card's title link if it is on the current page. The list refetches the current page; if the current filter excludes the new task's status, the toast adds action "View" which switches the filter to that status.

### 5.4 Edit task

Trigger: "Edit" in the card menu, E on a focused card, the pencil icon button in the detail sheet, or E while the sheet is open.

Shell: same modal, title "Edit task". Same fields, prefilled with the task's current values. Footer: "Cancel", "Save changes".

Request: `PUT /tasks/:id` with all five mutable fields: `title`, `description`, `status`, `priority`, `dueDate` (`null` when cleared). Exception: if status changed from not-done to "done", the PUT omits `status` and, on success, `PATCH /tasks/:id/complete` follows. If nothing changed, "Save changes" just closes the modal with no request and no toast.

Success: modal closes, success toast "Changes saved", focus returns to the element that opened the modal. If the sheet was open, it stays open and shows the updated task.

### 5.5 Task detail (including assign flow)

Route: `/tasks/:id`. Opens as the sheet over the list. Data comes from the task already loaded in the list. If the route is opened directly (deep link) and the task is not on the current page, the app finds it by fetching `GET /tasks` (unpaginated) once and picking it by `id`. Reason: there is no `GET /tasks/:id`. If not found: sheet does not open, URL is replaced with `/`, info toast "That task doesn't exist anymore. The server may have restarted."

Anatomy (top to bottom), sheet padding 24px horizontal:

| Order | Region | Spec |
|---|---|---|
| 1 | Header bar | height 56px, bottom border `border-default`, row: [status badge `large`] ... [edit icon button `md` `Pencil`] · 4px · [more actions icon button `md`] · 4px · [close icon button `md` `X`] |
| 2 | Title | 24px below header, `title-2`, wraps (no truncation), `text-primary`; done tasks get line-through as in cards |
| 3 | Description | 8px below title, `body`, `text-secondary`, preserves line breaks, links are not auto-linked. Empty: "No description" in `text-tertiary`, italic off |
| 4 | Properties | 24px below description, top border `border-default` with 16px top padding, overline "Details" in `text-tertiary` then 8px, then the property grid |
| 5 | Footer | sticky to sheet bottom, padding 16px 24px, top border `border-default`, bg `bg-raised`: [danger-ghost "Delete" with `Trash2`] ... [primary "Mark complete" with `CircleCheck`] |

Property grid rows (label `small` `text-secondary`, 112px column; value column):

| Label | Value | Interaction |
|---|---|---|
| "Status" | `sm` select with status icon | Change is optimistic (see section 7). Choosing "Done" calls the complete endpoint. |
| "Priority" | `sm` select with signal icon | Optimistic PUT |
| "Due date" | date text ("Today", "Sep 28", etc.) with overdue treatment when overdue; "No due date" in `text-tertiary` when null | Click / Enter turns it into the date input inline; change or clear saves on commit (blur or Enter), waits for response, spinner inside the field |
| "Assignee" | assignee chip `md` or the Unassigned treatment | Assign flow below |
| "Created" | "Sep 30, 2026 at 14:05" (`en-US` date + 24h time, local) | none |
| "Completed" | "Sep 30, 2026 at 16:40" | row shown only when `status === "done"` and `completedAt !== null` |

Footer "Mark complete" is replaced when `status === "done"` by a static line: `CircleCheck` 16px `success-text` + "Completed" `small` `text-secondary`, right aligned.

**Assign flow**

| Step | UI |
|---|---|
| Unassigned, at rest | [Unassigned treatment] · 12px · text button "Assign" (`accent-text`, `small` weight 500) |
| Assigned, at rest | [chip `md`] · 12px · text button "Reassign" |
| Editing | The row expands to: text input `sm` height 32px, full value column width, autofocus, prefilled with the current assignee (selected) or empty, placeholder "Type a name, e.g. Priya Sharma"; below it 8px gap then row: primary `sm` "Assign" (or "Save" when reassigning) · 8px · ghost `sm` "Cancel" |
| Suggestions | When the input has focus, a menu under it lists up to 5 distinct assignee names seen in any task response this session, filtered by case-insensitive prefix, header overline "Recent names". Up/Down highlights, Enter picks and submits. Hidden when no names match. |
| Validation | Submit with empty (after trim) value: input error "Enter a name. Tasks can be reassigned but not left unassigned." Submit is not sent. Max length 60. |
| Submitting | Primary button loading, input readonly. Waits for response (not optimistic). |
| Success | Row returns to rest with the new chip, success toast "Assigned to Priya Sharma" (name truncated to 32 chars with "…") |
| Failure | Stays in editing, error text under input with the API `error` message; 404 follows the global 404 rule |
| Cancel / Esc | Returns to rest, no request. Esc inside the input cancels the edit only, it does not close the sheet. |

There is no "Remove assignee" action anywhere, because the API has no unassign endpoint and does not accept an empty string.

### 5.6 Delete confirmation

Trigger: "Delete" in the card menu, Delete/Backspace on a focused card, "Delete" in the sheet footer, or ⌫ while the sheet is open (not when focus is in a text field).

Dialog:

- Title: "Delete this task?"
- Body: "“{title}” will be permanently removed. This can't be undone." Title truncated to 60 characters with "…".
- Buttons: "Cancel" (secondary, focused on open), "Delete task" (danger).

On confirm: `DELETE /tasks/:id`, not optimistic. On 204: dialog closes, the sheet closes if it showed this task, the card exits with the exit animation, success toast "Task deleted", stats and the current page refetch. Focus moves to the next card's title link; if none, the previous card's; if the list is now empty, the empty state's primary button.

No undo is offered, because the API has no restore and re-creating would produce a new `id` and `createdAt`.

---

## 6. Global states

Request rules that apply to every state below:

- Every request has an 8000ms timeout (AbortController). A timeout counts as a network failure.
- A **network failure** is a rejected fetch or a timeout, i.e. no HTTP response at all. It always triggers a `GET /health` check.
- GET requests that fail with a network failure or a non-2xx status are retried **once, automatically, after 1000ms**. Mutations (POST, PUT, PATCH, DELETE) are **never** retried automatically.

### 6.1 First-load skeleton

When: the app mounts, before `/tasks/stats` and the first page have both resolved.

| Region | Shows |
|---|---|
| Top bar | Real, interactive. "New task" enabled. |
| Page header | Real text |
| Stats row | 4 stat tile skeletons |
| Toolbar | Segmented control with labels and "·" in place of counts, `aria-disabled` |
| List | 5 task card skeletons |
| Pagination | Not rendered |

Requests fired in parallel: `GET /tasks/stats`, `GET /tasks?page=1&limit=10` (plus `status` from the URL if present), and the page 2 lookahead. `/health` is not called up front; it is called only if one of these has a network failure. Reason: a healthy start costs zero extra round trips.

Skeletons render immediately with no delay, and the swap to real content has no animation. Stats and list render independently as each response arrives.

### 6.2 Empty: no tasks at all

When: stats return `todo + in_progress + done === 0` and no status filter is active.

Layout: page header and stats row stay (all four tiles show "0" in `text-tertiary`; overdue shows its zero treatment). Toolbar and pagination are hidden. The list region shows the empty state, `no-tasks` variant:

| Part | Content |
|---|---|
| Icon | `ListTodo` |
| Title | "No tasks yet" |
| Body | "The API keeps tasks in memory, so a fresh server always starts empty. Add your first task, or load a few examples to look around." |
| Primary (`lg`) | "New task" with `Plus` icon and kbd "N" (≥1024px) |
| Secondary (`lg`) | "Add sample tasks" with `Layers` icon |

"Add sample tasks" sends, in sequence, 5 `POST /tasks` calls, then `PATCH /tasks/:id/complete` for task 5, then `PATCH /tasks/:id/assign` for tasks 1 and 2. Dates are computed from today using the date rule in 4.6.

| # | title | description | status | priority | dueDate | assignee |
|---|---|---|---|---|---|---|
| 1 | "Draft the Q4 roadmap review" | "Summarize what shipped, what slipped and why." | `in_progress` | `high` | today | "Priya Sharma" |
| 2 | "Fix the flaky checkout test" | `""` | `todo` | `high` | yesterday | "Alex Chen" |
| 3 | "Update the onboarding checklist" | "Add the new VPN setup steps." | `todo` | `medium` | today + 3 days | none |
| 4 | "Book a venue for the team offsite" | `""` | `todo` | `low` | none | none |
| 5 | "Write release notes for v2.4" | "Cover the new status filter and the dark theme." | `todo`, then completed | `medium` | yesterday | none |

While running: the button shows its spinner, label stays "Add sample tasks", "New task" stays enabled. On success: stats and page 1 load, success toast "Added 5 sample tasks". Task 2 makes the overdue tile show its warning state immediately, which demonstrates the state to a reviewer. On failure partway: stop, error toast "Couldn't add all sample tasks" with second line "{n} of 5 were added. {error}", and the list loads whatever exists.

### 6.3 Empty: filter matched nothing

When: a status filter is active and page 1 returns `[]` while the overall total is above zero. Different from 6.2: toolbar stays visible with the selected segment, stats stay, pagination hidden.

Empty state `filter-empty` variant, one per status:

| Filter | Icon | Title | Body |
|---|---|---|---|
| `todo` | `Circle` | "Nothing to do" | "Every task is either in progress or done." |
| `in_progress` | `CircleDashed` | "Nothing in progress" | "Move a task here from its menu with Set status." |
| `done` | `CircleCheck` | "No completed tasks yet" | "Tasks you mark complete will show up here." |

Action for all three: secondary `md` "Show all tasks" (sets filter to All). No primary action.

### 6.4 Request in flight

| Request | Visible feedback | Blocks what |
|---|---|---|
| Filter or page change (not cached) | After 150ms, current cards drop to opacity 0.6, list `aria-busy="true"`; the clicked pagination button shows a spinner | Nothing; a newer filter/page click cancels the older request (AbortController) and wins |
| Stats refresh after a mutation | None (values cross-fade when they arrive) | Nothing |
| Create / edit submit | Submit button spinner, fields readonly | Submitting twice |
| Complete, status, priority (optimistic) | Instant UI change, no spinner | Other mutations on the same task until it resolves |
| Due date inline save | Spinner inside the date field at its right edge | That field |
| Assign | "Assign"/"Save" button spinner | The assign field |
| Delete | "Delete task" spinner, Cancel disabled | The dialog |
| Sample tasks | Button spinner | That button |

Any single task with an in-flight mutation has its checkbox and menu `aria-disabled` until the response returns. Reason: two overlapping writes on one task could resolve out of order and show a stale final state.

### 6.5 Request failed (API reachable, request rejected)

| Failure | Where it shows | Copy | Retry |
|---|---|---|---|
| Page load failed (after the automatic retry) | List region, empty state `load-error` variant: icon `CircleAlert` in a disc tinted `danger-subtle` with icon `danger-subtle-text` | Title "Couldn't load tasks". Body "The server returned an error: {error}". If the body has no `error`: "Something went wrong while loading tasks." Button secondary "Try again" | Manual only after the one automatic retry |
| Stats load failed | Stat tiles error state (4.11) | "Couldn't load" in each footnote, "Retry" text button at the right of the stats row, above the tiles | Manual |
| Mutation 400 in a form | Form error banner | The API `error` string verbatim, e.g. "Title is required" | Manual (user resubmits) |
| Mutation 400 from a quick action | Error toast | Line 1 per action (section 9), line 2 the API `error` string | Manual |
| Mutation 404 | Info toast, task removed from view | "This task no longer exists" / line 2 "The server may have restarted, which clears all tasks." | None; list and stats refetch |

### 6.6 API unreachable (`/health` fails)

**Before any data has loaded** (first load hit a network failure and `/health` also failed):

Stats row, toolbar and list are replaced by a centered state inside the main container, 80px from the page header:

| Part | Content |
|---|---|
| Icon disc | `Unplug`, disc `bg-subtle`, icon `text-secondary` |
| Title | "Can't reach the API" |
| Body | "Tasks needs the server running at http://localhost:3000. Start it and this page will reconnect on its own." |
| Status line | `caption` `text-tertiary`, live countdown: "Trying again in 8s" and, during a check, "Checking…" |
| Button | primary `md` "Retry now" |

"New task" in the top bar is disabled with tooltip "Unavailable while the API is offline".

**After data has loaded** (a later request hits a network failure and `/health` fails): the current list stays visible and readable. A connection banner appears above the top bar: height 40px, bg `warning-subtle`, bottom border `warning-border`, content centered in the container: `TriangleAlert` 16px `warning-text` · 8px · "Connection lost. Changes can't be saved until the API is back." `small` `text-primary` · 12px · countdown "Retrying in 4s" `caption` `text-secondary` · 12px · text button "Retry now" (`caption` weight 600, `accent-text`). All mutation controls (New task, checkboxes, menu items, sheet selects, footer buttons) become `aria-disabled` with tooltip "Unavailable while offline". Any mutation that was in flight is rolled back as a failure.

**Retry policy (both cases): the app retries automatically.** It calls `GET /health` after 2s, 4s, 8s, 16s, then every 30s until it succeeds. "Retry now" runs a check immediately and restarts the schedule from 2s. When `/health` returns 200 with `OK`, the app reloads stats and the current page (replacing everything held in memory, since a restarted server has no tasks), removes the banner or unreachable state, and shows info toast "Reconnected to the API".

---

## 7. Interaction and motion

### 7.1 Mutations: optimistic or wait

Rule: single-field, single-click changes that are easy to reverse visually are optimistic. Anything typed, anything destructive, and anything that creates a record waits for the server.

| Mutation | Mode | Immediate UI | On success | On failure (rollback) |
|---|---|---|---|---|
| Complete (checkbox, X, menu, sheet button, status → Done) | Optimistic | Checkbox fills, badge becomes "Done", title gets line-through, overdue treatment removed; stats adjust locally (source status −1, done +1, overdue −1 if it was overdue) | Replace the task with the server object (now has `completedAt`), refetch stats and page | Card and stats revert to the exact previous values, card shake (4.7), error toast "Couldn't complete “{title}”" + API error or network line |
| Status change to To do / In progress | Optimistic | Badge and icon swap; stats adjust locally | Replace task, refetch stats and page | Revert, shake, error toast "Couldn't change the status" |
| Priority change (sheet) | Optimistic | Select and card indicator update | Replace task | Revert select and indicator, error toast "Couldn't change the priority" |
| Create | Wait | Submit spinner | Close modal, card enters (240ms) at its API position if on current page, success toast | Modal stays open, banner with API error |
| Edit (modal) | Wait | Submit spinner | Close modal, card updates in place with no animation beyond the badge cross-fade, success toast | Modal stays open, banner |
| Due date (sheet inline) | Wait | Field spinner | Field shows new value, card updates | Field reverts to previous value, error text under field in `danger-text` |
| Assign / reassign | Wait | Button spinner | Chip appears, success toast | Stays in edit mode with error text |
| Delete | Wait | Confirm spinner | Dialog closes, card exits (160ms), success toast | Dialog stays open with error line |

After every successful mutation except assign: refetch `/tasks/stats`, the current page and its lookahead. After assign: no refetch (counts and membership can't change).

### 7.2 What animates

Durations and curves are in 2.13. Summary of intent:

| Animates | Why |
|---|---|
| Overlays in and out (modal, dialog, sheet, menus, toasts) | Shows where the thing came from and went |
| Checkbox fill and badge cross-fade | Confirms the action landed |
| Card enter on create, card exit on delete | Shows which item appeared or left |
| Segmented control indicator | Connects the selected label to the list change |
| Hover and press color changes | Tactile feedback |
| Rollback shake | Draws the eye to the item that failed |

### 7.3 What is instant

| Instant | Why |
|---|---|
| Theme switch (a `no-transition` class is applied to `<html>` for one frame) | Hundreds of elements fading colors at once looks broken |
| Focus ring | Keyboard users need immediate position feedback |
| List content swap on filter or page change | Items are different data, not moved items; animating them implies continuity that doesn't exist |
| Skeleton to content swap | Same reason |
| Route change for the sheet (URL) | Not visual |
| Tooltip hide | Hides must never lag |
| Menu item highlight while arrowing | Keyboard speed |

---

## 8. Accessibility

Target: WCAG 2.2 AA.

### 8.1 Contrast

All text pairings are 4.5:1 or higher and all meaningful non-text UI (input borders, focus rings, checkbox outline, icons carrying meaning) is 3:1 or higher, in both themes. Full list with numbers in 2.7. The lowest text pairings are: light `text-tertiary` on `bg-subtle` 5.00:1, light `danger-text` on `bg-canvas` 5.20:1, and dark `text-tertiary` on `bg-subtle` 5.36:1. The checkbox outline uses `border-input` and measures 3.53:1 (light, on `#FFFFFF`) and 3.63:1 (dark, on `#151619`).

### 8.2 Focus order per screen

| Screen | Tab order |
|---|---|
| Overview + list | Skip link "Skip to tasks" (visible on focus, top left, 8px inset) → wordmark → theme menu → New task → To do tile → In progress tile → Done tile → segmented control (one tab stop, arrows inside) → for each card: checkbox → title link → more actions → Previous → Next |
| Empty (no tasks) | Skip link → wordmark → theme → New task (top bar) → To do / In progress / Done tiles → empty "New task" → "Add sample tasks" |
| Create / edit modal | Title → Description → Status → Priority → Due date → Clear due date (when shown) → Cancel → Submit → Close (X) → wraps to Title |
| Detail sheet | Close → Edit → More actions → (title and description are not focusable) → Status select → Priority select → Due date button → Assign/Reassign → Delete → Mark complete → wraps to Close. Initial focus: Close. |
| Delete dialog | Cancel (initial) → Delete task → wraps |
| Unreachable state | Wordmark → theme → Retry now |

Card checkbox comes before the title because completing is the most frequent quick action.

### 8.3 Keyboard path for every action

Global shortcuts are ignored while focus is in an input, textarea, select or contenteditable, and while any overlay other than the sheet is open.

| Action | Keys |
|---|---|
| New task | N |
| Filter All / To do / In progress / Done | 1 / 2 / 3 / 4 |
| Move between cards | ↓ / ↑ or J / K (moves focus between card title links; wraps at ends of the page, does not change page) |
| Previous / next page | [ / ] |
| Open detail | Enter on a focused card title |
| Complete | X on a focused card, or Space on the checkbox, or X in the sheet |
| Set status | S on a focused card (opens the menu at the status submenu), arrows, Enter |
| Edit | E on a focused card or in the sheet |
| Assign / reassign | A on a focused card (opens sheet in assign mode) or in the sheet |
| Delete | Delete or Backspace on a focused card or in the sheet → dialog → Tab to "Delete task" → Enter (Cancel has initial focus, so an accidental double Enter cancels) |
| Open card menu | Enter or Space on the more actions button, or Shift+F10 on a focused card |
| Close overlay | Esc |
| Submit form | Enter in Title, or ⌘/Ctrl + Enter anywhere in the form |
| Theme | Tab to theme button, Enter, arrows, Enter |

Menus: arrows move, Enter selects, Esc closes and returns focus to the trigger, → opens a submenu, ← closes it, typing a letter jumps to the first matching item.

### 8.4 Live regions

Two regions, both mounted once at app root and visually hidden except the toast container.

| Region | Politeness | Announces |
|---|---|---|
| Status region | `polite` | "Loading tasks" on first load; "{count} tasks shown, {filter label}" after a filter change (e.g. "4 tasks shown, To do"); "Page 2, tasks 11 to 20" after a page change; "No tasks match this filter" for 6.3 |
| Toast container (`role="region"`, `aria-label="Notifications"`) | Each toast: success and info `role="status"` (polite), error `role="alert"` (assertive) | Every toast message listed in sections 5, 6 and 9 |
| Connection banner | `role="alert"` on appear; the countdown text is `aria-live="off"` so it doesn't announce every second | "Connection lost. Changes can't be saved until the API is back." |

Stat value changes are not announced (they would fire after every action and duplicate the toast).

### 8.5 Focus trap and return

Modal, sheet and confirmation dialog: `role="dialog"` (`alertdialog` for delete), `aria-modal="true"`, `aria-labelledby` the title, rest of the app `inert`. Tab and Shift+Tab cycle inside. Focus return on close:

| Closed overlay | Focus returns to |
|---|---|
| Create modal (success) | The new card's title link if it is on the current page, else the "New task" button that opened it |
| Create modal (cancel) | The element that opened it |
| Edit modal | The element that opened it (card more actions button, or sheet edit button) |
| Sheet | The card title link of that task; if the card is gone, the list's first card title, else the "New task" button |
| Delete dialog (cancel) | The element that opened it |
| Delete dialog (success) | Next card title → previous card title → empty state primary button |
| Menu | Its trigger |

Delete opened from the sheet: dialog stacks above the sheet; on success both close and focus follows the delete rule; on cancel focus returns to the sheet's Delete button.

### 8.6 Status and priority without color

| Signal | Non-color carrier |
|---|---|
| Status | Distinct icon shape (`Circle` empty, `CircleDashed` broken ring, `CircleCheck` checked) + text label "To do" / "In progress" / "Done" |
| Priority | Bar count (1, 2, 3 filled bars) + text label; compact variant has `aria-label="Priority: High"` |
| Overdue | `TriangleAlert` icon + the word "Overdue" in the date text + for the tile, the label "Overdue" |
| Done task | Line-through title + filled checkbox with check + "Completed {date}" text |
| Selected filter / tile | Raised indicator shape and weight 600 label, plus `aria-checked` / `aria-pressed` |
| Errors | `CircleAlert` icon + text, never border color alone |

Screen reader name of a card title link: "{title}, {status label}, {priority label} priority{, overdue}{, due {date}}{, assigned to {name}}". Example: "Fix the flaky checkout test, To do, High priority, overdue, due Sep 29, assigned to Alex Chen".

Text scales with browser font size (all sizes in rem); layout holds at 200% zoom with the base breakpoint behaviors.

---

## 9. API mapping

Base URL `http://localhost:3000`. All requests with a body send `Content-Type: application/json`. "Network failure" handling is identical for every row: error toast "Couldn't reach the server" (line 2 "Check that the API is running on localhost:3000.") for mutations, automatic retry for GETs, then the `/health` check and 6.6. It is not repeated below. The global 404 rule (**G404**): close any modal, sheet or dialog showing that task, remove its card, refetch stats and the current page, info toast "This task no longer exists" / "The server may have restarted, which clears all tasks."

| UI action | Method + path | Request body | Success handling | Error handling |
|---|---|---|---|---|
| Connectivity check | `GET /health` | none | 200 `OK`: proceed / reconnect (6.6) | Any failure: unreachable state or banner, retry schedule |
| Load stats | `GET /tasks/stats` | none | 200: render tiles and segment counts | Non-2xx after retry: tile error state |
| Load page | `GET /tasks?page={n}&limit=10` + `&status={s}` when filtered | none | 200 array: render cards; `[]` on page 1 → 6.2 or 6.3; `[]` on page > 1 → go to page n−1 | 400: list error state with `error` text |
| Lookahead for Next | `GET /tasks?page={n+1}&limit=10` + same `status` | none | Length ≥ 1: Next enabled, cache result; `[]`: Next disabled | Any failure: Next disabled, no message |
| Deep link to a task not on current page | `GET /tasks` | none | Find by `id`: open sheet; not found: replace URL with `/`, info toast "That task doesn't exist anymore" / "The server may have restarted." | Failure: replace URL with `/`, same list error handling as page load |
| Create task | `POST /tasks` | `{ "title", "description", "status", "priority", "dueDate"? }` (`dueDate` omitted when empty; `status` sent as `"todo"` if user chose Done) | 201 task: close modal, toast "Task created", refetch | 400: form banner with `error` |
| Create task as Done (second step) | `PATCH /tasks/:id/complete` | none | 200: as above | Failure: modal closes anyway (task exists), error toast "Task created, but couldn't mark it complete" + `error` |
| Save edit | `PUT /tasks/:id` | `{ "title", "description", "status", "priority", "dueDate" }` (`dueDate` `null` when cleared; `status` omitted when changing to Done) | 200 task: close modal, toast "Changes saved", refetch | 400: form banner with `error`. 404: G404 |
| Save edit to Done (second step) | `PATCH /tasks/:id/complete` | none | 200: toast "Changes saved" | Failure: modal closes, error toast "Changes saved, but couldn't mark it complete" + `error`. 404: G404 |
| Complete task | `PATCH /tasks/:id/complete` | none | 200 task: replace optimistic card, refetch; toast "Marked complete" with the title as line 2 | 400: rollback + error toast "Couldn't complete “{title}”" + `error`. 404: rollback then G404 |
| Set status To do / In progress | `PUT /tasks/:id` | `{ "status": "todo" }` or `{ "status": "in_progress" }` | 200 task: replace card, refetch; no toast (the badge change is the confirmation) | 400: rollback + error toast "Couldn't change the status" + `error`. 404: G404 |
| Change priority (sheet) | `PUT /tasks/:id` | `{ "priority": "low" \| "medium" \| "high" }` | 200 task: replace; no toast | 400: rollback + error toast "Couldn't change the priority" + `error`. 404: G404 |
| Change or clear due date (sheet) | `PUT /tasks/:id` | `{ "dueDate": "<ISO>" }` or `{ "dueDate": null }` | 200 task: update field and card, refetch stats (overdue may change); no toast | 400: field reverts, `error` under field. 404: G404 |
| Assign / reassign | `PATCH /tasks/:id/assign` | `{ "assignee": "<trimmed non-empty>" }` | 200 task: show chip, toast "Assigned to {name}" | 400: `error` under the input, stay in edit mode. 404: G404 |
| Delete task | `DELETE /tasks/:id` | none | 204: close dialog (and sheet), card exits, toast "Task deleted", refetch | 400: error line in dialog with `error`. 404: close dialog, remove card, info toast "This task was already deleted", refetch |
| Add sample tasks | `POST /tasks` ×5, then `PATCH /tasks/:id/complete` ×1, `PATCH /tasks/:id/assign` ×2 | Per table in 6.2 | All succeed: toast "Added 5 sample tasks", load | First failure stops the sequence: error toast "Couldn't add all sample tasks" / "{n} of 5 were added. {error}" |

Responses are read with these guarantees assumed from the contract: every task has all nine keys; list endpoints return bare arrays; error bodies are `{ "error": string }`. If an error body can't be parsed as JSON, the UI uses "Something went wrong" as the message.

---

## 10. Out of scope

- Authentication, accounts, signup, profile and settings pages (the theme menu is the only preference).
- Teams, sharing, comments, attachments, subtasks, tags and labels.
- Search, free-text query, priority filter, sorting and multi-select filters.
- Drag-and-drop reordering, board or kanban view, calendar view.
- Bulk selection and bulk actions.
- Recurring tasks, reminders and notifications.
- Offline editing or a local cache that survives reload (data is server memory only).
- Undo for delete or complete.
- Removing an assignee.
- A standalone full-page task route (detail is always a sheet over the list).
- Internationalization; all copy is `en-US`.
- A keyboard shortcuts help dialog (shortcuts are surfaced in tooltips and menus instead).

---

## 11. Appendix: would need a backend change

| Idea | Required endpoint change |
|---|---|
| Numbered pager with "Page 2 of 5" and jump to page | `GET /tasks` returns `{ "items": [...], "total": number }` or sets an `X-Total-Count` response header |
| "Remove assignee" action | `PATCH /tasks/:id/assign` accepts `{ "assignee": null }`, or a new `DELETE /tasks/:id/assign` |
| Clickable overdue tile that lists overdue tasks | `GET /tasks?overdue=true` filter, combinable with `page` and `limit` |
