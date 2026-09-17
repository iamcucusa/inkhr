# 001 Nx workspace: design

## Workspace setup

Nx offers two ways to link projects:

- **TypeScript solution setup:** npm workspaces plus TypeScript project references. The Nx Angular plugin has not supported it: its generators stop with "The @nx/angular plugin doesn't yet support the existing TypeScript setup" (nrwl/nx issues 29570, 29940, 30540), and Angular's compiler does not support project references.
- **Path alias setup:** `tsconfig.base.json` path aliases and a `project.json` per project. The Nx Angular plugin supports it.

Changesets finds packages through the package manager's workspaces. A path alias setup without workspaces gives it nothing to find.

The expected answer is the path alias setup for TypeScript, with an npm `workspaces` field listing `packages/*` so Changesets finds the publishable packages. The trial in `tasks.md` confirms that `@nx/angular` still generates a publishable library in that combination before anything is committed.

### Trial result

Run on 2026-09-17 with Node 24.18.0 and npm 11.16.0, in a scratch folder.

**Attempt A: `create-nx-workspace@23.2.1` with the flags this section first listed** (`--preset=apps --no-workspaces --formatter=none --linter=eslint --aiAgents=none`). Rejected.

- The CLI maps `--preset=apps` to the `nrwl/empty-template` template and ignores most flags. The result was the TypeScript solution setup (`workspaces`, project references, the `@nx/js/typescript` plugin), `nx` and `@nx/js` at 23.2.0 instead of 23.2.1, Prettier, no ESLint, agent files for five tools (`.claude`, `.codex`, `.cursor`, `.gemini`, `.opencode`, `AGENTS.md`, `CLAUDE.md`) and `.github` workflows.
- `nx g @nx/angular:library` stopped with "The "@nx/angular:library" generator doesn't support the existing TypeScript setup".

**Attempt B: `nx init` in an empty folder.** Chosen.

- Start from a `package.json` with `private: true` and `workspaces: ["packages/*"]`, then `npx nx@23.2.1 init --nxCloud=false --aiAgents=none --plugins=skip --interactive=false`. The result is `nx` 23.2.1 and a small `nx.json`, with no agent files, formatter or template content.
- `npm install -D -E @nx/js@23.2.1 @nx/angular@23.2.1 typescript@6.0.3`, then `nx g @nx/angular:library --directory=packages/trial --name=trial --publishable --importPath=@inkhr/trial --prefix=ink`: generated, with a path alias in `tsconfig.base.json` and a `project.json`. The `workspaces` field did not switch Nx to the TypeScript solution setup. Angular installed at 22.1.7.
- `nx build trial`: passed, also with `strict: true` in `tsconfig.base.json`. The library has `build` and `test` targets and no `typecheck` target.
- `@changesets/cli` is now 3.0.3. `changeset init` is interactive only, so `.changeset/config.json` was written by hand. `changeset status` listed `@inkhr/trial -> 0.0.2` from a test changeset.
- Empty workspace (`nx init`, `@nx/js`, `@nx/eslint`, `@nx/eslint-plugin`, `typescript`, a hand-written `eslint.config.mjs`): `nx --version` reports 23.2.1, `nx show projects` lists none, and `nx report`, `eslint .` and `changeset status` exit 0. `changeset status` warns that `fixed: [["@inkhr/*"]]` matches no package until the first one exists.

**Notes for later specs:**
- **What the library generator adds:** Angular dependencies, Vitest, `verdaccio`, a root `project.json` with a `local-registry` target, and a `release` block in `nx.json`. `nx release` is not used, so the spec that adds the first library removes that block and decides on `verdaccio`.
- **`@nx/eslint:init`** installs `eslint` with a `^9.8.0` range (9.39.5 resolved) and writes no root config. The root config Nx writes later imports `@nx/eslint-plugin`, so that package is installed here too.
- **npm 11 install scripts:** npm 11 skips install scripts that `allowScripts` does not cover (`nx`, `esbuild`, `lmdb`, `msgpackr-extract`, `@parcel/watcher`). Builds passed without them.

## Creating the workspace

`nx init` runs in the repository itself, because it adds to an existing folder instead of creating a new one.

1. Add `name`, `private`, `engines` and `workspaces` to a root `package.json`.
2. Run `npx nx@23.2.1 init --nxCloud=false --aiAgents=none --plugins=skip --interactive=false`.
3. Run `npm install -D -E @nx/js@23.2.1 @nx/eslint@23.2.1 @nx/eslint-plugin@23.2.1 typescript@6.0.3`.
4. Run `npx nx g @nx/eslint:init`, then pin `eslint` to the exact version it installed.
5. Write `tsconfig.base.json` and `eslint.config.mjs`.
6. Add `defaultBase` and `analytics` to `nx.json`; `nx init` writes neither.

## Root files after this spec

| File | Content |
|---|---|
| `nx.json` | `defaultBase: "main"`, `analytics: false`, the `targetDefaults` from `nx init`, the `@nx/eslint/plugin` plugin, no Nx Cloud id. |
| `package.json` | `name: "inkhr"`, `private: true`, `engines.node: ">=22"`, `workspaces: ["packages/*"]`, exact versions for `nx`, `@nx/js`, `@nx/eslint`, `@nx/eslint-plugin` (23.2.1), `eslint`, `typescript` 6.0.3 and `@changesets/cli` 3.0.3. |
| `tsconfig.base.json` | `strict: true`, an empty `paths` map that later specs fill. |
| `eslint.config.mjs` | `nx.configs['flat/base']` from `@nx/eslint-plugin`, and ignores for `**/dist` and `**/out-tsc`; no project rules yet. |
| `.changeset/config.json` | Written by hand, because `changeset init` in 3.x is interactive only. It has the `$schema` of `@changesets/config` 4.0.1, `fixed: [["@inkhr/*"]]`, `baseBranch: "main"`, `access: "public"` (scoped packages are private on npm by default; change it if the packages stay private), `commit: false`, `format: false` (no formatter is chosen, and `auto` would pick up any formatter a generator adds), and the 3.x defaults for everything else. |
| `CLAUDE.md` | `@AGENTS.md` |
| `.gitignore` | Adds `.nx/cache` and `.nx/workspace-data`. |

## Changes to existing files

- `AGENTS.md`, Commands section:
  - Install: `npm ci`
  - Lint: `npx nx affected -t lint`
  - Build all packages: `npx nx run-many -t build`
  - Test: `npx nx affected -t test`
  - Add a changeset: `npx changeset`
  - The "Lint and type-check" line splits in two: "Lint" gets the command above, and "Type-check" stays a placeholder. The path alias setup infers no `typecheck` target, so the spec that adds the first project defines one and fills in the command.
  - Build the tokens and the visual and axe checks stay as placeholders until their projects exist.
- `docs/stack-and-dependencies.md`: the "Where each dependency runs" rows for `nx`, `@changesets/cli` and `typescript` show the installed versions; add rows for `@nx/js`, `@nx/eslint` and `@nx/eslint-plugin` next to `nx`, and set the version in the `eslint` row. The `stylelint` row keeps no version until the spec that installs it.

## Decisions this spec does not take

- Formatter: none until one is chosen in `docs/stack-and-dependencies.md`.
- Nx Cloud and remote caching: off.
- Nx's own agent configuration: off; InkHR's agent files are hand-written.
