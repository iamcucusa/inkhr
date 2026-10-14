# 012 Dark avatar disc: design

## The value

In `packages/tokens/src/modes/dark.json`, one `$value` changes:

| Token           | Today                    | After                 |
| --------------- | ------------------------ | --------------------- |
| `sys.avatar.bg` | `{ref.color.cobalt.900}` | `{ref.color.ink.800}` |

`ref.color.cobalt.900` is `#111D81`, OKLCH lightness 0.31 and chroma 0.16. `ref.color.ink.800` is `#43474C`, lightness 0.40 and chroma 0.01.

## The values

Dark theme, WCAG relative luminance on the token values, compared unrounded and printed to two decimals:

| Pair                                     | Floor | Today   | After  |
| ---------------------------------------- | ----- | ------- | ------ |
| `sys.avatar.text` on `sys.avatar.bg`     | 4.5:1 | 10.09:1 | 6.82:1 |
| `sys.avatar.bg` on `sys.surface.raised`  | none  | 1.01:1  | 1.46:1 |
| `sys.avatar.bg` on `sys.selected.bg`     | none  | 1.09:1  | 1.62:1 |
| `sys.avatar.bg` on `sys.surface.default` | none  | 1.19:1  | 1.76:1 |
| `sys.avatar.bg` on `sys.surface.page`    | none  | 1.33:1  | 1.97:1 |
| `sys.avatar.bg` on `sys.surface.sunken`  | none  | 1.42:1  | 2.10:1 |

The `sys.selected.bg` row uses spec 011's wash. The disc on its background has no floor: the initials carry the avatar, and the disc only has to stay apart from what it sits on.

## The sentences

In `packages/tokens/src/inkhr.tokens.json`, word for word:

| Token                  | New `$description`                                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ref.color.cobalt.900` | Light's pressed step and the label on a selected fill. The far end of the pair that 100 begins.                                                                                                     |
| `ref.color.ink.800`    | The last whole step of ink before the four dark surfaces, 850 to 975. On ink it draws the hairline and the disc behind initials, because those surfaces sit too close together to set either apart. |

## Tests

- `npx nx run tokens:check` passes: the role holds one reference, to a `ref` that exists, and both theme files keep the same names.
- `packages/tokens/tests/` needs no new fixture: no rule changes, and the outputs test compares names, not values.
- No check in the repository computes a contrast ratio yet; the figures above were measured from the token values for this spec.

## Documentation

- Nothing in `DESIGN.md` names the step, so nothing there changes.
- `packages/tokens/AGENTS.md`: `specs/012-dark-avatar-disc/` joins "Where to look next".
- **Changeset:** `@inkhr/tokens` patch: "In dark, `sys.avatar.bg` reads `ref.color.ink.800` instead of `ref.color.cobalt.900`. No name changes."

## Decisions

1. **The role moves, not the step.** `ref.color.cobalt.900` keeps its value because light reads it for the selected label and the pressed steps.
2. **Its own commit and changeset,** `fix(tokens)`, a patch. It shares a branch and a pull request with spec 011 because both come from the same critique of dark cobalt.
