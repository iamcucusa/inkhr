# 005 Colour tokens names: tasks

Work on the branch `005-colour-tokens-names`. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 005 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit. Open one pull request at the end and merge it with a rebase merge.

The order follows the dependencies: the name check's tests and the check, then the documents it checks, then the layers that run it, then the rule file, which names the checks.

## 1. Write the failing name check tests

1. Write `tools/name-check/check-names.test.mjs`: a document with a stale colour name fails and names the file and line; a group with `.*`, a token id and an `--ink-` variable pass; a pending pattern passes and a pending pattern that matches a colour token is refused; a "`prefix.*`: a, b" list is expanded and a wrong word in it fails; a line with the skip marker is not read; a source copy with `sys.text.link` renamed makes a document naming it fail.
2. Add the assertion to `packages/tokens/tests/outputs.test.mjs` that every light CSS declaration is `--ink-` plus a token id with dots as hyphens.
3. Check: `npm test` fails on the new tests, because the check does not exist; the output assertion passes.

Commit: `test(repo): add failing tests for the name check`

## 2. Add the name check

Depends on task 1.

1. Write `tools/name-check/check-names.mjs` and `tools/name-check/pending.mjs` as in "The name check" in `design.md`, and add `"check:names": "node tools/name-check/check-names.mjs"` to `package.json`.
2. Check: `npm test` passes; `npm run check:names` fails on `DESIGN.md` and `GAPS.md` with the colour names from the trial, and on the two wrong examples in `packages/tokens/AGENTS.md`.

Commit: `build(repo): check token names in the docs`

## 3. Correct the colour names in DESIGN.md

Depends on task 2.

1. Make the changes in "`DESIGN.md` (A0.1)" in `design.md`, and nothing else.
2. Check: `npm run check:names` reports nothing for `DESIGN.md`; `git diff DESIGN.md` touches no non-colour name.

Commit: `docs(repo): correct the colour names in the design guide`

## 4. Bring GAPS.md up to date

Depends on task 2.

1. Make the changes in "`GAPS.md` (A0.3, E3)" in `design.md`.
2. Check: `npm run check:names` reports nothing for `GAPS.md`; every "not yet" entry names a stage or says it is in none.

Commit: `docs(repo): update the colour gaps and name their stages`

## 5. Mark the wrong examples in the package map

Depends on task 2.

1. In `packages/tokens/AGENTS.md`, add the skip marker to the wrong-examples line and the `check:names` rule line.
2. Check: `npm run check:names` passes on all four documents; the file stays under 60 lines.

Commit: `docs(tokens): name the name check in the package agent map`

## 6. Run the name check before commits, before finishing and in CI

Depends on tasks 3 to 5. Two commits.

1. Add the `lint-staged` entry from "Where it runs" in `design.md`, and `npm run check:names` to `COMMANDS` in `tools/hooks/before-done.mjs`.
2. Check: staging `DESIGN.md` with `color.cobalt.700` put back makes `git commit` fail; restore it; `npm test` passes.

Commit: `build(repo): run the name check before commits and finishing`

3. Add `- run: npm run check:names` after `npm test` in `.github/workflows/checks.yml`.
4. Check: after the pull request exists, the job passes there.

Commit: `ci(ci): check the token names in the docs on pull requests`

## 7. Write the failing rule file test

Depends on task 2.

1. Write `packages/tokens/tests/rule-file.test.mjs` as in "The test" in `design.md`.
2. Check: `npx nx run tokens:test` fails on it, because the rule file does not exist; every other test passes.

Commit: `test(tokens): add a failing test for the token rule file`

## 8. Write the rule file

Depends on task 7.

1. Write `.claude/skills/inkhr/rules/tokens.md` as in "The rule file" in `design.md`.
2. Check: `npx nx run tokens:test` passes; the file holds the table and the two lines under it, and no rule in prose.

Commit: `docs(repo): add the token rule file for agents`

## 9. Name the command, and add the changeset

Two commits.

1. Add the `check:names` line to the root `AGENTS.md`.
2. Check: every command in the root `AGENTS.md` runs.

Commit: `docs(repo): name the name check command`

3. `npx changeset add --empty`, renamed to `.changeset/colour-tokens-names.md` with the summary "Check that the docs name only tokens that exist. No output changes."
4. Check: `npx changeset status` passes. Set the 005 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the name check`

## 10. Pull request

1. Push the branch and open a pull request that names `specs/005-colour-tokens-names`, lists the "Done when" checks from `requirements.md` with their results, and records the number of human correction rounds.
2. Merge with a rebase merge once every check passes. That closes colour slice 1.
