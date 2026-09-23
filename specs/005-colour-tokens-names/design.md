# 005 Colour tokens names: design

## `DESIGN.md` (A0.1)

Each change below, in the order the file reads. Nothing outside colour changes, except the one sentence the plan names for all tokens.

| Where                        | Now                                                                                          | Becomes                                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| About this file              | "such as control heights and design frame sizes"                                             | "such as design frame sizes"                                                                                                                                                     |
| Colour, first paragraph      | "Status and data colours never fill a button and never colour body text"; `color.cobalt.700` | "Status and data colours never colour body text and never fill a button, with one exception: brick fills the destructive button, `sys.action.danger.bg`"; `ref.color.cobalt.700` |
| Colour table, CSS variables  | `var(--sys-…)`, 11 rows                                                                      | `var(--ink-sys-…)`                                                                                                                                                               |
| Colour table, Edge           | "Field and card boundaries."                                                                 | "Card boundaries. A field or other control reads `sys.border.strong`."                                                                                                           |
| Colour table, Cobalt         | "the primary button, links, selection, focus and tabs"                                       | "the primary button and tabs. Links read `sys.text.link`, selection `sys.selected.bg` and `sys.selected.border`, focus `sys.focus.ring`."                                        |
| Colour table, Cobalt pressed | "Primary button on hover; link text."                                                        | "Primary button on hover."                                                                                                                                                       |
| Colour table, Selected wash  | "with text.on-selected"                                                                      | "with `sys.text.on-selected`"                                                                                                                                                    |
| Data colours                 | `data.1` to `data.6`                                                                         | `sys.data.1.bg` to `sys.data.6.bg`, each named, after the sentence "They are theme roles, and each reaches 3:1 against the surface in both themes."                              |
| Elevation and depth          | `color.ink.900`                                                                              | `ref.color.ink.900`                                                                                                                                                              |
| Tabs and side navigation     | `text.on-selected`                                                                           | `sys.text.on-selected`                                                                                                                                                           |
| Avatar                       | "initials on cobalt 100"                                                                     | "initials in `sys.avatar.text` on `sys.avatar.bg`"                                                                                                                               |
| Do's and don'ts, first       | "or colour a button with a status or data colour."                                           | "or fill a button with a status or data colour; the destructive button is the one exception."                                                                                    |
| Do's and don'ts, tokens      | `color.cobalt.700`                                                                           | `ref.color.cobalt.700`                                                                                                                                                           |
| Imagery, duotone             | "cobalt.700 is screened over it"                                                             | "`image.treatment.tint` is screened over it"                                                                                                                                     |
| Quick start                  | `[data-theme="dark"]`; the four colour variables in the CSS example                          | `[data-ink-theme="dark"]`; `var(--ink-sys-…)`                                                                                                                                    |
| Token names, `sys.text.*`    | lists `on-accent`                                                                            | drops it                                                                                                                                                                         |
| Token names, `sys.action.*`  | `primary.bg-active`                                                                          | `primary.bg-pressed`                                                                                                                                                             |
| Token names, `sys.signal.*`  | default, hover, active, text                                                                 | bg, bg-hover, bg-pressed, text                                                                                                                                                   |
| Token names, new lines       | none                                                                                         | `sys.avatar.*`: bg, text; `sys.data.*`: 1.bg, 2.bg, 3.bg, 4.bg, 5.bg, 6.bg                                                                                                       |
| Token names, last line       | `image.treatment.duotone`; `data.1` to `data.6`                                              | `image.treatment.*`                                                                                                                                                              |

- **Two changes the plan does not list.** The first do and don't repeats the accent sentence, so it gains the same exception, or the file would contradict itself. The "Token names" list is the file's closed set, and four of its colour lines are wrong; the plan's own test needs them right.
- **The duotone line names the role, not a primitive.** The plan says "primitives under their full names", but the tint is `ref.color.cobalt.700` in light and `ref.color.cobalt.300` in dark, and the file's own rule is roles only, primitives only as the thing not to read.
- **The front matter** still lists `tokens/…` as the source; it becomes `packages/tokens/src/…`, a path and not a name.

## `GAPS.md` (A0.3, E3)

- **A second accent colour**, by decision: "Status and data colours never fill a button and never colour body text" becomes "never colour body text and never fill a button, except brick on the destructive button, `sys.action.danger.bg`".
- **A generic label colour**, new, by decision: "There is none. Every fill that carries a label owns its text role (`sys.action.primary.text`, `sys.action.danger.text`, `sys.signal.text`, `sys.avatar.text`, `sys.status.{kind}.text`), and `sys.selected.bg` is labelled by `sys.text.on-selected`. `sys.text.on-accent` was retired on 22 September 2026."
- **Chart components**, not yet: `data.1` to `data.6` become `sys.data.1.bg` to `sys.data.6.bg`; the gap stays, and the entry says it is in no stage yet, so a person adds it to the roadmap before work starts.
- **`ink-icon`**, not yet: in no stage yet, the same sentence.
- **Control height tokens**, not yet: Stage 0, with the density pair.
- **Components outside the inventory**, not yet: Stage 1 builds the components in `components.json`; anything else needs a decision first.
- **Unchosen tools**, not yet: each row's stage is the Stage column of `docs/stack-and-dependencies.md`.

## The name check (C6)

`tools/name-check/check-names.mjs`, run as `npm run check:names`. Node, no dependencies, like the commit checkers.

- **Documents:** `DESIGN.md`, `GAPS.md`, `AGENTS.md`, `packages/tokens/AGENTS.md`. The plan names the first and the last; the other two name colour tokens too and pass once `GAPS.md` is fixed, so they cost nothing to add.
- **What it reads:** inline code spans, fenced code blocks, and list items of the form "`` `sys.action.*`: primary.bg, primary.bg-hover ``", whose words are expanded to full names. In those it finds dotted names (`sys.text.primary`, `ref.color.cobalt.700`, `space.4`), skipping file names, and CSS variables (`--ink-…`, `--sys-…`, `--ref-…`, and anything inside `var(…)`).
- **What resolves:** a dotted name that is a token id or a group in the three source files, or a group followed by `.*`; a CSS variable that is `--ink-` plus the id of a token of a covered type, with dots as hyphens. The CSS names are derived from the source, not read from `dist/`, so the check needs no build; a test in `packages/tokens/tests/outputs.test.mjs` asserts the built CSS uses exactly that form.
- **Skip:** a line carrying `<!-- name-check: skip -->` is not read. The package `AGENTS.md` puts it on its one line of wrong examples.
- **Output:** one line per failure, `file:line  name`, and exit 1; the same shape as the token check.

### Pending

`tools/name-check/pending.mjs` exports the non-colour patterns the check accepts until their slice fixes them:

| Pattern                        | Slice that fixes it |
| ------------------------------ | ------------------- |
| `font.*`, `--sys-type-*`       | typography          |
| `space.*`, `--space-*`         | spacing             |
| `radius.*`, `--radius-*`       | radius              |
| `elevation.*`, `--elevation-*` | elevation           |
| `z.*`                          | layers              |
| `motion.*`                     | motion              |

The check refuses to run if a pattern matches a covered token's id or CSS variable, so no colour name can be put on the list. A slice that fixes its names removes its rows in the same pull request.

### Trial

Run on 23 September 2026 with a prototype of the check, the pending list above, and the source as merged in spec 004.

| Document                                                       | Unresolved names                                                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DESIGN.md` as it is                                           | 33, all colour: the 11 unprefixed colour variables, `color.*`, `data.*`, `text.on-selected`, `image.treatment.duotone` and the four wrong "Token names" words |
| `DESIGN.md` with the A0.1 changes                              | 0                                                                                                                                                             |
| The same, with `sys.text.link` renamed in a copy of the source | 2, lines 43 and 203, both naming `sys.text.link`                                                                                                              |
| `GAPS.md` as it is                                             | `data.1` to `data.6`, which A0.3 fixes                                                                                                                        |
| `AGENTS.md`                                                    | 0                                                                                                                                                             |
| `packages/tokens/AGENTS.md`                                    | `sys.action.primary.bg.hover` and `sys.button.bg`, the wrong examples the skip marker covers                                                                  |

### Where it runs

| When                     | What runs                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| A commit                 | `lint-staged`: the four documents and `packages/tokens/src/**/*.json` run `npm run check:names` |
| An agent tries to finish | `tools/hooks/before-done.mjs` gains `npm run check:names`                                       |
| A pull request           | CI runs `npm run check:names` after `npm test`                                                  |

A source change runs it too, because a renamed role breaks the documents, not the source.

## The rule file (E7)

`.claude/skills/inkhr/rules/tokens.md`: a title, one sentence saying it pairs each rule of the Naming rules board with the check that catches it, and a table, one row per incorrect form. Nothing else: the package `AGENTS.md` holds the prose.

| Rule                                        | Incorrect                             | Correct                                                                | Caught by            |
| ------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- | -------------------- |
| 1. A role holds a reference, never a value  | `"$value": "#2C47D7"`                 | `"$value": "{ref.color.cobalt.700}"`                                   | `core/valid-color`   |
| 2. Use only names that exist                | `sys.button.bg`                       | `sys.action.primary.bg`                                                | `inkhr/naming`       |
| 3. A state is a hyphen at the end           | `sys.action.primary.bg.hover`         | `sys.action.primary.bg-hover`                                          | `inkhr/naming`       |
| 3. A state is a hyphen at the end           | `sys.action.primary.hover.bg`         | `sys.action.primary.bg-hover`                                          | `inkhr/naming`       |
| 4. Dots in the source, `--ink-` only in CSS | `var(--sys-action-primary-bg)`        | `var(--ink-sys-action-primary-bg)`                                     | `check:names`        |
| 4. Dots in the source, `--ink-` only in CSS | `ink.sys.action.primary.bg`           | `sys.action.primary.bg`                                                | `inkhr/naming`       |
| 5. Describe the intent, not the value       | a colour token with no `$description` | `"$description": "The fill of the one button on a view that commits."` | `inkhr/descriptions` |

Under the table, two lines: a component reading `ref.color.cobalt.700` is caught from Stage 1, by the component lint; a description that states the value, "Cobalt 700", is caught in review, since no check can judge a sentence. The rule file is not one of the documents the name check reads, since it shows wrong names on purpose.

Rule 1 on the board reads "Components use sys names only"; its component form has no check until Stage 1, so the file shows the form the token source enforces today.

### The test

`packages/tokens/tests/rule-file.test.mjs`, run by `tokens:test`, reads the table and runs each row by its "Caught by":

- `core/valid-color`: sets `sys.action.primary.bg`'s `$value` in a copy of the source to the form, and expects the check to fail with that rule; the correct form passes.
- `inkhr/naming`: adds a colour token with the form as its id to both theme files of a copy, and expects `inkhr/naming`; the correct form is an id the source has.
- `inkhr/descriptions`: removes `sys.action.primary.bg`'s description in a copy and expects the rule; the correct row's sentence is set as the description and passes.
- `check:names`: writes the form in a code span of a temporary document and runs the name check on it; the incorrect form fails, the correct one passes.

A row whose "Caught by" the test does not know fails, so the file cannot name a check that does not exist.

## Documentation

- **Root `AGENTS.md`:** "Check the names in the docs: `npm run check:names`" after "Check the tokens".
- **`packages/tokens/AGENTS.md`:** one rule line, "Every token name and CSS variable the docs mention exists (`check:names`)", and the skip marker on the wrong-examples line. This completes E1: every rule in it names its check.
- **Changeset:** empty; no output changes.

## Decisions

- **A pending list, not a silent namespace filter**, so the non-colour debt is visible, reviewable, and shrinks slice by slice. Decided 23 September 2026.
- **Only incorrect forms a check catches**, with the two uncaught forms named in one line each. Decided 23 September 2026.
- **Charts and `ink-icon` are in no stage yet**, and say so. Decided 23 September 2026.
- **The name check derives CSS names from the source**, so a commit hook can run it without a build; the output test keeps the derivation honest.
- **`GAPS.md` and the root `AGENTS.md` are checked too**, because they name colour tokens and pass once A0.3 lands.
