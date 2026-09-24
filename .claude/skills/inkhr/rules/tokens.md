# Token names and values

Each rule of the Naming rules board, with a form that breaks it, the form to write, and the check that catches the broken one.

| Rule                                        | Incorrect                                                                                      | Correct                                                                | Caught by              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------- |
| 1. A role holds a reference, never a value  | `"$value": "#2C47D7"`                                                                          | `"$value": "{ref.color.cobalt.700}"`                                   | `inkhr/role-reference` |
| 1. A role holds a reference, never a value  | `"$value": { "colorSpace": "srgb", "components": [0.1725, 0.2784, 0.8431], "hex": "#2C47D7" }` | `"$value": "{ref.color.cobalt.700}"`                                   | `inkhr/role-reference` |
| 2. Use only names that exist                | `sys.button.bg`                                                                                | `sys.action.primary.bg`                                                | `inkhr/naming`         |
| 3. A state is a hyphen at the end           | `sys.action.primary.bg.hover`                                                                  | `sys.action.primary.bg-hover`                                          | `inkhr/naming`         |
| 3. A state is a hyphen at the end           | `sys.action.primary.hover.bg`                                                                  | `sys.action.primary.bg-hover`                                          | `inkhr/naming`         |
| 4. Dots in the source, `--ink-` only in CSS | `var(--sys-action-primary-bg)`                                                                 | `var(--ink-sys-action-primary-bg)`                                     | `check:names`          |
| 4. Dots in the source, `--ink-` only in CSS | `ink.sys.action.primary.bg`                                                                    | `sys.action.primary.bg`                                                | `inkhr/naming`         |
| 5. Describe the intent, not the value       | a colour token with no `$description`                                                          | `"$description": "The fill of the one button on a view that commits."` | `inkhr/descriptions`   |

A component that reads a primitive such as `ref.color.cobalt.700` is caught from Stage 1, by the component lint.
A description that states the value, such as "Cobalt 700", is caught in review; no check can judge a sentence.
