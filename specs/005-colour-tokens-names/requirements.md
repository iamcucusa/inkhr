# 005 Colour tokens names: requirements

## Goal

Make every colour name the repository's documents mention true and keep it true: `DESIGN.md` and `GAPS.md` say what is true of colour, a name check fails CI when a document names a token or CSS variable that does not exist, and an agent has one rule file with the naming rules, each paired with the check that catches it. This is the last of three specs for colour slice 1; it covers A0.1, A0.3, C6, E1 completed, E3 and E7 of the plan.

## Context

- The plan is `docs/stage-0-colours-slice-1-plan.md` in the design workspace; at `e466e78` it matches specs 003 and 004. The grammar the checks enforce is in `specs/004-colour-tokens-check/design.md`, and the design workspace's grammar board shows the same two shapes.
- `DESIGN.md` names 43 dotted names and 25 CSS variables that do not resolve today (`design.md`, "Trial"). 33 are colour and are what A0.1 fixes. The rest belong to typography, spacing, radius, elevation, layers and motion, which the plan leaves to their own slices.
- Its closed "Token names" list is also out of date for colour: `sys.text.on-accent` is retired, `primary.bg-active` is now `primary.bg-pressed`, and `sys.signal.*` lists words it does not have. The plan's A0.1 does not list that section, but its test, every colour name resolving, needs it.
- The package `AGENTS.md` shows two wrong names on purpose, in its common failures.
- The roadmap has five stages; charts and `ink-icon` are in none of them.
- The design lead decided on 23 September 2026: non-colour names stay, on a pending list the check reads; the rule file shows only incorrect forms a check catches today; charts and `ink-icon` are "not in any stage yet"; the `smol-toml` audit finding is fixed on its own branch after this spec.

## Requirements

1. Every colour token name and CSS variable in `DESIGN.md` exists in the token source or the built CSS, as A0.1 lists, and no non-colour name changes.
2. `GAPS.md` carries the three A0.3 entries, and every "not yet" entry names the stage that delivers it or says it is in no stage yet.
3. `npm run check:names` checks `DESIGN.md`, `GAPS.md`, `AGENTS.md` and `packages/tokens/AGENTS.md`: every dotted token name and CSS variable in their code spans, code blocks and "`prefix.*`: a, b" lists exists, or matches the pending list.
4. The pending list names each non-colour pattern and the slice that fixes it, and the check refuses a pattern that matches a covered token.
5. A line carrying `<!-- name-check: skip -->` is not checked, for names shown as wrong on purpose.
6. The name check runs in the git pre-commit hook when a checked document or the token source is staged, in the Stop hook, and in pull request CI.
7. `.claude/skills/inkhr/rules/tokens.md` holds one pair per rule of the Naming rules board: the incorrect form, the correct form and the check that catches the incorrect one. A test runs every pair: each incorrect form fails its check, each correct form passes.
8. The built CSS names are `--ink-` plus the token id with dots as hyphens, which a test asserts, since the name check derives them that way.
9. The root `AGENTS.md` names the command, and the package `AGENTS.md` names the check among its rules.
10. The package change carries a changeset.

## Out of scope

- Non-colour names in `DESIGN.md` (typography, spacing, radius, elevation, layers, motion) and their recipes: their own slices.
- The skill hub that links the rule file (Stage 1), and any lint for component code.
- The `smol-toml` audit finding: its own branch after this spec.
- The contrast gate (slice 2).

## Done when

- `npm run check:names` passes on the four documents.
- On a copy of the source with `sys.text.link` renamed, the name check fails on `DESIGN.md` at every line that names it.
- The name check tests pass in `npm test`, and they failed in the commit that added them.
- Every pair in the rule file passes its test: incorrect forms fail under the named check, correct forms pass.
- Staging `DESIGN.md` with a stale colour name makes `git commit` fail; CI runs the name check.
- `GAPS.md`: the three A0.3 entries read as `design.md` states, and every "not yet" entry names a stage or says it is in none.
- `npm test` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- Every command in the root and package `AGENTS.md` runs, and every file they name exists.
- `npx changeset status` passes.
- The work is merged into `main` through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
