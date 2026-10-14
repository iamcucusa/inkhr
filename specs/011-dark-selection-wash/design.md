# 011 Dark selection wash: design

## The value

In `packages/tokens/src/inkhr.tokens.json`, `ref.color.cobalt.950`:

|              | Today                                | After                                |
| ------------ | ------------------------------------ | ------------------------------------ |
| `hex`        | `#070A5A`                            | `#1C253F`                            |
| `components` | `[0.0275, 0.0392, 0.3529]`, `srgb`   | `[0.1098, 0.1451, 0.2471]`, `srgb`   |
| OKLCH        | lightness 0.23, chroma 0.13, hue 268 | lightness 0.27, chroma 0.05, hue 268 |

Light's wash, `ref.color.cobalt.50`, is chroma 0.019; `ref.color.cobalt.900` is lightness 0.31.

## The values

Dark theme, WCAG relative luminance on the token values, compared unrounded and printed to two decimals:

| Pair                                                               | Floor | Today   | After   |
| ------------------------------------------------------------------ | ----- | ------- | ------- |
| `sys.text.on-selected` on `sys.selected.bg`                        | 4.5:1 | 12.75:1 | 11.04:1 |
| `sys.selected.border` on `sys.selected.bg`                         | 3:1   | 7.34:1  | 6.36:1  |
| `sys.status.info.text` and `sys.text.link` on `sys.status.info.bg` | 4.5:1 | 9.99:1  | 8.65:1  |
| `sys.status.info.border` on `sys.status.info.bg`                   | 3:1   | 5.17:1  | 4.47:1  |
| `sys.status.info.icon` on `sys.status.info.bg`                     | 3:1   | 7.34:1  | 6.36:1  |
| `sys.selected.bg` on `sys.surface.page`                            | none  | 1.05:1  | 1.22:1  |
| `sys.selected.bg` on `sys.surface.default`                         | none  | 1.06:1  | 1.09:1  |

The wash on its surface has no floor: decision 26 makes the cobalt edge and the heavier label carry the selection, not the wash.

## The sentence

`ref.color.cobalt.950`, word for word:

> The wash on ink: the tint under an info message and a selected row, as 50 is on paper. The darkest cobalt and among the least saturated, so on ink it reads as a tint, never as navy.

## Tests

- `npx nx run tokens:check` passes: the value is a colour object, the description is a sentence, and both dark roles still resolve.
- `packages/tokens/tests/` needs no new fixture: no rule changes, and the outputs test compares names, not values.
- No check in the repository computes a contrast ratio yet; the figures above were measured from the token values for this spec.

## Documentation

- Nothing in `DESIGN.md` names the step or its ratios, so nothing there changes.
- `packages/tokens/AGENTS.md`: `specs/011-dark-selection-wash/` joins "Where to look next".
- **Changeset:** `@inkhr/tokens` patch: "In dark, the selection and info wash `ref.color.cobalt.950` becomes a low-chroma tint of cobalt, `#1C253F`. No name changes."

## Decisions

1. **The step changes, not the roles.** Both dark roles keep their reference, so no theme file changes and light is untouched.
2. **A patch,** `fix(tokens)`: it corrects a value that read as navy, and no name changes.
