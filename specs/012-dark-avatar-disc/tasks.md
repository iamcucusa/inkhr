# 012 Dark avatar disc: tasks

Work on the branch `011-dark-selection-wash`, after the tasks of spec 011. One commit per task; every task commit also moves the 012 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit.

## 1. Move the disc and rewrite the two sentences

1. Change the `$value` of `sys.avatar.bg` in `packages/tokens/src/modes/dark.json` and the two `$description`s in `packages/tokens/src/inkhr.tokens.json`, as in "The value" and "The sentences" in `design.md`.
2. Check: `npx nx run tokens:check` passes; each file in `packages/tokens/src/` differs from the design workspace's export only by the trailing newline; after `npx nx run tokens:build`, the dark avatar declaration references the ink 800 variable.

Commit: `fix(tokens): draw the dark avatar disc in ink`

## 2. Name the spec in the package map and add the changeset

Two commits.

1. Add `specs/012-dark-avatar-disc/` to "Where to look next" in `packages/tokens/AGENTS.md`.
2. Check: `npm run check:names` passes.

Commit: `docs(tokens): name the dark avatar disc spec in the package agent map`

3. Add `.changeset/dark-avatar-disc.md`, `@inkhr/tokens` patch, with the summary in "Documentation" in `design.md`.
4. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 012 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the dark avatar disc`

## 3. Pull request

Push to the pull request spec 011 opened, and name both spec folders in it. A person merges.
