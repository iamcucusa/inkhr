# 001 Nx workspace: requirements

## Goal

Turn this repository into an Nx workspace that later specs add projects to. This spec creates the workspace only: no packages, no apps, no Angular dependencies.

## Context

- The repository is `iamcucusa/inkhr`. `main` is protected: changes land through pull requests with rebase merges, and the owner merges without a second approval.
- The monorepo layout, the stack and the dependency rules are in `AGENTS.md`, `docs/stack-and-dependencies.md` and `specs/dependency-management-setup.md`. Commit rules are in `specs/commit-rules-setup.md`.
- Projects go under `packages/` (publishable `@inkhr/*` packages) and `apps/` (the docs site and the optional workbench). They are created by the spec of the stage that needs them.

## Requirements

1. The repository root is an Nx workspace on `nx` 23.2.1, with `main` as the default base.
2. The workspace setup lets a later spec generate a publishable Angular 22 library with `@nx/angular` under `packages/`, and lets `@changesets/cli` find that library as a package. Which setup does both is decided by the trial in `tasks.md` and recorded in `design.md`.
3. Node 22.22.1 or later is required and declared in `package.json` `engines`. npm is the package manager, and `package-lock.json` is committed.
4. `typescript` is pinned to an exact 6.0.x version, because Angular 22 accepts only `>=6.0 <6.1`. The base TypeScript config is strict.
5. ESLint runs from one root flat config through `@nx/eslint`. `angular-eslint` is added by the first spec that adds Angular code.
6. Changesets is set up with fixed versioning for every `@inkhr/*` package and `main` as the base branch. `nx release` is not used.
7. Nothing the stack doc marks as not chosen is added: no Nx Cloud or remote cache, no dependency update bot.
8. Nx writes no agent files of its own. The root `CLAUDE.md` contains exactly `@AGENTS.md`.
9. `AGENTS.md` lists the real workspace-level commands; commands for projects that do not exist yet stay as placeholders.
10. `docs/stack-and-dependencies.md` records the versions this spec installs.
11. Nx local cache and workspace data folders are ignored by git.
12. No analytics are sent.
13. Prettier is the formatter, pinned to an exact version with one root config. `nx format` runs it, Changesets formats with it, and the existing files are formatted in their own commit.
14. Formatting runs automatically. A Claude Code hook formats every file an agent edits, and a git pre-commit hook formats the staged files with `lint-staged`. `npm install` switches the git hooks on.

## Out of scope

- Any project under `packages/` or `apps/`, and the Angular, Style Dictionary, Terrazzo, Vitest or Playwright dependencies.
- CI workflows and the seven gates, including a CI format check.
- Editor format-on-save settings.
- Commit-message hooks and the other Claude Code hooks (`specs/commit-rules-setup.md`). This spec adds only the formatting hooks.
- GitHub settings beyond what exists (`specs/github-setup.md`).

## Done when

- `npx nx --version` reports 23.2.1 and `npx nx show projects` runs without error and lists no projects.
- `npx nx report` runs without error.
- `npx eslint .` runs without error on the empty workspace.
- `npx changeset status` runs without error.
- `npx nx format:check --all` runs without error, and `.changeset/config.json` has `format: "prettier"`.
- An agent's edit that leaves a file unformatted is formatted by the hook right after the edit.
- After `npm install`, `git config core.hooksPath` prints `.githooks`, and committing an unformatted staged file produces a formatted commit.
- The trial result and the chosen setup are written in `design.md`.
- `CLAUDE.md` is exactly `@AGENTS.md` plus a newline, and no other agent or editor files from Nx are committed.
- `docs/stack-and-dependencies.md` shows the installed versions of `nx`, `@nx/js`, `@nx/eslint`, `@nx/eslint-plugin`, `eslint`, `typescript`, `@changesets/cli`, `prettier` and `lint-staged`.
- The work is merged into `main` through a pull request whose commits follow `specs/commit-rules-setup.md`.
