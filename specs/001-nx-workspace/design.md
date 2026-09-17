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

## Formatter

Prettier is the formatter, chosen on 2026-09-17.

- **Why Prettier:** it is the default for Angular and Nx. `nx format` and the Nx generators use it, it formats TypeScript, Angular templates, CSS, JSON and Markdown, and Changesets 3 can format changelogs with it. oxfmt is faster, but it is newer and less proven on Angular templates and CSS.
- **Version:** `prettier` 3.9.7, installed with `npm install -D -E`.
- **`.prettierrc`:** `{ "singleQuote": true }`, the Nx default. Other options stay at Prettier's defaults.
- **`.prettierignore`:** `/dist`, `/coverage`, `/.nx/cache`, `/.nx/workspace-data` and `package-lock.json`.
- **Changesets:** `.changeset/config.json` changes from `format: false` to `format: "prettier"`. It was `false` only because no formatter was chosen, and `auto` would have picked up whichever formatter appeared first.
- **ESLint:** `flat/base` has no formatting rules, so no `eslint-config-prettier` is needed. The spec that adds `angular-eslint` checks this again.
- **Commands:** `npx nx format:write` formats and `npx nx format:check` checks. Both work without projects. Without flags they cover only the files changed against `defaultBase` (`main`), including uncommitted ones; `--all` covers the whole repository.
- **Existing files:** with the settings above, Prettier reformats Markdown tables and lists in `DESIGN.md`, `docs/stack-and-dependencies.md`, `specs/` and `eslint.config.mjs`. That goes in its own `style` commit after the setup commit, so the setup diff stays readable. Review the Markdown diff, and add a file to `.prettierignore` if formatting damages it.

### Automatic formatting

Nobody has to remember to format: agents' edits are formatted as they happen, and every commit is formatted before it is created.

- **Agent edits:** a Claude Code `PostToolUse` hook in the committed `.claude/settings.json`, matching `Edit|Write|MultiEdit`, runs `node "$CLAUDE_PROJECT_DIR/tools/format/format-edited-file.mjs"`. The script:
  - reads the hook input from stdin and takes `tool_input.file_path`;
  - skips a path that is missing, outside the project or deleted;
  - runs the local `prettier --write --ignore-unknown` on that file, which also respects `.prettierignore`;
  - always exits 0, printing any error on stderr, so a formatting failure never blocks an edit.

  Project hooks also apply to subagents.
- **Commits:** `lint-staged` 17.5.1 (`npm install -D -E`), chosen on 2026-09-17 because it formats only the staged content and stages it again, so partly staged files stay correct.
  - `package.json` has `"lint-staged": { "*": "prettier --write --ignore-unknown" }`.
  - `.githooks/pre-commit` (executable) runs `npx lint-staged`.
  - A `prepare` script, `git rev-parse --git-dir > /dev/null 2>&1 && git config core.hooksPath .githooks || true`, switches the hooks on at every `npm install`. The guard keeps `npm ci` working outside a git checkout.
  - `lint-staged` 17 needs Node 22.22.1 or later, so `engines.node` becomes `">=22.22.1"`.
- **Shared with 002:** `specs/commit-rules-setup.md` adds its own entries to these same files: the attribution setting and commit hooks in `.claude/settings.json`, the commit-message check in `.githooks/`, and the same `prepare` script. It extends them instead of replacing them.
- **Not yet:** a CI format check, `npx nx format:check --all`, waits for the CI workflows. Editor format-on-save is a personal setting and is not configured.

## Root files after this spec

| File | Content |
|---|---|
| `nx.json` | `defaultBase: "main"`, `analytics: false`, the `targetDefaults` from `nx init`, the `@nx/eslint/plugin` plugin, no Nx Cloud id. |
| `package.json` | `name: "inkhr"`, `private: true`, `engines.node: ">=22.22.1"`, `workspaces: ["packages/*"]`, the `prepare` script and `lint-staged` config from "Automatic formatting", exact versions for `nx`, `@nx/js`, `@nx/eslint`, `@nx/eslint-plugin` (23.2.1), `eslint`, `typescript` 6.0.3, `@changesets/cli` 3.0.3, `prettier` 3.9.7 and `lint-staged` 17.5.1. |
| `tsconfig.base.json` | `strict: true`, an empty `paths` map that later specs fill. |
| `eslint.config.mjs` | `nx.configs['flat/base']` from `@nx/eslint-plugin`, and ignores for `**/dist` and `**/out-tsc`; no project rules yet. |
| `.changeset/config.json` | Written by hand, because `changeset init` in 3.x is interactive only. It has the `$schema` of `@changesets/config` 4.0.1, `fixed: [["@inkhr/*"]]`, `baseBranch: "main"`, `access: "public"` (scoped packages are private on npm by default; change it if the packages stay private), `commit: false`, `format: "prettier"` (set to `false` in task 3 and changed in task 4; see "Formatter"), and the 3.x defaults for everything else. |
| `.prettierrc`, `.prettierignore` | As described in "Formatter". |
| `.claude/settings.json`, `tools/format/format-edited-file.mjs` | The agent formatting hook from "Automatic formatting". |
| `.githooks/pre-commit` | Runs `npx lint-staged`. |
| `CLAUDE.md` | `@AGENTS.md` |
| `.gitignore` | Adds `.nx/cache`, `.nx/workspace-data` and `.nx/migrate-runs` (the last is written by `nx init`). |

## Changes to existing files

- `AGENTS.md`, Commands section:
  - Install: `npm ci`
  - Lint: `npx nx affected -t lint`
  - Build all packages: `npx nx run-many -t build`
  - Test: `npx nx affected -t test`
  - Add a changeset: `npx changeset`
  - Format changed files: `npx nx format:write`; check them: `npx nx format:check`; whole repository: add `--all`
  - The "Lint and type-check" line splits in two: "Lint" gets the command above, and "Type-check" stays a placeholder. The path alias setup infers no `typecheck` target, so the spec that adds the first project defines one and fills in the command.
  - Build the tokens and the visual and axe checks stay as placeholders until their projects exist.
- `docs/stack-and-dependencies.md`: the "Where each dependency runs" rows for `nx`, `@changesets/cli` and `typescript` show the installed versions; add rows for `@nx/js`, `@nx/eslint` and `@nx/eslint-plugin` next to `nx`, and set the version in the `eslint` row. The `stylelint` row keeps no version until the spec that installs it. Add a `prettier` row (3.9.7, runs in the agent hook, the pre-commit hook and `nx format`, Chosen, stage 0) and a `lint-staged` row (17.5.1, pre-commit hook, Chosen, stage 0), with entries under "Quality gates" giving the reasons from "Formatter". The Node version in the `typescript`, Node row becomes 22.22.1 or later.
- `AGENTS.md`: one line saying that formatting is automatic (agent hook and pre-commit hook), so agents do not run the formatter by hand.

## Decisions this spec does not take

- Nx Cloud and remote caching: off.
- Nx's own agent configuration: off; InkHR's agent files are hand-written.
