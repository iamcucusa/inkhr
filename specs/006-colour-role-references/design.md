# 006 Colour role references: design

## The rule

A seventh rule in `packages/tokens/lint/inkhr-rules.mjs`, on as an error in `packages/tokens/terrazzo.config.mjs`:

| Rule                   | Checks                                                                | Tokens                           |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------- |
| `inkhr/role-reference` | `$value` as written is one `{…}` reference, and nothing else is in it | the covered types, outside `ref` |

```js
'inkhr/role-reference': rule(
  'Every token of a covered type outside ref references a token.',
  '{{ id }} holds a value, not a reference; point it at a ref primitive in braces',
  ({ tokens, report }) => {
    for (const token of Object.values(tokens)) {
      if (!covered(token) || token.id.startsWith('ref.')) continue;
      const raw = token.originalValue?.$value;
      if (typeof raw === 'string' && ALIAS.test(raw)) continue;
      report({ messageId: 'broken', data: { id: token.id }, node: token.source.node });
    }
  },
),
```

- **It reads `originalValue.$value`,** as `inkhr/references` does, because the parser resolves an alias away; only the value as written tells a reference from a value. `ALIAS` is the pattern `inkhr/references` already uses, so the two rules agree on what a reference is.
- **Outside `ref`, not only `sys`.** The package map's rule is "a colour value is written only in a `ref.color` primitive", which also binds `image.treatment.tint`, the one colour token outside `sys`. It references `ref.color.cobalt.700` today, so covering it removes nothing and keeps the duotone tint from drifting to a raw value. Under the naming grammar, a colour token under `ref` is always a `ref.color` primitive, so "outside `ref`" and "outside `ref.color`" are the same set.
- **The covered types only.** The 11 `sys.type.*` roles hold typography composites whose fields are references; a rule over every `sys` token would fail on all 11, in both pairs, since they live in the shared file. A slice that adds a type to `covered-types.mjs` adds it here in the same step, and finds out then whether its roles already hold references.
- **Only the `{…}` form counts.** DTCG 2025.10 also allows a JSON Pointer `$ref`. The source uses none, `inkhr/references` cannot read one, so a `$ref` role would pass the direction check unseen, and one reference form keeps both rules and the build simple. A `$ref` therefore fails as a value.
- **The message names the token and the fix,** in the one-line form `check.mjs` prints: `light  inkhr/role-reference  sys.action.primary.bg holds a value, not a reference; point it at a ref primitive in braces`.

## Trial

Run on 24 September 2026 with `@terrazzo/cli` 2.7.1, the rule above added to a working copy and reverted afterwards, against the source at `8d99829`:

| Fixture                                                            | Before             | With the rule                              |
| ------------------------------------------------------------------ | ------------------ | ------------------------------------------ |
| The source, light pair and dark pair                               | pass               | pass                                       |
| A colour object in `sys.action.primary.bg`, light                  | pass               | `inkhr/role-reference`                     |
| A hex string in `sys.action.primary.bg`, light                     | `core/valid-color` | `core/valid-color`, `inkhr/role-reference` |
| A JSON Pointer `$ref` to `#/ref/color/cobalt/700` in the same role | pass               | `inkhr/role-reference`                     |
| A colour object in `image.treatment.tint`, dark                    | pass               | `inkhr/role-reference`                     |
| A raw duration in `sys.motion.duration.fast`, not a covered type   | pass               | pass                                       |

The hex string still fails `core/valid-color` as well: that rule checks format, and stays on for every token, primitives included.

## Tests

- **`packages/tokens/tests/check.test.mjs`:** the hex fixture expects `core/valid-color` and `inkhr/role-reference`; four fixtures are added, the other rows of the trial table. The source test is unchanged.
- **`packages/tokens/tests/rule-file.test.mjs`:** the runner keyed `core/valid-color` is keyed `inkhr/role-reference`; its body is unchanged, since it already parses a `"$value": …` span as JSON and writes it into the role in both theme files. No row will name `core/valid-color`, and the test refuses a row that names a check it has no runner for.

## The rule file

Row 1 becomes two rows, both caught by the new rule; the other rows and the two lines under the table do not change.

| Rule                                       | Incorrect                                                                                      | Correct                              | Caught by              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------- |
| 1. A role holds a reference, never a value | `"$value": "#2C47D7"`                                                                          | `"$value": "{ref.color.cobalt.700}"` | `inkhr/role-reference` |
| 1. A role holds a reference, never a value | `"$value": { "colorSpace": "srgb", "components": [0.1725, 0.2784, 0.8431], "hex": "#2C47D7" }` | `"$value": "{ref.color.cobalt.700}"` | `inkhr/role-reference` |

The hex row stays because it is the mistake a person makes first; the object row is the one only this rule catches. Both name the rule whose meaning is rule 1, not the format rule that happens to fire on a hex.

## Documentation

- **`packages/tokens/AGENTS.md`**, within its 60 lines:
  - Rules: "A colour value is written only in a `ref.color` primitive; a role references it (`core/valid-color` for a raw value, `inkhr/references`)." becomes "A colour value is written only in a `ref.color` primitive; every other colour token holds one reference to it in braces (`inkhr/role-reference`). A colour inside a composite value, such as a shadow layer, is not checked."
  - Common failures: "`core/valid-color` with a file and line: a hex or colour object in a role; replace it with a reference." becomes two lines: "`inkhr/role-reference`: a hex or colour object in a role; replace it with a reference to the primitive in braces." and "`core/valid-color` with a file and line: a hex string in a primitive; write it as a colour object."
  - Where to look next: `specs/006-colour-role-references/` joins specs 003 and 004.
- **`docs/stack-and-dependencies.md`, the `@terrazzo/cli` entry:** Use reads "descriptions, the naming grammar and role references for the covered types"; Gaps reads "On its own it does not check reference direction, that a role holds a reference, the grammar, …". Nothing else in the file changes.
- **Changeset:** empty, as for specs 004 and 005, since no output changes: "Check that every colour role holds a reference. No output changes."

## Decisions

For the design lead's approval with the spec:

1. **A new rule, not an extension of `inkhr/references`.** `inkhr/references` covers every token, as spec 004 decided for the structural rules; this rule can cover only the covered types, because the typography roles hold composites. One rule with two scopes would print one name for two different mistakes. A separate name also gives row 1 of the rule file a check whose failure means exactly rule 1, and leaves every existing `inkhr/references` fixture as it is.
2. **Every covered token outside `ref`, not only `sys`,** so `image.treatment.tint` is held to the same rule. The alternative, `sys` only, matches the Naming rules board's word "role" more literally and leaves the tint unchecked.
3. **Only `{…}` is a reference;** a JSON Pointer `$ref` fails. The alternative, accepting `$ref`, would also need `inkhr/references` to read it, or it opens a way round the direction check.
4. **Spec 004 stays as merged.** Its rule and trial tables record what it decided and ran on 23 September; rewriting them would make the record say something that was not true then. The package `AGENTS.md` is the living list of rules and names this spec; spec 004's "six rules" is correct for spec 004.
5. **The composite limit is recorded, not fixed.** No covered type is a composite, and the only raw colours in composites today are the `ref.elevation.*` shadow layers, which are primitives. The slice that covers `shadow` decides whether they reference `ref.color`.
6. **`fix(tokens)` for the rule commit,** since it closes a gap in a gate that exists, and an empty changeset, since nothing ships.
