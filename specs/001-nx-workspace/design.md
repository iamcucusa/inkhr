# 001 Nx workspace: design

## Workspace setup

Nx offers two ways to link projects:

- **TypeScript solution setup:** npm workspaces plus TypeScript project references. The Nx Angular plugin has not supported it: its generators stop with "The @nx/angular plugin doesn't yet support the existing TypeScript setup" (nrwl/nx issues 29570, 29940, 30540), and Angular's compiler does not support project references.
- **Path alias setup:** `tsconfig.base.json` path aliases and a `project.json` per project, created with `--preset=apps --no-workspaces`. The Nx Angular plugin supports it.

Changesets finds packages through the package manager's workspaces. A path alias setup without workspaces gives it nothing to find.

The expected answer is the path alias setup for TypeScript, with an npm `workspaces` field listing `packages/*` so Changesets finds the publishable packages. The trial in `tasks.md` confirms that `@nx/angular` still generates a publishable library in that combination before anything is committed.

### Trial result

To be filled in by the session that runs task 1: the Nx and Angular versions tried, the commands, whether `@nx/angular:library` generated and built a publishable library, whether `changeset status` listed it, and the setup chosen.

## Creating the workspace

`create-nx-workspace` creates a new folder, and this repository already has files, so the workspace is created in a scratch folder and its files are copied in.

```bash
npx create-nx-workspace@23.2.1 inkhr \
  --preset=apps --no-workspaces \
  --packageManager=npm --formatter=none --linter=eslint \
  --nxCloud=skip --aiAgents=none --analytics=false \
  --defaultBase=main --skipGit --skipGitHubPush --interactive=false
```

Copy into the repository: `nx.json`, `package.json`, `package-lock.json`, `tsconfig.base.json`, `eslint.config.mjs` (or the flat config file Nx writes) and any `.gitignore` entries it adds. Do not copy a `README.md`, editor folders or agent files. Then run `npm install` in the repository to confirm the lock file.

If the trial selects a different setup, change only the setup flags and record why.

## Root files after this spec

| File | Content |
|---|---|
| `nx.json` | Default base `main`, the `@nx/eslint` plugin, no Nx Cloud id, analytics off. |
| `package.json` | `private: true`, `engines.node: ">=22"`, `workspaces: ["packages/*"]` if the trial confirms it, exact versions for `nx`, `@nx/js`, `@nx/eslint`, `eslint`, `typescript` 6.0.x and `@changesets/cli`. |
| `tsconfig.base.json` | `strict: true`, an empty `paths` map that later specs fill. |
| `eslint.config.mjs` | The Nx flat config base; no project rules yet. |
| `.changeset/config.json` | `fixed: [["@inkhr/*"]]`, `baseBranch: "main"`, `access: "public"` (scoped packages are private on npm by default; change it if the packages stay private), `commit: false`. |
| `.changeset/README.md` | Written by `changeset init`. |
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
- `docs/stack-and-dependencies.md`: the "Where each dependency runs" rows for `nx`, `@changesets/cli` and `typescript` show the installed versions; add rows for `@nx/js` and `@nx/eslint` next to `nx`, and set the version in the `eslint` row. The `stylelint` row keeps no version until the spec that installs it.

## Decisions this spec does not take

- Formatter: none until one is chosen in `docs/stack-and-dependencies.md`.
- Nx Cloud and remote caching: off.
- Nx's own agent configuration: off; InkHR's agent files are hand-written.
