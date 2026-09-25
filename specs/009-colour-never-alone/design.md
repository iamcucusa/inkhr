# 009 Colour is never the only cue: design

## The sentences

These `$description`s change in both theme files, word for word:

| Token                  | New sentence                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sys.text.link`        | A link in running text, always underlined. In light it is a step darker than `sys.action.primary.bg` so it holds at body size; in dark the two are one value.                                     |
| `sys.status.info.text` | Words on an informative tint, at 4.5:1. It shares its value with `sys.text.link` in both themes, so a link inside an alert is underlined to stand apart.                                          |
| `sys.selected.bg`      | The fill of a row, option or chip the user has chosen. Too faint to carry the choice alone, so a check or a heavier label goes with it; its label reads `sys.text.on-selected`.                   |
| `sys.selected.border`  | Cobalt on the edge of a chosen row or option, the same value as `sys.focus.ring` in both themes. The two part by form: a selection carries a check or a heavier label, and the ring sits outside. |

| Pair                                                | Light                                         | Dark                         |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------- |
| `sys.text.link` against `sys.status.info.text`      | 1.00:1, one value                             | 1.00:1, one value            |
| `sys.selected.bg` on its background, the wash alone | 1.12:1 on white, 1.08:1 on `sys.surface.page` | 1.05:1 on `sys.surface.page` |

## Documentation

- **`DESIGN.md`, do's and don'ts,** after the status line:
  - "Do underline a link in running text or inside an alert. Don't let colour be a link's only cue."
  - "Do give a selected option a check or a heavier label. Don't rely on the selection wash, which barely shows."
  - "Do mark the current page on an icon-only rail with a marker on its leading edge, and show the entry under the arrow keys in a list or a menu with the focus ring. Don't use the selection wash for it."
- **`DESIGN.md`, Accessibility,** one sentence added: "Colour is never the only cue: a link carries an underline, a selection a check or a heavier label, a status its icon and word, and focus the ring."
- **`GAPS.md`, under "Not in InkHR yet":** "**A check for non-colour cues.** Nothing yet fails a link in running text without an underline or a selected option without a check or heavier label; axe's `link-in-text-block` rule covers links once gate 3 runs component examples in Stage 1."
- **`packages/tokens/AGENTS.md`:** `specs/009-colour-never-alone/` joins "Where to look next".
- **Changeset:** `@inkhr/tokens` patch: "Say in the link, info text and selection descriptions what tells each apart besides colour. No value changes."

## Tests

No rule changes and no value changes, so no fixture. `inkhr/descriptions` still sees a description on each of the four roles; `npm run check:names` reads the new `DESIGN.md` and `GAPS.md` lines, which name only roles that exist.

## Decisions

For the design lead's approval with the spec:

1. **Sentences, not values.** The link and the info text could be pulled apart by a step, but the link would then be either weaker than 4.5:1 at body size or a third cobalt on the screen. An underline costs nothing and is what a link looks like.
2. **The wash stays, with a second cue.** Making `sys.selected.bg` stronger would put a wash under every selected row in a dense table; a check or a heavier label marks the choice where it is read.
3. **A gap, not a check.** Nothing in gate 1 can read an underline; the gap names what will cover it and when.
4. **`docs(tokens)` and a patch changeset,** since consumers read the descriptions and no value changes.
