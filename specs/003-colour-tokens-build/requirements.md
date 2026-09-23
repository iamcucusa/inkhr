# 003 Colour tokens build: requirements

## Goal

Put the described colour source in the repository as the `@inkhr/tokens` package and build it, from one command, into CSS, TypeScript, Swift and Kotlin that a consumer can read, with the built TypeScript proved to compile. This is the first of three specs for colour slice 1; it covers A1, B1 to B5, A0.2, the Style Dictionary and DTCG parts of A0.4, and E4 of the plan.

## Context

- The plan is `docs/stage-0-colours-slice-1-plan.md` in the design workspace, as merged on 23 September 2026. Its section 7 sets how the work is split; the split is recorded in `PROGRESS.md`: 003 the source and the build, 004 gate 1 and the hooks (C1, C2, C5, E6, the Terrazzo part of A0.4), 005 the names and the agent files (A0.1, A0.3, C6, E1 completed, E3, E7). F, the measurement of the loop, is taken on this spec, the first an agent runs end to end.
- The design workspace computes the three source files and exports them; nothing is authored under `packages/tokens/src`. How later exports reach the package is deferred to its own plan (Q1). This spec copies the files once.
- The three files hold 390 declarations: `inkhr.tokens.json` 256 (69 colour primitives and 187 other tokens), `modes/light.json` and `modes/dark.json` 67 each (60 colour roles, 4 shadows, 2 assets, 1 string). Every colour token carries a `$description`; 60 non-colour tokens in the shared file do not yet.
- The built-in Style Dictionary transform groups build colour correctly on every platform and print durations, shadows, typography and native dimensions wrong (`token-pipeline-check.md` in the design workspace). The transforms those types need are out of this slice, so this spec builds colour only.
- The repository is an Nx workspace with no projects (spec 001), with the commit and branch rules enforced by hooks and CI (spec 002). The root `tsconfig.base.json` sets `skipLibCheck: true`, `.gitignore` ignores `dist/`, and the pre-commit hook runs Prettier on every staged file.
- No licence is chosen for the repository, and none is added here.

## Requirements

1. `packages/tokens` is an npm workspace package named `@inkhr/tokens` at version `0.0.0` and an Nx project named `tokens`, so Nx, npm and Changesets all see it.
2. `packages/tokens/src/` holds `inkhr.tokens.json`, `modes/light.json` and `modes/dark.json`, byte for byte as the design workspace exported them. No formatter or hook in the repository rewrites them.
3. `npx nx run tokens:build` builds the shared file with one theme file at a time, never both theme files together, into `packages/tokens/dist/`: CSS, TypeScript (JavaScript with declarations), Swift and Kotlin for each theme.
4. The outputs hold colour tokens only: every token whose `$type` is `color` in the pair, and nothing else.
5. The CSS uses the `--ink-` prefix. Light is under `:root` and holds the primitives and the light roles; dark is under `[data-ink-theme="dark"]` and holds only the tokens `modes/dark.json` declares, each still a `var()` reference to a primitive.
6. The mode filter applies to CSS only. Swift and Kotlin carry every colour token of the pair, since they have no cascade.
7. No output file carries a `$description`; the source files are its only home.
8. `npx nx run tokens:typecheck` runs `tsc` over the built declarations and fails on a broken declaration.
9. The outputs are covered by tests, written and committed before the build configuration, and run by `npx nx run tokens:test`.
10. `style-dictionary` is installed at 5.5.4, pinned, and the stack doc agrees.
11. Pull request CI runs lint, build, type-check and test for the packages.
12. The root `AGENTS.md` names the token build and type-check commands once they run, and its primitive example reads `ref.color.cobalt.700`. The stack doc's DTCG and Style Dictionary entries say what is true of colour after this spec.
13. The package has its own `AGENTS.md`, in a first form that names only what exists after this spec, and a one-line `CLAUDE.md` containing `@AGENTS.md`.
14. `PROGRESS.md` exists in its first form, with one row per colour spec.
15. The package change carries a changeset.

## Out of scope

- Gate 1: Terrazzo, the InkHR rules, the `tokens:check` target and the after-edit and before-done hooks (spec 004). Nothing in this spec names `tokens:check`.
- `DESIGN.md` and `GAPS.md` (spec 005, where C6 can check the names).
- Outputs for any type other than colour, the six transforms and the typography format, and the density pair.
- Publishing: `files`, `exports`, a README, `engines`, a licence, the `tsconfig.base.json` path alias, one combined CSS file and native packaging (slice 3 and Stage 1). The Swift and Kotlin class and package names are provisional until then.
- The contrast gate and the data palette distance check (slice 2).
- The Nx MCP server.

## Done when

- `npx nx show project tokens` prints the project and `npm pkg get version -w @inkhr/tokens` prints `0.0.0`.
- `shasum` of the three files under `packages/tokens/src/` matches the design workspace's `tokens/` export, and a commit that stages them leaves them unchanged.
- `npx nx run tokens:build` writes `dist/css/light.css` with 129 declarations (69 `--ink-ref-color-*`, 60 roles) under `:root`, and `dist/css/dark.css` with 60 declarations under `[data-ink-theme="dark"]`, none of them `--ink-ref-*` and every value a `var(--ink-ref-*)`.
- Each theme's TypeScript, Swift and Kotlin output declares the same 129 colour tokens and no other token.
- `ref.color.base.transparent` comes out as `rgba(255, 255, 255, 0)` in CSS, `UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0)` in Swift and `Color(0x00ffffff)` in Kotlin.
- No description sentence from the source appears in any file under `dist/`.
- `npx nx run tokens:typecheck` passes on the build and fails when a declaration file is broken by hand.
- `npx nx run tokens:test` passes, and it failed in the commit that added the tests.
- `npx nx run-many -t lint build typecheck test` passes locally and in CI on the pull request.
- `package.json` and the stack doc both say `style-dictionary` 5.5.4.
- Every command in the root and package `AGENTS.md` runs, and every file they name exists.
- `npx changeset status` lists `@inkhr/tokens`.
- The work is merged into `main` through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request and in `PROGRESS.md` (F).
