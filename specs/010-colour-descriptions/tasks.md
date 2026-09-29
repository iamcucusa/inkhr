# 010 Colour descriptions: tasks

Work on the branch `010-colour-descriptions`. One commit per task unless a task says otherwise. Every task commit also moves the 010 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit. Open one pull request at the end; a person merges it with a rebase merge.

## 1. Write the comparison and the failing test

1. Write the comparison in "How it is applied and checked" in `design.md`, outside the repository, and add the fixture in "Tests" to `packages/tokens/tests/check.test.mjs`.
2. Check: the comparison fails, naming the missing role and the 59 unchanged sentences; `npx nx run tokens:test` fails on "the tertiary fill in one theme only" and passes everything else.

Commit: `test(tokens): add failing checks for the tertiary fill and the sentences`

## 2. Add the role and the sentences

Depends on task 1. Two commits.

1. Write the role and the sentence of `ref.color.base.transparent` by script, as in "How it is applied and checked" in `design.md`.
2. Check: `npx nx run tokens:check` passes; every `check.test.mjs` fixture passes; the comparison now fails only on the 58 sentences still to come.

Commit: `feat(tokens): add the tertiary fill role`

3. Write the other 58 sentences by the same script.
4. Check: the comparison passes; `npx nx run tokens:check` passes; after `npx nx run tokens:build`, the outputs carry the role as in "Done when" in `requirements.md`, and `npx nx run tokens:test` passes.

Commit: `docs(tokens): rewrite the colour descriptions after the workspace audit`

## 3. Name the role in the design guide and the package map

Depends on task 2. Two commits.

1. Make the `DESIGN.md` changes in "Documentation" in `design.md`.
2. Check: `npm run check:names` passes.

Commit: `docs(repo): name the tertiary fill role in the design guide`

3. Add `specs/010-colour-descriptions/` to "Where to look next" in `packages/tokens/AGENTS.md`.
4. Check: under 60 lines; `npm run check:names` passes.

Commit: `docs(tokens): name the colour description spec in the package agent map`

## 4. Add the changeset

1. `npx changeset add`, `@inkhr/tokens` minor, renamed to `.changeset/colour-descriptions.md` with the summary in "Documentation" in `design.md`.
2. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 010 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the colour descriptions`

## 5. Pull request

1. Push the branch and open a pull request that names `specs/010-colour-descriptions`, lists the 59 tokens, the new role and why it is needed, the "Done when" checks with their results, and records the number of human correction rounds.
2. A person merges it with a rebase merge once every check passes.
