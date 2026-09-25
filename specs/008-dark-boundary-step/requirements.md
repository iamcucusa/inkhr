# 008 Dark boundary step: requirements

## Goal

In dark, move the boundary group one step back from the action, so the action is the strongest cobalt in both themes. Today the eight dark cobalt roles all reference `ref.color.cobalt.300`, so a focused field or a selected row competes with the primary button. After this spec `sys.border.focus`, `sys.focus.ring` and `sys.selected.border` reference `ref.color.cobalt.400` in dark, and the cobalt descriptions say where each step is read.

## Context

- Decision 26 in the design workspace's `docs/decisions.md` (24 and 25 September 2026) made the change in its token export; this spec brings the package source to the same state. The plan the design workspace wrote for this repository is the source of every value and sentence here.
- In light the action reads `ref.color.cobalt.700` and the boundaries `600`, one step weaker, at 1.44:1 from the action. In dark all eight cobalt roles sat on `300`. On ink a weaker cobalt is a darker one, so the boundary group moves to `400`, at 1.36:1 from the action. No gate checks that distance: it is a design choice with no floor.
- `ref.color.cobalt.400` clears 3:1 on the four dark surfaces: 5.73:1 on `sys.surface.raised`, 6.93:1 on `sys.surface.default`, 7.74:1 on `sys.surface.page` and 8.26:1 on `sys.surface.sunken`. `sys.selected.border` on `sys.selected.bg` moves from 9.99:1 to 7.34:1.
- `ref.color.cobalt.300`'s description says dark "lands them all on one step", which stops being true.

## Requirements

1. In `packages/tokens/src/modes/dark.json`, `sys.border.focus`, `sys.focus.ring` and `sys.selected.border` reference `{ref.color.cobalt.400}`. `light.json` does not change. `sys.action.primary.bg`, `sys.signal.bg`, `sys.text.link`, `sys.status.info.text` and `image.treatment.tint` stay on `{ref.color.cobalt.300}` in dark.
2. The descriptions of the `ref.color.cobalt` group, `ref.color.cobalt.300` and `ref.color.cobalt.400` in `packages/tokens/src/inkhr.tokens.json` say where each step is read in each theme, word for word as `design.md` gives them.
3. The package change carries a changeset: patch, since no name changes.

## Out of scope

- The contrast gate (colour slice 2). When it exists, its list gains the three roles at 3:1 on the four dark surfaces and `sys.selected.border` on `sys.selected.bg`, the pairs the design workspace's pre-flight already checks.
- The light values, and every other cobalt role.
- The article about the token pipeline in the design workspace, which shows the values on `main` at `8882b71`; that is an editorial decision there and no work here.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source: the three roles still hold one reference each.
- After `npx nx run tokens:build`, `dist/css/dark.css` declares `--ink-sys-border-focus`, `--ink-sys-focus-ring` and `--ink-sys-selected-border` under `[data-ink-theme="dark"]` as references to the cobalt 400 variable, and `dist/css/light.css` is unchanged.
- `git grep -n "lands them all on one step"` finds nothing.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
