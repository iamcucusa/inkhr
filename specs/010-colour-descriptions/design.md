# 010 Colour descriptions: design

## The role

In `packages/tokens/src/modes/light.json` and `dark.json`, in `sys.action` after `secondary` and before `danger`:

```json
"tertiary": {
  "bg": {
    "$type": "color",
    "$value": "{ref.color.base.transparent}",
    "$description": "The tertiary button at rest has no fill, so the surface behind shows through and only its label marks it. It reads quieter than the secondary button, which draws `sys.action.secondary.border`."
  }
}
```

The value and the sentence are the same in both files. The role has no ratio of its own: the surface behind it is what shows, and the label on it is measured against that surface.

`ref.color.base.transparent`, in the shared file, changes from "White at no opacity. The fill of a control that has none, such as the tertiary button, and the far end of the scrim over a wash." to "White at no opacity, so whatever sits behind shows through, in both themes. A component never reads it: the tertiary button at rest reads `sys.action.tertiary.bg`, which points here." The two land in one commit, so no commit has a sentence naming a token that does not exist.

## The sentences

Each token below takes the workspace's `$description` at `789e6ef`, byte for byte. The sentences themselves are not repeated here: the workspace export is their source.

### `inkhr.tokens.json`, 38 tokens

- `ref.color.base.black`, `ref.color.base.transparent`
- `ref.color.paper.400`
- `ref.color.ink.600`, `ref.color.ink.700`, `ref.color.ink.800`, `ref.color.ink.850`, `ref.color.ink.975`
- `ref.color.cobalt.400`, `ref.color.cobalt.500`
- `ref.color.moss.50`, `ref.color.moss.100`, `ref.color.moss.200`, `ref.color.moss.300`, `ref.color.moss.400`, `ref.color.moss.500`, `ref.color.moss.800`, `ref.color.moss.900`, `ref.color.moss.950`
- `ref.color.amber.50`, `ref.color.amber.100`, `ref.color.amber.200`, `ref.color.amber.300`, `ref.color.amber.400`, `ref.color.amber.500`, `ref.color.amber.800`, `ref.color.amber.900`, `ref.color.amber.950`
- `ref.color.brick.50`, `ref.color.brick.100`, `ref.color.brick.200`, `ref.color.brick.500`, `ref.color.brick.700`, `ref.color.brick.800`, `ref.color.brick.900`, `ref.color.brick.950`
- `ref.color.olive.200`
- `sys.size.target`

### `modes/light.json` and `modes/dark.json`, 21 roles, one sentence in both files

- `sys.text.tertiary`
- `sys.border.default`, `sys.border.strong`
- `sys.action.primary.bg-hover`, `sys.action.secondary.bg-hover`
- `sys.signal.bg`, `sys.signal.bg-hover`
- `sys.status.success.border`, `sys.status.warning.border`, `sys.status.danger.border`, `sys.status.info.border`, `sys.status.info.icon`
- `sys.selected.bg`, `sys.selected.border`
- `sys.data.1.bg`, `sys.data.2.bg`, `sys.data.3.bg`, `sys.data.4.bg`, `sys.data.5.bg`, `sys.data.6.bg`
- `image.treatment.tint`

### Not changed

`sys.action.secondary.text` keeps main's sentence. At `143f519` the workspace's differed from main only by the pasted fragment `'action.tertiary.bg':'transparent',`; `789e6ef` removes it.

## How it is applied and checked

The sentences and the role are written by a script from the workspace export, editing the text of the source so no byte outside them moves: first the role and the sentence of `ref.color.base.transparent`, then the other 58 sentences, one commit each. A second script compares main at `83485c3`, the branch and the export at `789e6ef`, and fails unless:

1. no token is removed, and the only token added is `sys.action.tertiary.bg`, in both theme files and equal to the workspace's, key for key;
2. the tokens whose `$description` differs from main are exactly the listed ones, per file, and every other key of every existing token, and the order of the tokens, is main's;
3. every changed or new sentence equals the workspace's;
4. every role's sentence is byte-identical in the light and dark files;
5. each file, parsed, equals the workspace's export, parsed, key order included.

Both scripts are one-off and stay out of the repository: they read a fixed commit of main and a checkout of the design workspace, and once this work merges the comparison is spent. What lasts is the parity fixture below, and the check any later reader can repeat: the source equals the export at `789e6ef` apart from the final newline.

## Tests

`packages/tokens/tests/check.test.mjs`, beside the fixture for the field hover role:

| Fixture                             | Edit                              | Expected rules       |
| ----------------------------------- | --------------------------------- | -------------------- |
| the tertiary fill in one theme only | delete dark `sys.action.tertiary` | `inkhr/theme-parity` |

It fails until the role exists, since deleting a group that is not there leaves a source that passes. `packages/tokens/tests/outputs.test.mjs` needs no change: it derives the names each output declares from the source, so the role is expected in every output of both themes, and it already checks that no description reaches an output. No rule changes, so the rule file gains no row.

## Documentation

- **`DESIGN.md`:**
  - Colour table, after the "Cobalt, pressed ink" row: `| Tertiary fill | sys.action.tertiary.bg | var(--ink-sys-action-tertiary-bg) | No fill: the tertiary button at rest shows the surface behind. A component never reads ref.color.base.transparent. |`, with the token, the variable and the primitive in backticks as the other rows have them.
  - Token names: the `sys.action.*` line gains `tertiary.bg` after `secondary.text`.
- **`packages/tokens/AGENTS.md`:** `specs/010-colour-descriptions/` joins "Where to look next". The grammar line does not change, since it names no action variants.
- **Changeset:** `@inkhr/tokens` minor: "Add `sys.action.tertiary.bg`, the tertiary button's fill at rest, in both themes, and rewrite 59 colour descriptions after the design workspace's audit. No existing value changes."

## Review questions

Spec 007 asks two questions of any change to a cobalt step or to a role that reads cobalt. This spec changes the sentences of eight cobalt roles and no value.

1. **Does the action stay the strongest cobalt on the screen?** Yes, unchanged: no value moves.
2. **Does every pair of roles that can share a screen have a cue besides colour?** The new sentences name more of them than main does: the info edge against `sys.focus.ring`, the info mark against it in dark, `sys.selected.border` against the ring by form, and `sys.signal.bg` against `sys.action.primary.bg` by what each does. The screenshot the question asks for waits for Stage 1, as it did for spec 007.

## Stage 1 criteria

Nothing to build now. When these components get their specs, each carries this criterion, visible in a component example so gates 3 and 4 can check it.

| Component                                             | Criterion                                                                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ink-button variant="tertiary"`, the icon-only button | At rest the fill reads `sys.action.tertiary.bg`, never the keyword `transparent` or `ref.color.base.transparent`. A stylesheet test on both themes. |

## Decisions

For the design lead's approval with the spec:

1. **The source is `789e6ef`, not `143f519`.** The fragment in `sys.action.secondary.text` was an editing slip, fixed in the workspace before the sentences came over, so the source still equals the export apart from the final newline.
2. **The role lands with the sentence that names it,** in one commit, rather than in a later spec.
3. **No lint change.** The grammar's variant slot takes any kebab-case word, so `tertiary` needs no list entry, as `primary` and `secondary` have none.
4. **The scripts stay out of the repository and out of `tokens:test`.** They compare against a fixed commit of main and a checkout of the design workspace, which CI does not have, and have no use once the work merges. The lasting test is the parity fixture.
5. **The design guide names the role, and no recipe.** `DESIGN.md` has no tertiary button recipe; writing one is component work for Stage 1.
6. **`feat(tokens)` for the role, `docs(tokens)` for the sentences, and one minor changeset** for the pull request, since consumers gain a variable.
