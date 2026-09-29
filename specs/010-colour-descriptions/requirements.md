# 010 Colour descriptions: requirements

## Goal

Bring the colour descriptions of the design workspace into the package: the `$description` of 59 tokens, and `sys.action.tertiary.bg`, the one new role a new sentence names. No value, reference, type, name or order of an existing token changes.

## Context

- The design workspace audited every colour description on 26 to 29 September 2026 against criteria for four readers: an agent choosing a token for a design, an agent choosing one in code, the designer who reviews and the engineer who maintains. The audit and the method it led to live in that workspace's `docs/token-descriptions-audit.md` and `docs/token-descriptions.md`; this repository keeps neither.
- What changed in the sentences, in short:
  - Roles name their look-alike and the cue besides colour that tells the two apart.
  - Every "never" names the token to use instead.
  - Relational claims are in forms a script can verify, scoped by theme where true in one.
  - The workspace's own terms (floor, ladder, rung, band, part, clears) are replaced by plain words.
  - Step sentences name what they are compared with.
  - Primitives state what fixed the step instead of a component job.
  - Two false claims are fixed: `ref.color.moss.800` and `ref.color.amber.800` said they were the darkest step of their hue any role reads, which is true in light only.
  - Every sentence is at most two sentences and 240 characters.
- `ref.color.base.transparent` described a component job for a primitive no role read: "the fill of a control that has none, such as the tertiary button". In the audit's blind choice test an agent given the primitives' sentences chose the primitive for the tertiary button. The workspace added `sys.action.tertiary.bg`, pointing at the primitive in both themes, and the primitive's new sentence sends a component to that role. Carrying the sentence without the role would point readers at a token that does not exist.
- The source is the workspace's token export at commit `789e6ef` on its `master`. That commit is `143f519` with one fix: `0861ee2` had pasted the fragment `'action.tertiary.bg':'transparent',` into the sentence of `sys.action.secondary.text` and into the role label map. With the fragment removed the sentence is main's again, so `sys.action.secondary.text` does not change here, and 59 descriptions change where 143f519 differs from main in 60.
- `inkhr/naming` already accepts `sys.action.tertiary.bg`: a component variant is any kebab-case word. `inkhr/theme-parity`, `inkhr/references`, `inkhr/role-reference` and `inkhr/descriptions` apply to the new role as to any other, and `tokens:test` derives the names each output must declare from the source.

## Requirements

1. The `$description` of the 38 tokens in `packages/tokens/src/inkhr.tokens.json` and of the 21 roles in `src/modes/light.json` and `src/modes/dark.json` listed in `design.md` equals, byte for byte, the workspace's at `789e6ef`. The role sentences are the same in both theme files.
2. Both theme files declare `sys.action.tertiary.bg` after `sys.action.secondary` and before `sys.action.danger`, with `$type` `color`, `$value` `{ref.color.base.transparent}` and the sentence in `design.md`, as the workspace has it.
3. Nothing else in the three files changes: no other token is added or removed, and every other part of every token, and the order of the tokens, stays as main has it. After the change the three files equal the workspace's export at `789e6ef` apart from the newline prettier adds at the end of each file.
4. Before the source changes, a comparison of main's source with the branch's and the workspace's fails, and after it passes only when requirements 1 to 3 hold and light and dark sentences are byte-identical for every role.
5. `packages/tokens/tests/check.test.mjs` has a fixture for the new role in one theme only.
6. `DESIGN.md` names the role in the colour table and the token names; `packages/tokens/AGENTS.md` names this spec in "Where to look next".
7. The package change carries a changeset: minor, since a token is added and none is removed or renamed.

## Out of scope

- The tertiary button and the icon button themselves, and a recipe for them in `DESIGN.md`: Stage 1, listed in "Stage 1 criteria" in `design.md`.
- Any value change, and any description the workspace has not changed.
- The workspace's audit, method, checker and choice test, which stay in the workspace.
- The density files and every token type other than colour and `sys.size.target`.

## Done when

- Each of the three source files equals the workspace's export at `789e6ef` apart from the final newline: `diff <(git -C <workspace> show 789e6ef:tokens/<file>) packages/tokens/src/<file>` reports only the newline.
- `npx nx run tokens:check` passes on both pairs of the source.
- `npx nx run tokens:test` passes, and the new fixture failed in the commit that added it.
- After `npx nx run tokens:build`, `dist/css/light.css` declares `--ink-sys-action-tertiary-bg` under `:root` and `dist/css/dark.css` under `[data-ink-theme="dark"]`, the TypeScript, Swift and Kotlin outputs carry the role, and no output carries a description.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `packages/tokens/AGENTS.md` stays under 60 lines.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
