# 001 Nx workspace: tasks

Work on the branch `001-nx-workspace`, named after this spec folder as "Branches and pull requests" in `specs/commit-rules-setup.md` describes. One commit per task, following `specs/commit-rules-setup.md`; stop after each task and propose the commit message for approval. Open one pull request at the end and merge it with a rebase merge.

## 1. Trial the workspace setup (nothing committed)

In a scratch folder outside the repository:

1. Create a workspace with the command in `design.md`, adding `"workspaces": ["packages/*"]` to its `package.json`.
2. Add Angular support and a trial library:
   ```bash
   npm install -D @nx/angular@23.2.1
   npx nx g @nx/angular:library --directory=packages/trial --name=trial \
     --publishable --importPath=@inkhr/trial --prefix=ink --interactive=false
   npx nx build trial
   ```
3. Set up Changesets and check that it sees the library:
   ```bash
   npm install -D @changesets/cli
   npx changeset init
   npx changeset status
   ```
4. Write the result in the "Trial result" section of `design.md`. If the generator refuses the setup or Changesets does not list `@inkhr/trial`, try the alternative in `design.md`, record both, and choose the one where both pass.
5. Delete the scratch folder.

Commit: `docs(repo): record nx workspace setup trial`

## 2. Create the workspace

1. Create the workspace in the repository with the steps in "Creating the workspace" in `design.md`.
2. Check that `package.json` pins exact versions: `nx`, `@nx/js`, `@nx/eslint` and `@nx/eslint-plugin` at 23.2.1, `typescript` at 6.0.3, and `eslint` at the version Nx installed.
3. Make `tsconfig.base.json` strict with an empty `paths` map.
4. Add `.nx/cache` and `.nx/workspace-data` to `.gitignore`.
5. Check that `nx init` wrote no agent, editor or formatter files (`git status`), and commit `package-lock.json`.
6. Check: `npx nx --version`, `npx nx show projects`, `npx nx report`, `npx eslint .`.

Commit: `build(repo): add nx workspace`

## 3. Set up Changesets

1. `npm install -D -E @changesets/cli@3.0.3`.
2. Write `.changeset/config.json` by hand as described in `design.md`; `changeset init` is interactive only in 3.x.
3. Check: `npx changeset status` exits 0. Its warning that `@inkhr/*` matches no package is expected until the first package exists.

Commit: `build(repo): add changesets with fixed versioning`

## 4. Add Prettier

This task has three concerns, so it makes three commits.

1. `npm install -D -E prettier@3.9.7`.
2. Write `.prettierrc` and `.prettierignore` as described in "Formatter" in `design.md`.
3. Change `format` in `.changeset/config.json` from `false` to `"prettier"`.
4. Check: `npx nx format:check --all` runs and lists only the files that are not formatted yet, and `npx changeset status` still exits 0.

Commit: `build(repo): add prettier as the formatter`

5. Run `npx nx format:write --all`. Review the diff, especially the Markdown tables and lists; if a file is damaged, add it to `.prettierignore` and format again.
6. Check: `npx nx format:check --all` and `npx eslint .` pass.

Commit: `style(repo): format existing files with prettier`

7. Add the `format` and `format:check` scripts to `package.json` as described in "Formatter" in `design.md`, without an `nx` field.
8. Check: `npm run format:check` exits 0, and `npx nx show projects` still lists none.

Commit: `build(repo): add format scripts`

## 5. Format automatically

Two concerns, two commits. Follow "Automatic formatting" in `design.md`.

1. Write `tools/format/format-edited-file.mjs` and `.claude/settings.json` with the `PostToolUse` hook.
2. Check: pipe a sample hook input for an unformatted scratch file into the script, and confirm the file is formatted and the script exits 0. Confirm it also exits 0 for a missing path and for a file listed in `.prettierignore`. Then, in a new Claude Code session, edit a file and confirm the hook formats it.

Commit: `build(repo): format agent edits with a claude code hook`

3. `npm install -D -E lint-staged@17.5.1`. Add the `lint-staged` config, the `prepare` script and `engines.node: ">=22.22.1"` to `package.json`, and write `.githooks/pre-commit` (executable).
4. Check: `npm install` sets `git config core.hooksPath` to `.githooks`. In a throwaway repository with the same `package.json`, Prettier config, `.githooks` and `node_modules`, commit an unformatted staged file and confirm the committed file is formatted. Also confirm that a partly staged file keeps its unstaged lines, and that a Prettier syntax error blocks the commit.

Commit: `build(repo): format staged files in a pre-commit hook`

## 6. Add the Claude Code pointer

1. Create `CLAUDE.md` containing exactly `@AGENTS.md` and a newline.
2. Check that no other agent or editor files were added by Nx (`git status`).

Commit: `docs(repo): add claude pointer to agents file`

## 7. Update the agent map and the dependency doc

1. Fill the known commands in the `AGENTS.md` Commands section as listed in `design.md`: split "Lint and type-check" into "Lint" and a "Type-check" placeholder, add the format commands and the line saying formatting is automatic, and keep the token build and the visual and axe commands as placeholders.
2. Update `docs/stack-and-dependencies.md` with the installed versions, as listed in `design.md`.

Commit: `docs(repo): record workspace commands and versions`

## 8. Pull request

1. Push the branch and open a pull request that links this spec and lists the "Done when" checks from `requirements.md` with their results.
2. Merge with a rebase merge once every check passes.
