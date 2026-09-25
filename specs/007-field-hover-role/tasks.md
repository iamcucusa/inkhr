# 007 Field hover role: tasks

Work on the branch `007-field-hover-role`, which also carries specs 008 and 009: the three touch the same files and the plan behind them is one decision in the design workspace. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 007 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit. Open one pull request at the end for the three specs; a person merges it with a rebase merge.

The order follows the dependencies: the failing tests, the lint and the role, then the rule file and the documents that name it.

## 1. Write the failing tests

1. In `packages/tokens/tests/check.test.mjs`, add the four fixtures from "Tests" in `design.md` beside the naming fixtures.
2. Check: `npx nx run tokens:test` fails on "the new role in one theme only", which passes a source that has no such role; every other test passes. The three naming fixtures pass before and after the lint change, since the grammar rejects every neutral state today; that the lint accepts `sys.border.strong-hover` is shown by the source passing once the role is added, and by the rule file row.

Commit: `test(tokens): add failing tests for the field hover role`

## 2. Add the role and the lint

Depends on task 1. Two commits.

1. Add `NEUTRAL_STATES` and its grammar shape to `packages/tokens/lint/inkhr-rules.mjs` as in "The lint" in `design.md`, and name this spec in the file's header comment.
2. Check: `npx nx run tokens:check` passes on the source; the three naming fixtures pass; "the new role in one theme only" still fails.

Commit: `feat(tokens): let a neutral name carry a state where the list allows it`

3. Add `sys.border.strong-hover` to both theme files, and change the four descriptions, as in "The role" and "The sentences" in `design.md`. The after-edit hook runs the check on each edit.
4. Check: `npx nx run tokens:check` passes; every `check.test.mjs` fixture passes; `git grep -n "hovered or focused"` finds nothing; after `npx nx run tokens:build`, the four outputs carry the role at the values in "Done when" in `requirements.md`.

Commit: `feat(tokens): add the field hover role`

## 3. Name the role in the rule file

Depends on task 2.

1. Add the row in "The rule file" in `design.md` to rule 3 of `.claude/skills/inkhr/rules/tokens.md`.
2. Check: `npx nx run tokens:test` passes, the new row included.

Commit: `docs(repo): add the neutral state row to the token rule file`

## 4. Name the role in the design guide and the package map

Depends on task 2. Two commits.

1. Make the `DESIGN.md` changes in "Documentation" in `design.md`.
2. Check: `npm run check:names` passes; the Field recipe and the Edge row agree.

Commit: `docs(repo): name the field hover role in the design guide`

3. Make the `packages/tokens/AGENTS.md` changes in "Documentation" in `design.md`.
4. Check: under 60 lines; `npm run check:names` passes; every command in the file runs.

Commit: `docs(tokens): name the field hover role in the package agent map`

## 5. Add the changeset

1. `npx changeset add`, `@inkhr/tokens` minor, renamed to `.changeset/field-hover-role.md` with the summary in "Documentation" in `design.md`.
2. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 007 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the field hover role`

## 6. Pull request

Together with specs 008 and 009.

1. Push the branch and open a pull request that names `specs/007-field-hover-role`, `specs/008-dark-boundary-step` and `specs/009-colour-never-alone`, lists the "Done when" checks from each `requirements.md` with their results, and records the number of human correction rounds.
2. A person merges it with a rebase merge once every check passes.
