# 004 Colour tokens check: requirements

## Goal

Make gate 1 real for colour: one command checks the token source with Terrazzo's rules and the InkHR rules, and the same command runs after an agent edits the source, before a commit, and in CI, so a colour mistake fails before it ships, for a person and an agent alike, under a rule name. An agent is also told when tests fail before it finishes, and starts each session with the state it needs. This is the second of three specs for colour slice 1; it covers C1, C2, C5, E6 and the Terrazzo part of A0.4 of the plan.

## Context

- The plan is `docs/stage-0-colours-slice-1-plan.md` in the design workspace, merged on 23 September 2026. Spec 003 put the source in `packages/tokens/src/`, the build in `build.mjs` and the covered types in `covered-types.mjs`, and decided that everything in this iteration covers colour only.
- The research behind the check is `reference/research-token-lint-tooling-2026-09.md` and `reference/research-token-gates-2026-09.md` in the design workspace. Terrazzo is a rule engine: a local plugin adds named rules, and `lint.rules` in the config sets each rule's severity.
- The trials in `design.md` ran on 23 September 2026 against the source as merged, with `@terrazzo/cli` 2.7.1 from the design workspace harness. Three of their results change the plan: `core/descriptions` and `core/consistent-naming`'s function form cannot be limited to a type, and `core/duplicate-values` fails 152 times on the real files.
- The Naming rules board states the grammar of a component role, `sys.{role}[.{variant}].{property}[-{state}]`, with two closed lists: five properties and two states. Eighteen of the 60 colour roles have another shape: the 17 roles under `sys.surface`, `sys.text` and `sys.border`, and `image.treatment.tint`. The grammar the check enforces is in `design.md`, the option the design lead chose on 23 September 2026; the board is brought in line in the design workspace.
- Spec 002 set the pattern this spec follows: one checker, called by every layer, with tests for a passing and a failing case of every rule.
- Claude Code applied the hooks this spec adds to the session that added them, so they were verified there; the SessionStart hook runs only when a session starts, clears, compacts or resumes, so its script is verified by hand and its output is seen at the next start.

## Requirements

1. `npx nx run tokens:check` checks the shared file with one theme file at a time, both pairs, and fails if either fails. Each failure prints one line naming the theme, the rule and the token.
2. The check runs Terrazzo's format rules, `core/required-type` and `core/consistent-naming` (kebab-case) on every token.
3. The check runs the InkHR rules, each an error, from one local Terrazzo plugin:
   1. `inkhr/descriptions`: every token of a covered type has a `$description`.
   2. `inkhr/naming`: every token of a covered type matches the grammar in `design.md`.
   3. `inkhr/references`: a `ref` token references nothing, and a `sys` token that references anything references a `ref` token.
   4. `inkhr/known-type`: every `$type` is a DTCG 2025.10 type, `string` or `asset`, whether or not anything references it.
   5. `inkhr/deprecated-replacement`: a `$deprecated` token names the token that replaces it.
   6. `inkhr/theme-parity`: the two theme files declare the same names.
4. The covered types are read from `packages/tokens/covered-types.mjs`, the list the build reads.
5. Every rule has a passing and a failing fixture in the package tests, and the three source files pass.
6. The check runs in the git pre-commit hook when a staged file is under `packages/tokens/src/`, and in pull request CI.
7. After an agent edits or writes a file under `packages/tokens/src/`, a Claude Code hook runs the check and gives the agent the failures, with their rule names, before it continues.
8. When an agent tries to finish while the repository tests or the package targets fail, a Claude Code hook tells it the failures once; it may then finish, explaining why.
9. At the start of every session, a Claude Code hook prints the Now and Interrupted work blocks of `PROGRESS.md`, the last ten commits, `git status --porcelain`, and the recently merged pull requests, labelled as derived.
10. The hook scripts are covered by tests in `tools/`, run by `npm test`.
11. `@terrazzo/cli` is installed at 2.7.1, pinned, and the stack doc's Terrazzo entry says what the check catches and what it does not.
12. The root and package `AGENTS.md` name the check command, and every rule in the package `AGENTS.md` names the rule or test that enforces it.
13. The package change carries a changeset.

## Out of scope

- `DESIGN.md`, `GAPS.md`, the name check over the docs (C6) and the rule file for agents (E7): spec 005.
- Rules and grammar for any type other than colour, and descriptions for the 60 undescribed non-colour tokens.
- The contrast gate (slice 2).
- A `tsc` after-edit hook for Angular code (Stage 1).
- The parked topics in the design lead's list.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- Each fixture in the table in `design.md` fails under the rule named there, or passes where the table says so, in `npx nx run tokens:test`; the tests failed in the commit that added them.
- Staging a source file with a raw hex in a role makes `git commit` fail with `core/valid-color`; a commit that touches nothing under `packages/tokens/src/` does not run the check.
- In a Claude Code session in this repository, an edit that breaks `inkhr/naming` gets that rule name back from the after-edit hook, an edit outside `packages/tokens/src/` runs nothing, and a finish with a failing test is refused once with the failures. `tools/hooks/session-start.mjs` prints the `PROGRESS.md` blocks, the git state and the merged pull requests, and the next session opens with them.
- `npm test` passes, including the hook script tests.
- `npx nx run-many -t lint build typecheck test check` passes locally and in CI on the pull request.
- `package.json` and the stack doc both say `@terrazzo/cli` 2.7.1.
- Every command in the root and package `AGENTS.md` runs, and every file they name exists.
- `npx changeset status` passes.
- The work is merged into `main` through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
