---
name: InkHR
description: Design system for an HR portfolio. Paper, ink and one cobalt.
themes: [light, dark]
densities: [comfortable, compact]
source:
  [
    packages/tokens/src/inkhr.tokens.json,
    packages/tokens/src/modes/light.json,
    packages/tokens/src/modes/dark.json,
  ]
maintained: by hand; every token name is checked against the token files in CI
---

# InkHR, style reference

## About this file

- **Purpose.** The design-side guide to InkHR for Claude Design and for people: how InkHR looks and feels, which roles to use, the component recipes, the judgement calls and how to ask for a screen. It is not an engineering spec.
- **Where it sits.** `AGENTS.md` is the engineering map and links here. The token files hold every value. `components.json` holds each component's API. `specs/NNN-feature/` holds the plan for one feature. `llms.txt` is the index. This file names roles and never repeats a value.
- **How Claude Design uses it.** Claude Design is always set up from the repository, never from this file alone: it reads the token files, the generated CSS and the components next to this file, and this file tells it how to use them.
- **How it is kept.** Edited by hand when a role, a component recipe or a rule changes. Current state only: when something changes, rewrite the passage, never add history. Sections keep this order. Roles and CSS variables only: no hex values, no sizes that exist as tokens, no primitives. A CI check fails when a token name or CSS variable mentioned here does not exist in the token files. Copy follows the InkHR copy guide.

Numbers appear only where no token exists yet, such as design frame sizes.

## Overview

InkHR is the design system for an HR portfolio: self-service, people, time off, expenses, payroll and the manager inbox. Its line is paper, ink, the well. Paper is every product surface: near-white, neutral and flat. Ink is every mark a person makes: charcoal text and cobalt for the one thing to do next. The well is where welcome, onboarding and empty surfaces draw from: real ink photographed on paper, used once per surface and never behind work.

It should feel calm and precise, like a well-kept file. Screens are quiet so a leave balance, a request or an approval reads first. One cobalt action per view, sentence case everywhere, no decoration a person has to look past.

People: employees requesting time off and checking payslips, managers approving requests in their inbox, payroll specialists working in dense tables. The sample employee is Ana Kuiper; her manager is Marieke de Jong.

## Colour

Paper and ink carry the interface; cobalt is the only action and signal hue. Status and data colours never colour body text and never fill a button, with one exception: brick fills the destructive button, `sys.action.danger.bg`. Components read the role through its CSS variable and never a hex value or a primitive such as `ref.color.cobalt.700`; the token files hold the values.

| Name                    | Role                          | CSS variable                             | Use                                                                                                                                                            |
| ----------------------- | ----------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paper                   | `sys.surface.page`            | `var(--ink-sys-surface-page)`            | The canvas of every screen. Near-white, neutral, never tinted.                                                                                                 |
| Card                    | `sys.surface.default`         | `var(--ink-sys-surface-default)`         | Cards, fields, dialogs, the app bar. The surface text is measured against.                                                                                     |
| Sunken                  | `sys.surface.sunken`          | `var(--ink-sys-surface-sunken)`          | Recessed areas inside a card, one step below it.                                                                                                               |
| Ink                     | `sys.text.primary`            | `var(--ink-sys-text-primary)`            | Body text, headings, values. The mark a person makes.                                                                                                          |
| Quiet ink               | `sys.text.secondary`          | `var(--ink-sys-text-secondary)`          | Metadata, captions, secondary labels.                                                                                                                          |
| Hairline                | `sys.border.subtle`           | `var(--ink-sys-border-subtle)`           | Dividers between rows and sections.                                                                                                                            |
| Edge                    | `sys.border.default`          | `var(--ink-sys-border-default)`          | Card boundaries. A field or other control reads `sys.border.strong`.                                                                                           |
| Edge, under the pointer | `sys.border.strong-hover`     | `var(--ink-sys-border-strong-hover)`     | The edge of a field under the pointer. Focus reads `sys.border.focus` and the ring.                                                                            |
| Cobalt                  | `sys.action.primary.bg`       | `var(--ink-sys-action-primary-bg)`       | The one action colour: the primary button and tabs. Links read `sys.text.link`, selection `sys.selected.bg` and `sys.selected.border`, focus `sys.focus.ring`. |
| Cobalt, pressed ink     | `sys.action.primary.bg-hover` | `var(--ink-sys-action-primary-bg-hover)` | Primary button on hover.                                                                                                                                       |
| Selected wash           | `sys.selected.bg`             | `var(--ink-sys-selected-bg)`             | Selected rows, nav items and chips, with `sys.text.on-selected`.                                                                                               |
| Inverse                 | `sys.surface.inverse`         | `var(--ink-sys-surface-inverse)`         | Tooltips and toasts.                                                                                                                                           |

Contrast on the card surface: ink 18.4:1 light and 15.8:1 dark, quiet ink 6.7:1 and 12.8:1, white on cobalt 7.0:1, ink on dark cobalt 10.5:1.

Status, always with a dot or an icon and a word:

| Status  | Text on background                                   | Edge and icon                                          | Contrast, light | Contrast, dark |
| ------- | ---------------------------------------------------- | ------------------------------------------------------ | --------------- | -------------- |
| Success | `sys.status.success.text` on `sys.status.success.bg` | `sys.status.success.border`, `sys.status.success.icon` | 8.4:1           | 9.7:1          |
| Warning | `sys.status.warning.text` on `sys.status.warning.bg` | `sys.status.warning.border`, `sys.status.warning.icon` | 8.8:1           | 9.6:1          |
| Danger  | `sys.status.danger.text` on `sys.status.danger.bg`   | `sys.status.danger.border`, `sys.status.danger.icon`   | 6.7:1           | 9.6:1          |
| Info    | `sys.status.info.text` on `sys.status.info.bg`       | `sys.status.info.border`, `sys.status.info.icon`       | 8.9:1           | 10.0:1         |

Data colours tell leave types, departments and chart series apart, used in this order; never a button fill, never text. They are theme roles, and each reaches 3:1 against the surface in both themes:

`sys.data.1.bg`, `sys.data.2.bg`, `sys.data.3.bg`, `sys.data.4.bg`, `sys.data.5.bg`, `sys.data.6.bg`.

## Typography

`font.family.sans` (Open Sans) for every component, in three weights. `font.family.display` (Instrument Serif) appears only at display size on welcome, onboarding and empty surfaces, as one italic phrase inside a headline ("Good morning, Ana. _Nothing waits on you today._"), never as a heading or body copy. Figures are tabular (`font.numeric.tabular`). Type sizes compile to rem, so 200 percent text size grows a control with its text. Components set a whole role through its variable, never a size, line height or weight of their own.

| Role                     | CSS variable                    | Family                | Use                                                                            |
| ------------------------ | ------------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `sys.type.display`       | `var(--sys-type-display)`       | `font.family.sans`    | The one figure a view is about: a leave balance, a KPI value, a payslip total. |
| `sys.type.heading.lg`    | `var(--sys-type-heading-lg)`    | `font.family.sans`    | The page title, once per page.                                                 |
| `sys.type.heading.md`    | `var(--sys-type-heading-md)`    | `font.family.sans`    | Section titles, dialog titles.                                                 |
| `sys.type.heading.sm`    | `var(--sys-type-heading-sm)`    | `font.family.sans`    | Card titles, group labels.                                                     |
| `sys.type.body.lg`       | `var(--sys-type-body-lg)`       | `font.family.sans`    | Lead paragraphs on welcome and empty surfaces.                                 |
| `sys.type.body.md`       | `var(--sys-type-body-md)`       | `font.family.sans`    | Default text, table cells, field values.                                       |
| `sys.type.body.sm`       | `var(--sys-type-body-sm)`       | `font.family.sans`    | Help text, metadata, timestamps.                                               |
| `sys.type.label.md`      | `var(--sys-type-label-md)`      | `font.family.sans`    | Buttons, field labels, tabs.                                                   |
| `sys.type.label.sm`      | `var(--sys-type-label-sm)`      | `font.family.sans`    | Badges, table headers, small labels.                                           |
| `sys.type.code`          | `var(--sys-type-code)`          | `font.family.mono`    | Employee numbers, IBANs, reference codes.                                      |
| `sys.type.display-serif` | `var(--sys-type-display-serif)` | `font.family.display` | One italic phrase on welcome, onboarding and empty surfaces.                   |

A role never carries colour; colour comes from `sys.text.*`.

## Layout and spacing

- Spacing uses `space.0` to `space.12`, a 4 px scale read as `var(--space-4)` and so on. Control heights are 32 / 40 / 48, compact 28 / 32 / 40; they are not tokens yet and join the density files when they are.
- Desktop screens are designed at 1440 by 900: a side navigation, a 56 px app bar with the lock-up at the left, and content in cards on paper.
- The three core screens: request and approve (a form with the balance beside it), the people directory (a data grid), and the employee profile (a header with the duotone portrait, then description lists).
- Phones are designed at 390 by 844. Tables stack into cards under 720 px, and touch layouts use comfortable density, with controls of 40 px and up.
- Density is a scope: `data-density="compact"` on the root or a subtree tightens heights and padding, never type size.

## Elevation and depth

The product canvas is flat; depth only says that something floats.

- `elevation.1` cards and hovered rows, `elevation.2` menus and popovers, `elevation.3` side panels and toasts, `elevation.4` dialogs.
- Shadows are two layers tinted with ink (`ref.color.ink.900`, read only by the elevation tokens) in light. In dark they use black at the same strength and the surface steps up one level instead.
- Layers use `z.base`, `z.raised`, `z.dropdown`, `z.sticky`, `z.overlay`, `z.modal`, `z.popover` and `z.toast`, in that order.
- Motion is short and caused by the person: `motion.duration.fast` for a press, `motion.duration.base` for most changes, `motion.duration.slow` for panels, with `motion.easing.standard`. Reduced motion turns every duration to `motion.duration.instant`.

## Shapes

`radius.md` on fields and inputs, `radius.lg` on cards and alerts, `radius.xl` on dialogs and panels, `radius.image` on photographs, `radius.button` (a pill) on buttons and chips, `radius.full` on avatars and `radius.sm` on checkboxes. The ink drop mark is the only organic shape in the product.

## Components

Recipes for the components people meet most. Every component is an Angular component with the `ink-` selector; its full API is in `components.json`.

- **Primary button** (`ink-button variant="primary"`): cobalt fill, `sys.action.primary.text` label in `sys.type.label.md`, `radius.button`, 40 px high (32 small, 48 large). Hover deepens to `sys.action.primary.bg-hover`; pressed moves down 1 px for `motion.duration.fast`. One per view. Label starts with a verb: "Request time off".
- **Secondary button**: card fill, ink label, a `sys.action.secondary.border` edge, pill. For the second action, such as "Save draft".
- **Danger button**: `sys.action.danger.bg` fill, only for irreversible actions and always inside a confirmation dialog: "Reject request".
- **Field** (`ink-field`): label above in `sys.type.label.md`, a 40 px control with `radius.md` and a `sys.border.strong` edge, `sys.border.strong-hover` under the pointer, and `sys.border.focus` with the focus ring when focused, help or error below in `sys.type.body.sm`. Errors combine text, an icon and the danger colour. The placeholder is never the label.
- **Data grid** (`ink-data-grid`): rows 44 px, compact 36; sticky header in `sys.type.label.sm` on the paper tone; tabular figures, amounts right-aligned; row checkboxes and menus are named with the row ("Select Bram de Vries").
- **Badge** (`ink-badge`): a dot and a word on the status background, `sys.type.label.sm`, `radius.button`. "Pending", "Approved".
- **App bar** (`ink-app-bar`): 56 px, card surface, hairline below, lock-up at the left, search, notifications and the avatar at the right.
- **Tabs and side navigation**: the selected item uses the selected wash with `sys.text.on-selected`; cobalt marks the current item, nothing else does.
- **Dialog** (`ink-dialog`): card surface, `radius.xl`, `elevation.4`, a title that names the action, buttons that name the outcome: "Keep request" and "Reject request".
- **Toast** (`ink-toast`): inverse surface, `elevation.3`, the outcome plus one action where it can be undone: "Request sent. Undo".
- **Empty state** (`ink-empty-state`): the ink drop, what this is, why it is empty, one button.
- **KPI tile** (`ink-kpi-tile`): the figure in `sys.type.display`, a label, and a delta with a sign, never an arrow alone.
- **Avatar** (`ink-avatar`): initials in `sys.avatar.text` on `sys.avatar.bg`, or a photograph through the duotone.

## Do's and don'ts

- Do use one cobalt primary per view. Don't add a second accent colour or fill a button with a status or data colour; the destructive button is the one exception.
- Do let paper and ink carry the screen. Don't put texture, gradients or photographs behind a table, form or chart.
- Do show status with a dot or icon and a word. Don't rely on colour alone.
- Do put the label above the field and help below it. Don't use the placeholder as the label.
- Do write sentence case, verbs on buttons and errors that say what to do next. Don't use exclamation marks, emoji, em dashes or chains of middle dots.
- Do use Instrument Serif for one italic phrase on welcome surfaces. Don't use it for headings, labels or body copy.
- Do read tokens by their role (`sys.text.secondary`). Don't write hex values, px radii or shadows in a component, or read a primitive such as `ref.color.cobalt.700`.
- Do keep focus visible: a 2 px ring outside a 2 px surface gap on every control, fields included. Don't remove outlines.
- Do move only what the person caused. Don't animate on load or loop anything.

## Imagery and texture

- Ink art is real ink photographed on white or charcoal paper: the wash (16:9), the stroke (21:9), the drop and the ring (1:1). It appears only on welcome, onboarding and empty surfaces, one asset per surface. The ring means done, never progress, and never moves.
- A wash that carries text sits under the white scrim, and the mark never sits on a wash.
- Photography in a cobalt duotone: the photo goes grey, `image.treatment.tint` is screened over it, so shadows turn cobalt and highlights stay paper. Radius 16. Welcome, onboarding, empty states and the profile header only.
- Ink is never drawn or generated by code, and photographs are never shown untreated.

## Voice and copy

- Calm, precise, plain. Sentence case. Dutch HR terms where they exist.
- Buttons start with a verb and name the object when it is not obvious: "Reject request", "Add employee".
- Errors say what happened and what to do: "Enter a valid IBAN. Dutch IBANs have 18 characters."
- Help text says what to enter or where the value comes from: "Six digits, found on your payslip".
- Dates day-month-year; decimal comma for FTE and money; metadata separated by commas.
- Sample data: Ana Kuiper (signed in), Bram de Vries, Chloé Jansen, Sanne Dekker, Tom Bakker, Marieke de Jong (manager). Ana's October leave is pending: 16 days statutory, 5 requested, 11 left.

## Accessibility

WCAG 2.2 AA is the floor. Every text pairing reaches 4.5:1 on its surface and every boundary and focus indicator 3:1, in both themes, computed from the tokens. Every control is at least 24 by 24 px, and touch layouts use controls of 40 px and up. Every control has a name; repeated controls carry the row's name. Status is never colour alone, and reduced motion is respected.

## Agent prompt guide

Read `AGENTS.md` first, then this file. Use `components.json` or the MCP server for a component's API, the token files for values, and `GAPS.md` for what InkHR does not have: if a component or token is not listed, stop and ask instead of inventing one.

Shorthand, always as roles: paper is `sys.surface.page`, card `sys.surface.default`, ink `sys.text.primary`, cobalt `sys.action.primary.bg`. Themes switch the values, never the names, so a screen written with roles works in light and dark. Never write a hex value, even one copied from a screenshot.

Example prompts:

- "Build the leave request screen in InkHR: the request form in a card on paper, Ana Kuiper's balance beside it (16 days statutory, 5 requested, 11 left) as a KPI tile, one primary button, 'Request time off'."
- "Show the manager inbox as an InkHR data grid with a pending badge per row and row actions named with the employee."
- "Design the empty state for 'No requests yet' with the ink drop, one sentence and the button 'Request time off'. Light and dark."

## Quick start

`@inkhr/tokens` defines the variables for light under `:root` and for dark under `[data-ink-theme="dark"]`. Styles only read them:

```css
.leave-summary {
  background: var(--ink-sys-surface-default);
  color: var(--ink-sys-text-primary);
  border: 1px solid var(--ink-sys-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--elevation-1);
}
.leave-summary .caption {
  color: var(--ink-sys-text-secondary);
  font: var(--sys-type-body-sm);
}
```

```html
<!-- Angular -->
<ink-field
  label="First day"
  help="Day, month and year, for example 12-10-2026."
>
  <ink-date-field></ink-date-field>
</ink-field>
<ink-button variant="primary">Request time off</ink-button>
```

Other web frameworks use the same stylesheets from `@inkhr/styles`; their class names are documented on the docs site.

## Token names

The closed set. Values are in the token files; never invent a name.

- `sys.surface.*`: page, default, raised, sunken, inverse
- `sys.text.*`: primary, secondary, tertiary, disabled, link, on-selected, placeholder, inverse
- `sys.border.*`: default, strong, strong-hover, subtle, focus
- `sys.action.*`: primary.bg, primary.bg-hover, primary.bg-pressed, primary.text, secondary.bg, secondary.bg-hover, secondary.border, secondary.text, danger.bg, danger.bg-hover, danger.text
- `sys.signal.*`: bg, bg-hover, bg-pressed, text
- `sys.status.*`: success.text, success.bg, success.border, success.icon, warning.text, warning.bg, warning.border, warning.icon, danger.text, danger.bg, danger.border, danger.icon, info.text, info.bg, info.border, info.icon
- `sys.selected.*`: bg, border
- `sys.focus.*`: ring
- `sys.avatar.*`: bg, text
- `sys.data.*`: 1.bg, 2.bg, 3.bg, 4.bg, 5.bg, 6.bg
- `sys.type.*`: display, heading.lg, heading.md, heading.sm, body.lg, body.md, body.sm, label.md, label.sm, code, display-serif
- `space.0` to `space.12`; `radius.xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `image`, `button`, `full`
- `elevation.1` to `elevation.4`; `z.*`; `motion.duration.*`, `motion.easing.*`
- `texture.ink.wash`, `texture.ink.stroke`, `texture.ink.drop`, `texture.ink.ring`, `texture.scrim`; `image.treatment.*`
