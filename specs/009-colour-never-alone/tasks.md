# 009 Colour is never the only cue: tasks

Work on the branch `007-field-hover-role`, after the tasks of specs 007 and 008. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 009 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit.

## 1. Rewrite the four sentences

1. Change the four `$description`s in both theme files as in "The sentences" in `design.md`. The after-edit hook runs the check on each edit.
2. Check: `npx nx run tokens:check` passes; the three source files match the design workspace's export, apart from the newline prettier adds at the end of each file.

Commit: `docs(tokens): say what tells a link and a selection apart besides colour`

## 2. Write the rules into the design guide and the gaps

Depends on nothing. One commit.

1. Make the `DESIGN.md` and `GAPS.md` changes in "Documentation" in `design.md`.
2. Check: `npm run check:names` passes.

Commit: `docs(repo): add the non-colour cues to the design guide and the gaps`

## 3. Name the spec in the package map and add the changeset

Two commits.

1. Add `specs/009-colour-never-alone/` to "Where to look next" in `packages/tokens/AGENTS.md`.
2. Check: under 60 lines; `npm run check:names` passes.

Commit: `docs(tokens): name the non-colour cue spec in the package agent map`

3. `npx changeset add`, `@inkhr/tokens` patch, renamed to `.changeset/colour-never-alone.md` with the summary in "Documentation" in `design.md`.
4. Check: `npx changeset status` passes; `npm test` and `npx nx run-many -t lint build typecheck test check` pass. Set the 009 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the non-colour cues`

## 4. Pull request

With specs 007 and 008, as task 6 of `specs/007-field-hover-role/tasks.md` says.
