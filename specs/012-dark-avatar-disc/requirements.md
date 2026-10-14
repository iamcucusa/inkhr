# 012 Dark avatar disc: requirements

## Goal

In dark, draw the disc behind a person's initials in ink, not cobalt. Today `sys.avatar.bg` in dark references `ref.color.cobalt.900`, `#111D81`, OKLCH chroma 0.16: it reads as navy on a dark screen and nearly vanishes on `sys.surface.raised`, at 1.01:1. After this spec it references `ref.color.ink.800`, `#43474C`, and the descriptions of both steps say who reads them.

## Context

- Decision 6 in the design workspace's `docs/decisions.md` records the change, and that workspace's token export holds it. This spec brings the package source to the same state.
- Decision 1 there: there is no navy. Spec 011 retunes the dark wash for the same reason.
- `ref.color.ink.800` already draws the dark hairline, `sys.border.default`. The initials stay on `ref.color.cobalt.200`, and light stays on `ref.color.cobalt.100` with no change.
- After the change no dark role reads `ref.color.cobalt.900`. Light still reads it for `sys.text.on-selected` and the two pressed steps.

## Requirements

1. In `packages/tokens/src/modes/dark.json`, `sys.avatar.bg` references `{ref.color.ink.800}`. Its description, `sys.avatar.text` and `light.json` do not change.
2. The descriptions of `ref.color.cobalt.900` and `ref.color.ink.800` in `packages/tokens/src/inkhr.tokens.json` are the sentences `design.md` gives, word for word.
3. The initials keep 4.5:1 on the disc in dark.
4. The package change carries a changeset: patch, since no name changes.

## Out of scope

- The contrast gate (colour slice 2). When it exists, `sys.avatar.text` on `sys.avatar.bg` is one of its pairs, in both themes.
- The light avatar, and every other role.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- After `npx nx run tokens:build`, `dist/css/dark.css` declares `--ink-sys-avatar-bg` as a reference to the ink 800 variable, and `dist/css/light.css` is unchanged apart from spec 011's value.
- `diff` of each file in `packages/tokens/src/` against the design workspace's export shows only the trailing newline.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `npx changeset status` passes.
- The work is merged into `main` by a person through the pull request it shares with spec 011.
