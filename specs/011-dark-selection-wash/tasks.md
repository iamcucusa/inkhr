# 011 Dark selection wash: tasks

Work on the branch `011-dark-selection-wash`. One commit per task; every task commit also moves the 011 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit.

## 1. Change the step

1. Change the `$value` and the `$description` of `ref.color.cobalt.950` in `packages/tokens/src/inkhr.tokens.json`, as in "The value" and "The sentence" in `design.md`.
2. Check: `npx nx run tokens:check` passes; each file in `packages/tokens/src/` differs from the design workspace's export only by the trailing newline; after `npx nx run tokens:build`, the cobalt 950 variable holds `#1C253F`.

Commit: `fix(tokens): lower the chroma of the dark selection and info wash`

## 2. Name the spec in the package map and add the changeset

Two commits.

1. Add `specs/011-dark-selection-wash/` to "Where to look next" in `packages/tokens/AGENTS.md`.
2. Check: `npm run check:names` passes.

Commit: `docs(tokens): name the dark selection wash spec in the package agent map`

3. Add `.changeset/dark-selection-wash.md`, `@inkhr/tokens` patch, with the summary in "Documentation" in `design.md`.
4. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 011 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the dark selection wash`

## 3. Pull request

Open it from `011-dark-selection-wash` to `main`, naming the spec folder. A person merges.
