# 008 Dark boundary step: design

## The values

In `packages/tokens/src/modes/dark.json`, three `$value`s change and nothing else:

| Token                 | Today                    | After                    |
| --------------------- | ------------------------ | ------------------------ |
| `sys.border.focus`    | `{ref.color.cobalt.300}` | `{ref.color.cobalt.400}` |
| `sys.focus.ring`      | `{ref.color.cobalt.300}` | `{ref.color.cobalt.400}` |
| `sys.selected.border` | `{ref.color.cobalt.300}` | `{ref.color.cobalt.400}` |

The other five dark cobalt roles stay on `300`: `sys.action.primary.bg`, `sys.signal.bg`, `sys.text.link`, `sys.status.info.text` and `image.treatment.tint`. Light is unchanged: the action on `700`, the boundaries on `600`.

| Pair                                       | Dark today | Dark after |
| ------------------------------------------ | ---------- | ---------- |
| The three roles on `sys.surface.raised`    | 7.79:1     | 5.73:1     |
| The three roles on `sys.surface.default`   | 9.43:1     | 6.93:1     |
| The three roles on `sys.surface.page`      | 10.54:1    | 7.74:1     |
| The three roles on `sys.surface.sunken`    | 11.24:1    | 8.26:1     |
| `sys.selected.border` on `sys.selected.bg` | 9.99:1     | 7.34:1     |
| Action step to boundary step               | 1.00:1     | 1.36:1     |

Every ratio is WCAG relative luminance on the token values, compared unrounded and printed to two decimals. Light's action to boundary step, `700` to `600`, is 1.44:1.

## The sentences

In `packages/tokens/src/inkhr.tokens.json`, word for word:

| Token                          | New `$description`                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ref.color.cobalt` (the group) | The one action and signal colour. Step 700 is the cobalt of the mark and the primary button; focus and the selected border read 600, links 800. On ink the action and links read 300, and focus and the selected border 400. It darkens on hover and press in light and lightens in dark. It also carries the info status and the duotone tint. |
| `ref.color.cobalt.300`         | Dark's action, and with it the signal, the link, the info text and the duotone tint. Dark's boundaries sit a step darker on 400, as light's sit a step lighter on 600.                                                                                                                                                                          |
| `ref.color.cobalt.400`         | One step back from dark's action, as 600 is on paper: the focus border, the focus ring and the selected edge on ink, and the info mark.                                                                                                                                                                                                         |

## Tests

- `npx nx run tokens:check` passes: `inkhr/role-reference` sees three references, `inkhr/references` sees three `sys` roles pointing at `ref`, and `parser:init` resolves `ref.color.cobalt.400`, which exists.
- `packages/tokens/tests/check.test.mjs` and `outputs.test.mjs` need no new fixture: no rule changes and the outputs test compares names, not values. The build's dark CSS test already checks that every dark declaration is a `var()` reference.
- When gate 2 exists, its list gains the three roles at 3:1 on the four dark surfaces and `sys.selected.border` on `sys.selected.bg`, the pairs in "The values". No gate checks the distance between the action and the boundary step.

## Documentation

- Nothing in `DESIGN.md` names a step, so nothing there changes.
- `packages/tokens/AGENTS.md`: `specs/008-dark-boundary-step/` joins "Where to look next".
- **Changeset:** `@inkhr/tokens` patch: "In dark, `sys.border.focus`, `sys.focus.ring` and `sys.selected.border` move one cobalt step back from the action."

## Decisions

For the design lead's approval with the spec:

1. **The boundary group moves, not the action.** The action is the anchor in both themes; moving it would move the signal, the link, the info text and the tint with it.
2. **One step, to `400`.** It keeps every pair above 3:1 with room, at 5.73:1 at the lowest, and mirrors light's one-step distance. Two steps, `500`, was not measured because one step already reads as a different role.
3. **Its own commit and changeset,** `fix(tokens)`: it corrects a value that made a focused field compete with the action, and a patch changeset since no name changes. It shares a branch and a pull request with 007 and 009 because the three touch the same files and come from one decision.
