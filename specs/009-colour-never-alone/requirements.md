# 009 Colour is never the only cue: requirements

## Goal

Write into the token sentences and `DESIGN.md` that a link, a selection, the active entry of a list and the current page each carry a cue besides colour. No value or name changes.

## Context

- Decision 26 in the design workspace's `docs/decisions.md` (24 and 25 September 2026) made the change in its token export and its review checklist; this spec brings the package to the same state. The plan the design workspace wrote for this repository is the source of every sentence here.
- Two pairs of roles cannot be told apart by colour. `sys.text.link` and `sys.status.info.text` hold one value in both themes, 1.00:1, so a link inside an info alert reads as the alert's words. `sys.selected.bg` against its background is 1.12:1 on white and 1.08:1 on `sys.surface.page` in light and 1.05:1 in dark: too faint to carry the choice alone.
- `DESIGN.md` says status is never colour alone and says nothing about links, selection, the active entry of a list or the current page. Its `sys.status.info.text` description says the two roles share a value in light only, which is wrong: they share it in both themes.
- Nothing checks any of this: gate 3 does not run yet, and no rule reads an underline or a check.

## Requirements

1. The descriptions of `sys.text.link`, `sys.status.info.text`, `sys.selected.bg` and `sys.selected.border` in both theme files say what cue accompanies the colour, word for word as `design.md` gives them.
2. `DESIGN.md` carries, in its do's and don'ts, the three lines in `design.md` about links, selected options and the current page, and in Accessibility the sentence that colour is never the only cue.
3. `GAPS.md` records under "Not in InkHR yet" that no check fails a link without an underline or a selected option without a check or a heavier label, and what covers links once gate 3 runs.
4. The package change carries a changeset: patch.

## Out of scope

- Any value or name change: specs 007 and 008.
- The component criteria that make the cues real: Stage 1, listed under "Stage 1 criteria" in `specs/007-field-hover-role/design.md`.
- A check for non-colour cues: recorded as a gap.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- `npm run check:names` passes on `DESIGN.md` and `GAPS.md`.
- `npm test` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
