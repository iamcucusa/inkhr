# 001 Nx workspace: tasks

Work on a branch, for example `chore/nx-workspace`. One commit per task, following `specs/commit-rules-setup.md`; stop after each task and propose the commit message for approval. Open one pull request at the end and merge it with a rebase merge.

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

1. Create the workspace in a scratch folder with the chosen setup and copy the files listed in `design.md` into the repository.
2. Pin exact versions in `package.json`: `nx`, `@nx/js` and `@nx/eslint` at 23.2.1, `typescript` at the newest 6.0.x, and `eslint` at the version Nx installed.
3. Add `private: true` and `engines.node: ">=22"`, and the `workspaces` field if the trial confirmed it.
4. Make `tsconfig.base.json` strict with an empty `paths` map.
5. Add `.nx/cache` and `.nx/workspace-data` to `.gitignore`.
6. Run `npm install` and commit `package-lock.json`.
7. Check: `npx nx --version`, `npx nx show projects`, `npx nx report`, `npx eslint .`.

Commit: `build(repo): add nx workspace`

## 3. Set up Changesets

1. `npm install -D -E @changesets/cli` and `npx changeset init`.
2. Set `.changeset/config.json` as described in `design.md`.
3. Check: `npx changeset status`.

Commit: `build(repo): add changesets with fixed versioning`

## 4. Add the Claude Code pointer

1. Create `CLAUDE.md` containing exactly `@AGENTS.md` and a newline.
2. Check that no other agent or editor files were added by Nx (`git status`).

Commit: `docs(repo): add claude pointer to agents file`

## 5. Update the agent map and the dependency doc

1. Fill the known commands in the `AGENTS.md` Commands section as listed in `design.md`: split "Lint and type-check" into "Lint" and a "Type-check" placeholder, and keep the token build and the visual and axe commands as placeholders.
2. Update `docs/stack-and-dependencies.md` with the installed versions, as listed in `design.md`.

Commit: `docs(repo): record workspace commands and versions`

## 6. Pull request

1. Push the branch and open a pull request that links this spec and lists the "Done when" checks from `requirements.md` with their results.
2. Merge with a rebase merge once every check passes.
