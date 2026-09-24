# 006 Colour role references: tasks

Work on the branch `006-colour-role-references`. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 006 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit. Open one pull request at the end; a person merges it with a rebase merge.

The order follows the dependencies: the failing tests, the rule, then the rule file and the documents that name it.

## 1. Write the failing tests

1. In `packages/tokens/tests/check.test.mjs`, add `inkhr/role-reference` to the hex fixture's rules, and add the four fixtures from the trial table in `design.md`: a colour object in a role, a JSON Pointer `$ref` in a role, a colour object in `image.treatment.tint` in `modes/dark.json`, and a raw duration in `sys.motion.duration.fast`.
2. In `packages/tokens/tests/rule-file.test.mjs`, key the `core/valid-color` runner as `inkhr/role-reference`.
3. Check: `npx nx run tokens:test` fails on the hex fixture, the colour object, the `$ref` and the tint fixtures, and on rule file row 1, whose check no longer has a runner; the duration fixture and every other test pass.

Commit: `test(tokens): add failing tests for the role reference rule`

## 2. Add the rule

Depends on task 1.

1. Add `inkhr/role-reference` to `packages/tokens/lint/inkhr-rules.mjs` as in "The rule" in `design.md`, and turn it on as an error in `packages/tokens/terrazzo.config.mjs`.
2. Check: `npx nx run tokens:check` passes on the source; every `check.test.mjs` fixture passes; rule file row 1 still fails, since the row names `core/valid-color`.

Commit: `fix(tokens): check that a colour role holds a reference`

## 3. Name the rule in the rule file

Depends on task 2.

1. Replace row 1 of `.claude/skills/inkhr/rules/tokens.md` with the two rows in "The rule file" in `design.md`.
2. Check: `npx nx run tokens:test` passes, both rows of rule 1 included.

Commit: `docs(repo): name the role reference rule in the token rule file`

## 4. Name the rule in the package map and the stack doc

Depends on task 2. Two commits.

1. Make the `packages/tokens/AGENTS.md` changes in "Documentation" in `design.md`.
2. Check: under 60 lines; `npm run check:names` passes; every command in the file runs.

Commit: `docs(tokens): name the role reference rule in the package agent map`

3. Make the `@terrazzo/cli` entry changes in "Documentation" in `design.md`.
4. Check: the version table and every other entry are unchanged.

Commit: `docs(repo): add role references to what the terrazzo plugin checks`

## 5. Add the changeset

1. `npx changeset add --empty`, renamed to `.changeset/colour-role-references.md` with the summary in "Documentation" in `design.md`.
2. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 006 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the role reference rule`

## 6. Pull request

1. Push the branch and open a pull request that names `specs/006-colour-role-references`, lists the "Done when" checks from `requirements.md` with their results, and records the number of human correction rounds.
2. A person merges it with a rebase merge once every check passes.
