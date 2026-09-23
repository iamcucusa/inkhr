# 003 Colour tokens build: design

## The source

The three files come from the design workspace's `tokens/` at commit `2d61a06` (23 September 2026) and are copied with `cp`, not with `scripts/sync-to-repo.sh`, which writes to a root `tokens/` folder and refuses once `packages/tokens` exists.

| File                    | SHA-256                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `src/inkhr.tokens.json` | `6da9d7f58fd06cc7c845440a047d922b5023c1426883c81216098464c972cd90` |
| `src/modes/light.json`  | `782267ad3444ed2a985b90b8329c0fa13ab2f2880f2ca13c7e4e28bdf36ca780` |
| `src/modes/dark.json`   | `a7f443f0565a2e376ae2566f90644aeb203975cbfa22f8c4dcf516d2073f30c8` |

If the workspace exports again before task 1, the new files are copied and this table is updated in the same commit.

The files fail `prettier --check` as exported, so the pre-commit hook would rewrite them and break requirement 2. `.prettierignore` gets `packages/tokens/src`; the Prettier command line honours it for explicit paths, so the agent's format hook, `lint-staged` and `format:check` all skip the source.

## The package

Two manifests, as spec 001 decided for every project.

- `packages/tokens/package.json`: `name` `@inkhr/tokens`, `version` `0.0.0`, `repository` (`git`, `https://github.com/iamcucusa/inkhr.git`, `directory` `packages/tokens`), `type` `module`. No `private`, so Changesets covers the package. No `license`, `files`, `exports` or `engines`.
- `packages/tokens/project.json`: `name` `tokens` and the targets below.

`style-dictionary` goes in the root `devDependencies`, next to every other tool, at exactly 5.5.4.

## The build

`packages/tokens/build.mjs` runs Style Dictionary once per theme, with `usesDtcg: true` and the source `src/inkhr.tokens.json` plus `src/modes/<theme>.json`. Never both theme files together: the second silently overrides the first on every shared name.

| Platform   | Transform group | Format                                          | Files                                     | Filter                                    |
| ---------- | --------------- | ----------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| CSS        | `css`           | `css/variables`                                 | `dist/css/light.css`, `dist/css/dark.css` | colour; for dark, also from the mode file |
| TypeScript | `js`            | `javascript/es6`, `typescript/es6-declarations` | `dist/ts/{light,dark}.js`, `.d.ts`        | colour                                    |
| Swift      | `ios-swift`     | `ios-swift/class.swift`                         | `dist/swift/InkTokens{Light,Dark}.swift`  | colour                                    |
| Kotlin     | `compose`       | `compose/object`                                | `dist/kotlin/InkTokens{Light,Dark}.kt`    | colour                                    |

- **Colour filter:** keeps a token whose `$type` is in `COVERED_TYPES`, on every file. `packages/tokens/covered-types.mjs` exports `COVERED_TYPES = ['color']`, the one list of token types the package covers; spec 004's description rule reads the same list.
- **CSS:** `prefix: 'ink'`, `outputReferences: true`, selector `:root` for light and `[data-ink-theme="dark"]` for dark.
- **Mode filter (B2):** on dark CSS only, keep tokens whose `filePath` resolves to `src/modes/dark.json`. Light keeps everything, because `:root` must declare the primitives the dark block refers to. Style Dictionary then warns "filtered out token references were found"; that is expected and not a failure, since the cascade resolves the references from `:root`.
- **No descriptions (B5):** `options.formatting.commentStyle: 'none'` on every file.
- **Class and package names:** `InkTokensLight` and `InkTokensDark`, Kotlin package `inkhr.tokens`. They say tokens, not colours, so later slices add their types to the same classes without a rename. They stay provisional until native packaging is decided.

### Trial

Run on 23 September 2026 against the three files above, with Style Dictionary 5.5.3 from the design workspace's `scripts/token-check` harness, the configuration above and the scratch file names of the trial.

| Output                       | Light                                                                                                     | Dark                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CSS                          | 129 declarations: 69 `--ink-ref-color-*`, 59 `--ink-sys-*`, `--ink-image-treatment-tint`                  | 60 declarations, no `--ink-ref-*`, every value `var(--ink-ref-*)` |
| TypeScript, Swift, Kotlin    | 129 constants each                                                                                        | 129 constants each                                                |
| `ref.color.base.transparent` | `rgba(255, 255, 255, 0)`, `UIColor(red: 1.000, green: 1.000, blue: 1.000, alpha: 0)`, `Color(0x00ffffff)` | the same                                                          |
| Description sentences        | none in any file                                                                                          | none in any file                                                  |

With `commentStyle: 'long'` instead, the descriptions reach every platform, Kotlin included, 17 in each light file on a sample word. `'none'` is what removes them.

Task 4 repeats the counts on 5.5.4 through the tests.

The plan's B2 counted 67 variables in the dark block. That count included the 4 shadows, 2 textures and 1 blend mode the dark file declares; with colour only it is 60, and all 60 are references.

## Type-check

`packages/tokens/tsconfig.json` extends `../../tsconfig.base.json`, sets `noEmit`, `module: nodenext`, `skipLibCheck: false` and includes `dist/ts/*.d.ts`.

`skipLibCheck: false` is the point of the file. The root config sets it to `true`, and with `true` `tsc` skips every `.d.ts`: in the trial, a declaration file with the same constant declared twice passed with `true` and failed with `false` (`TS2451: Cannot redeclare block-scoped variable`).

## Tests

`packages/tokens/tests/outputs.test.mjs`, run by Vitest 5.0.1 with `packages/tokens/vitest.config.mts` (node environment, `include: ['tests/**/*.test.mjs']`). The tests read `dist/` and derive what to expect from the source files, so they survive a new colour role without edits:

- Every platform file exists for both themes.
- Light CSS is one `:root` block declaring exactly the colour tokens of the light pair, each with the `--ink-` prefix.
- Dark CSS is one `[data-ink-theme="dark"]` block declaring exactly the colour tokens of `modes/dark.json`, none `--ink-ref-*`, each value a `var(--ink-ref-*)`.
- Each theme's TypeScript, Swift and Kotlin output declares exactly the colour tokens of its pair, by name, and no other token.
- `ref.color.base.transparent` has the three values from the trial.
- No `$description` string from the three source files appears in any file under `dist/`.

Root `npm test` keeps running `tools/` only; the package tests run through Nx.

## Nx targets

In `packages/tokens/project.json`, each an `nx:run-commands` target with `cwd` `packages/tokens`:

| Target      | Command                | Depends on | Cache inputs and outputs                                                           |
| ----------- | ---------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `build`     | `node build.mjs`       |            | inputs `src/**`, `build.mjs`, `covered-types.mjs`; outputs `{projectRoot}/dist`    |
| `typecheck` | `tsc -p tsconfig.json` | `build`    | inputs `src/**`, `build.mjs`, `covered-types.mjs`, `tsconfig.json`                 |
| `test`      | `vitest run`           | `build`    | inputs `src/**`, `build.mjs`, `covered-types.mjs`, `tests/**`, `vitest.config.mts` |

`typecheck` and `test` read `dist/`, but `dist/` cannot be a cache input: Nx leaves gitignored files out of the hash, so a changed build would still hit a cached pass. Their inputs are what `dist/` is built from instead, so any change that could change `dist/` also misses the cache.

`test` gets its `dependsOn` in task 4, with the build: in task 3 there is no `build` target to depend on, and the tests fail on the missing `dist/`.

Nx infers two things from the package itself, seen in task 1: no `tokens:lint` target, so the CI step's `-t lint` skips the package; and an `nx-release-publish` target, because the package is public. The repository does not use `nx release`, so nothing runs that target, and it is left alone until publishing is decided in slice 3.

## CI

`.github/workflows/checks.yml` gains one step after `npm test`: `npx nx run-many -t lint build typecheck test`. `run-many` rather than `affected`, because one project builds in seconds and `affected` would need the base commit set up in the job.

## Documentation

- **Root `AGENTS.md`:** "Build the tokens" becomes `npx nx run tokens:build`; "Type-check" becomes `npx nx affected -t typecheck`, the first type-check target in the repository; the primitive example in the rules reads `ref.color.cobalt.700` (A0.2). The visual and axe placeholder stays for Stage 1, and no line names `tokens:check`.
- **`docs/stack-and-dependencies.md`:** the `style-dictionary` row reads 5.5.4 (B4). The DTCG entry says the colour roles are in one file per theme. The Style Dictionary entry names the `--ink-` prefix, `[data-ink-theme="dark"]`, the colour-only build, the CSS mode filter, and the gaps still open: six transforms and the typography format. The Terrazzo entry changes with spec 004, when it runs.
- **`packages/tokens/AGENTS.md`:** a first form from the design workspace's `handover/packages/tokens/AGENTS.md`, cut to what is true after this spec: the three source files and `dist/`; `tokens:build`, `tokens:typecheck` and `tokens:test`; the grammar; the pair rule and the colour-only outputs, each beside the build or the test that enforces it; "never edit `dist/` or `src/`: `src/` is exported by the design workspace". The check commands, the lint rules and their common failures join with 004 and 005. `packages/tokens/CLAUDE.md` is `@AGENTS.md`.
- **Changeset:** `@inkhr/tokens` minor, "Add the colour tokens and their CSS, TypeScript, Swift and Kotlin outputs, light and dark."

## Decisions

- **Colour only, across the whole iteration.** The outputs (this spec) and the description rule (spec 004) cover the `color` type and nothing else, both read from `COVERED_TYPES`. The other types build wrong from the built-in groups, and 60 of them have no description yet: a package that ships wrong durations is worse than one that ships none, and a gate that fails from its first day stops meaning anything. Each later slice brings its type's descriptions and transform, and adds the type to the list in the same pull request. Decided on 23 September 2026.
- **Left to spec 004's trial: how the description rule is scoped.** It is not yet known whether Terrazzo 2.7.1's `core/descriptions` accepts an option that limits it to some token types. Spec 004 runs that trial first and records the result in its `design.md`. If the option exists, the rule stays built in and its configuration reads `COVERED_TYPES`. If it does not, the description rule becomes one more rule in the InkHR plugin, reading `COVERED_TYPES`, with a passing and a failing case like the others. Either way, the result is the same: an undescribed colour token fails, and an undescribed duration does not until its slice adds it.
- **Two CSS files, not one.** One file per pair is what Style Dictionary builds without a custom format; whether the package also ships a combined file is decided with the rest of what it carries, in slice 3.
- **No licence yet.** The package is not published in this slice; the licence is written with slice 3, before anything is published. Decided on 23 September 2026.
- **The build is a script, not the Style Dictionary CLI,** because the CLI takes one configuration and the pair rule needs two runs.
- **`PROGRESS.md` lands with the spec,** in the commit before it, so the split is recorded where the next session reads it.
