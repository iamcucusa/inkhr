# 008 Dark boundary step: tasks

Work on the branch `007-field-hover-role`, after the tasks of spec 007. One commit per task; stop after each task and propose the commit message for approval. Every task commit also moves the 008 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit.

## 1. Move the three references and rewrite the three sentences

1. Make the three `$value` changes in `packages/tokens/src/modes/dark.json` and the three `$description` changes in `packages/tokens/src/inkhr.tokens.json`, as in "The values" and "The sentences" in `design.md`. The after-edit hook runs the check on each edit.
2. Check: `npx nx run tokens:check` passes; `git grep -n "lands them all on one step"` finds nothing; after `npx nx run tokens:build`, the three dark CSS declarations reference the cobalt 400 variable and `dist/css/light.css` is unchanged.

Commit: `fix(tokens): move the dark boundary group one step back from the action`

## 2. Name the spec in the package map and add the changeset

Two commits.

1. Add `specs/008-dark-boundary-step/` to "Where to look next" in `packages/tokens/AGENTS.md`.
2. Check: under 60 lines; `npm run check:names` passes.

Commit: `docs(tokens): name the dark boundary spec in the package agent map`

3. `npx changeset add`, `@inkhr/tokens` patch, renamed to `.changeset/dark-boundary-step.md` with the summary in "Documentation" in `design.md`.
4. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 008 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the dark boundary step`

## 3. Pull request

With specs 007 and 009, as task 6 of `specs/007-field-hover-role/tasks.md` says.
