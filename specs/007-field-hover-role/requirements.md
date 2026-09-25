# 007 Field hover role: requirements

## Goal

Give a field under the pointer an edge of its own. Today `sys.border.focus` is described as the border a field draws "while [it is] hovered or focused", so a pointer resting on one field while another has focus shows two fields that look focused. After this spec, hover reads a neutral role, `sys.border.strong-hover`, focus reads `sys.border.focus` together with the ring every control takes, and the naming lint accepts a state on a neutral name only where a list allows it.

## Context

- Decision 26 in the design workspace's `docs/decisions.md` (24 and 25 September 2026) made the change on its canvases and in its token export; the package source is a copy of that export, and this spec brings it to the same state. The plan the design workspace wrote for this repository is the source of every value and sentence here.
- Hover cannot read `sys.border.default`: it sits closer to the surface than the resting edge, at 1.53:1 on `sys.surface.default` in light and 2.46:1 in dark, under the 3:1 a boundary needs. Two steps further along the neutral axis, `ref.color.ink.700` in light and `ref.color.paper.300` in dark, reach 6.71:1 and 10.79:1 on `sys.surface.default`, 6.71:1 and 8.92:1 on `sys.surface.raised`, and stand 2.04:1 and 2.15:1 from `sys.border.strong`.
- A field's own border change on focus, `sys.border.strong` to `sys.border.focus`, is 1.48:1 in light and 1.88:1 in dark: it passes 1.4.11 and misses the 3:1 change 2.4.13 asks for. A focused field therefore also takes the shared ring, whose pixels change 4.88:1 in light against the surface behind.
- The naming grammar in `packages/tokens/lint/inkhr-rules.mjs` gives a neutral name no state: `sys.border.{default|strong|subtle|focus}` and nothing after it. `sys.border.strong-hover` fails `inkhr/naming` today.
- `DESIGN.md` contradicts itself on the field's resting edge: the Edge row says a field reads `sys.border.strong`, the Field recipe says `sys.border.default`.
- The reviewer subagent and the spec template that the root map and `docs/stack-and-dependencies.md` name do not exist yet as files; nothing in `.claude/agents/` or `specs/` is a template.

## Requirements

1. `packages/tokens/src/modes/light.json` and `dark.json` each declare `sys.border.strong-hover`, after `sys.border.strong`, referencing `ref.color.ink.700` in light and `ref.color.paper.300` in dark, with one description in both files.
2. `inkhr/naming` accepts `sys.border.strong-hover` and rejects a state on every other neutral name, through a closed list of the neutral variants that may carry a state and the states each may carry.
3. The descriptions of `sys.border.focus` and `sys.focus.ring` in both theme files, and of `ref.color.ink.700` and `ref.color.paper.300` in the shared file, say what each paints after this change, word for word as `design.md` gives them. No description says a field's focus border draws hover.
4. `packages/tokens/tests/check.test.mjs` has fixtures for a neutral state written with a dot, a state on a neutral variant that has none, a neutral state outside the list, and the new role in one theme only. The source passes.
5. Rule 3 of `.claude/skills/inkhr/rules/tokens.md` gains a row for the neutral form, and its test runs it.
6. `DESIGN.md` names the role in the colour table, the Field recipe, the focus line of the do's and don'ts and the token names, and the Field recipe agrees with the Edge row.
7. `packages/tokens/AGENTS.md` states the grammar with the new name and the rule that a neutral name takes a state only where listed.
8. The two review questions for a cobalt change, in "Review questions" in `design.md`, are recorded where the reviewer subagent and the spec template will take them from once they exist.
9. The package change carries a changeset: minor, since a token is added and none is removed or renamed.

## Out of scope

- How `ink-field` draws hover and focus in CSS, and every other component criterion: Stage 1, listed in "Stage 1 criteria" in `design.md` so the component specs carry them.
- The dark cobalt values and the sentences about the cobalt steps: spec 008.
- The sentences that say what tells a link or a selection apart besides colour: spec 009.
- An open naming pattern that lets any neutral name carry any state (see "Decisions" in `design.md`).
- The reviewer subagent and the spec template themselves.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- Every fixture in "Tests" in `design.md` gives the rules named there in `npx nx run tokens:test`, and the new fixtures failed in the commit that added them.
- Every row of the rule file passes its test, the new row of rule 3 included.
- After `npx nx run tokens:build`, `dist/css/light.css` declares `--ink-sys-border-strong-hover` under `:root` and `dist/css/dark.css` under `[data-ink-theme="dark"]`, and the TypeScript, Swift and Kotlin outputs carry the role.
- `git grep -n "hovered or focused"` finds nothing.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `packages/tokens/AGENTS.md` stays under 60 lines.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
