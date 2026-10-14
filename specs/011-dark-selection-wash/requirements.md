# 011 Dark selection wash: requirements

## Goal

In dark, make the wash under a selected row, the current nav item and an info message read as a tint of cobalt, not as navy. Today `ref.color.cobalt.950` is `#070A5A`, OKLCH lightness 0.23 and chroma 0.13, seven times the chroma of light's wash `ref.color.cobalt.50` (0.019), so these become large saturated blocks on a dark screen. After this spec it is `#1C253F`, lightness 0.27 and chroma 0.05 at hue 268, and its description says why.

## Context

- The design workspace's patterns critique (finding S3) found the dark wash read as navy, against decision 1 there: there is no navy, and the dark washes are cobalt at low chroma. Decision 26 in that workspace's `docs/decisions.md` records the new value, retuned on 14 October 2026, and its token export holds it. This spec brings the package source to the same state.
- Only two roles read the step, both in `packages/tokens/src/modes/dark.json`: `sys.selected.bg` and `sys.status.info.bg`. No light role reads it.
- The ramp stays in order: `ref.color.cobalt.900` is lightness 0.31, above the new 950.
- Decision 26 asks two questions of any change to a cobalt step. The action stays the strongest cobalt: the wash is the weakest. A selected row keeps cues besides colour: its cobalt edge and its heavier label.

## Requirements

1. In `packages/tokens/src/inkhr.tokens.json`, `ref.color.cobalt.950` holds the value and the description `design.md` gives, word for word. No other token changes.
2. Every pair on the new wash in dark keeps its floor: 4.5:1 for text, 3:1 for a boundary or an icon.
3. The package change carries a changeset: patch, since no name changes.

## Out of scope

- The contrast gate (colour slice 2). When it exists, its list gains the pairs in "The values" in `design.md`.
- Every other cobalt step, and both theme files.
- The design workspace, which already holds the change.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- After `npx nx run tokens:build`, the cobalt 950 variable in `dist/css/light.css` holds the new value, and the two dark roles still reference it.
- `diff` of each file in `packages/tokens/src/` against the design workspace's export shows only the trailing newline.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
