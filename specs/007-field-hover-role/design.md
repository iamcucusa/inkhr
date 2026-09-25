# 007 Field hover role: design

## The role

In `packages/tokens/src/modes/light.json` and `dark.json`, after `sys.border.strong`:

```json
"strong-hover": {
  "$type": "color",
  "$value": "{ref.color.ink.700}",
  "$description": "The edge of a field, a select or a textarea under the pointer: two steps further along the neutral axis than `sys.border.strong`. Never cobalt, which is kept for `sys.border.focus`."
}
```

In `dark.json` the value is `{ref.color.paper.300}`; the description is the same, byte for byte.

| Pair                                                             | Light  | Dark                                |
| ---------------------------------------------------------------- | ------ | ----------------------------------- |
| `sys.border.strong-hover` on `sys.surface.default`               | 6.71:1 | 10.79:1                             |
| `sys.border.strong-hover` on `sys.surface.raised`                | 6.71:1 | 8.92:1                              |
| `sys.border.strong` to `sys.border.strong-hover`                 | 2.04:1 | 2.15:1                              |
| `sys.border.default` on `sys.surface.default`                    | 1.53:1 | 2.46:1                              |
| `sys.border.strong` to `sys.border.focus`                        | 1.48:1 | 1.88:1                              |
| `sys.border.focus` and `sys.focus.ring` on `sys.surface.default` | 4.88:1 | 9.43:1 today, 6.93:1 after spec 008 |

Every ratio is WCAG relative luminance on the token values, compared unrounded and printed to two decimals. The first two rows are why the role exists; the fourth is why hover cannot read `sys.border.default`; the last two are why a focused field also takes the ring.

## The lint

In `packages/tokens/lint/inkhr-rules.mjs`, next to `NEUTRAL`, a closed map of the neutral variants that may carry a state, and in `GRAMMAR` one shape per entry:

```js
// A neutral name takes a state after its variant only where the product draws one.
const NEUTRAL_STATES = { border: { strong: ['hover'] } };
```

```js
...Object.entries(NEUTRAL_STATES).flatMap(([family, variants]) =>
  Object.entries(variants).map(
    ([variant, states]) =>
      new RegExp(`^sys\\.${family}\\.${variant}-${oneOf(states)}$`),
  ),
),
```

The map grows one entry at a time, each with the decision that draws the state. An open pattern, `sys.{family}.{variant}(-{state})?`, was considered and not chosen: it would accept `sys.text.link-hover` and `sys.surface.page-pressed`, names nobody has decided on.

## The sentences

These `$description`s change, word for word:

| Token                 | File             | New sentence                                                                                                                                                                            |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sys.border.focus`    | both theme files | A focused field, select or textarea draws this border on itself, inside the `sys.focus.ring` it takes like every control. Under the pointer it reads `sys.border.strong-hover` instead. |
| `sys.focus.ring`      | both theme files | Drawn outside a control with keyboard focus, held off it by two pixels of the surface behind. Every control takes it, and a field also turns its own border to `sys.border.focus`.      |
| `ref.color.ink.700`   | shared file      | A step darker, for text on paper that carries more than metadata and for the edge of a field under the pointer. On ink, a line that has to be seen.                                     |
| `ref.color.paper.300` | shared file      | A line meant to be seen on paper. Far enough from ink for the quietest text that still has to clear 4.5:1, and for the edge of a field under the pointer.                               |

After specs 007 to 009 the three source files are byte for byte the design workspace's export of 25 September 2026, which is how the package map says `src/` is kept.

## Tests

`packages/tokens/tests/check.test.mjs`, beside the naming fixtures:

| Fixture                                    | Edit                                                                                            | Expected rules                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------ |
| a neutral state written with a dot         | light `sys.border.strong.hover`, nested inside the token as "a dotted state beside the role" is | `inkhr/naming`                       |
| a state on a neutral variant that has none | light `sys.text.link-hover`                                                                     | `inkhr/naming`, `inkhr/theme-parity` |
| a neutral state outside the list           | light `sys.border.strong-pressed`                                                               | `inkhr/naming`, `inkhr/theme-parity` |
| the new role in one theme only             | delete dark `sys.border.strong-hover`                                                           | `inkhr/theme-parity`                 |

The source passes. `packages/tokens/tests/outputs.test.mjs` needs no change: it compares output names with the source and counts nothing. `packages/tokens/tests/rule-file.test.mjs` runs the new rule file row with its existing `inkhr/naming` runner, which nests the incorrect form inside the existing token and checks that the correct form exists in `light.json`.

## The rule file

Rule 3 of `.claude/skills/inkhr/rules/tokens.md` gains one row; the others do not change.

| Rule                              | Incorrect                 | Correct                   | Caught by      |
| --------------------------------- | ------------------------- | ------------------------- | -------------- |
| 3. A state is a hyphen at the end | `sys.border.strong.hover` | `sys.border.strong-hover` | `inkhr/naming` |

## Documentation

- **`DESIGN.md`:**
  - Colour table, after the Edge row: `| Edge, under the pointer | sys.border.strong-hover | var(--ink-sys-border-strong-hover) | The edge of a field under the pointer. Focus reads sys.border.focus and the ring. |`, with the token, the variable and the two role names in backticks as the other rows have them.
  - Field recipe: "a `sys.border.default` edge" becomes "a `sys.border.strong` edge, `sys.border.strong-hover` under the pointer, and `sys.border.focus` with the focus ring when focused". The recipe's `sys.border.default` contradicts the Edge row, which already says a field reads `sys.border.strong`.
  - Do's and don'ts: "Do keep focus visible: a 2 px ring outside a 2 px surface gap." becomes "Do keep focus visible: a 2 px ring outside a 2 px surface gap on every control, fields included."
  - Token names: the `sys.border.*` line becomes "default, strong, strong-hover, subtle, focus".
- **`packages/tokens/AGENTS.md`, within its 60 lines:** the grammar line `sys.border.{default|strong|subtle|focus}` becomes `sys.border.{default|strong|strong-hover|subtle|focus}`, and the line adds that a neutral name takes a state only where `NEUTRAL_STATES` lists one, `strong-hover` today. Where to look next: `specs/007-field-hover-role/` joins the list.
- **The rules file header** in `lint/inkhr-rules.mjs` names this spec beside spec 004 as the source of the grammar.
- **Changeset:** `@inkhr/tokens` minor: "Add `sys.border.strong-hover`, the edge of a field under the pointer, in both themes."

## Review questions

For any change to a cobalt step or to a role that reads cobalt, the reviewer asks two questions and asks for the screenshot that answers them: one dense screen per theme with a focused field beside the primary button, a selected row and a link.

1. Does the action stay the strongest cobalt on the screen?
2. Does every pair of roles that can share a screen have a cue besides colour?

No test checks the first question. The second is covered in part by axe's `link-in-text-block` and by gate 2's floors, which check that each role is visible; neither checks that two roles differ.

Neither the reviewer subagent nor the spec template exists as a file yet. The questions live here until they do: the spec that creates the reviewer subagent copies them into its instructions, and the spec template gains one line where a design names cobalt roles, the answer to both. Until then, a spec that names cobalt roles answers both questions in its `design.md`.

## Stage 1 criteria

Nothing to build now. When these components get their specs, each carries these criteria. Every one is visible in a component example, so gate 3 (axe per example) and gate 4 (visual regression) can check it.

| Component                                         | Criterion                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ink-field` (input, select, textarea, date field) | Rest reads `sys.border.strong`; `:hover` reads `sys.border.strong-hover`; focus reads `sys.border.focus` and draws `sys.focus.ring` outside a 2px gap of the surface behind. No halo or shadow of its own and no primitive read. Test: hover one field while another has focus; the two read differently in a screenshot, in both themes. |
| Every focusable control                           | The ring sits outside the control with its 2px surface gap on `:focus-visible`, never inside or on the edge.                                                                                                                                                                                                                              |
| `ink-chip`                                        | `aria-pressed="true"` renders a check icon before the label at `sys.size.icon.sm`; `false` does not. Unit test on both states.                                                                                                                                                                                                            |
| `ink-segmented-control`                           | The chosen segment's label is semibold, the others regular.                                                                                                                                                                                                                                                                               |
| `ink-alert`, `ink-banner`                         | A link in the message is underlined. Every example includes a link, so axe's `link-in-text-block` has something to test.                                                                                                                                                                                                                  |
| `@inkhr/styles` base stylesheet                   | `a` inside running text is underlined by default; a component that needs a plain link opts out.                                                                                                                                                                                                                                           |
| `ink-combobox`                                    | Focus stays in the field. The option under the arrow keys (`aria-activedescendant`) takes the focus ring with its 2px gap, never `sys.selected.bg`; a chosen option carries a check.                                                                                                                                                      |
| `ink-menu`                                        | The item under the arrow keys takes the focus ring, never the selection wash.                                                                                                                                                                                                                                                             |
| `ink-side-nav`                                    | The current item reads `sys.selected.bg` with `sys.text.on-selected` in semibold. On the collapsed rail, where it has no label, it also carries a 3px `sys.signal.bg` marker on its leading edge, which mirrors in a right-to-left layout.                                                                                                |

The component rules file that Stage 1 creates next to `.claude/skills/inkhr/rules/tokens.md` gains these as rows, each with an incorrect and a correct form and the check that catches it. `sys.size.icon.sm` is not a token yet; the size slice adds it before the chip spec is written.

Still open: whether the check on a pressed chip replaces a leading icon when the chip has one, or sits after it; no chip with an icon exists yet. Forced colours and a high contrast mode are not decided (question 18 of the colour plan's slice 2); the chip check, the rail marker and the ring are meant to survive forced colours, to be confirmed in Stage 1.

## Decisions

For the design lead's approval with the spec:

1. **A neutral role for hover, not a cobalt one.** Cobalt on a hovered field makes it look focused. The alternative, a lighter cobalt for hover, keeps two cobalts on one screen with nothing but shade to tell them apart.
2. **A closed map, not an open state pattern.** `NEUTRAL_STATES` names the one neutral state the product draws; an open `(-{state})?` on every neutral name would pass names nobody has decided on.
3. **`strong-hover` is the correct form, not `strong.hover`,** by rule 3 of the Naming rules board: a state is a hyphen at the end.
4. **The Field recipe follows the Edge row.** The recipe's `sys.border.default` was the older sentence; the Edge row is what the token descriptions say.
5. **The review questions wait in this spec.** The reviewer subagent and the spec template do not exist as files, and creating either is more than a token change; inventing one here would be the kind of stand-in `GAPS.md` forbids.
6. **`feat(tokens)` and a minor changeset,** since a role is added and consumers gain a variable.
