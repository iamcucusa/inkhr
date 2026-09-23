# 003 Colour tokens build: tasks

Work on the branch `003-colour-tokens-build`. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 003 row in `PROGRESS.md`, as that file says. Open one pull request at the end and merge it with a rebase merge.

The order follows the dependencies: the source first, then the tool, then the failing tests, then the build that makes them pass, then what proves and records it.

## 1. Add the package with the colour source

1. Create `packages/tokens/package.json` and `packages/tokens/project.json` as in "The package" in `design.md`, with no targets yet.
2. Copy `tokens/inkhr.tokens.json`, `tokens/modes/light.json` and `tokens/modes/dark.json` from the design workspace to `packages/tokens/src/` with `cp`.
3. Add `packages/tokens/src` to `.prettierignore`.
4. Run `npm install` so `package-lock.json` links the workspace.
5. Check: `npx nx show project tokens` prints the project; `npm pkg get version -w @inkhr/tokens` prints `"0.0.0"`; `shasum -a 256` of the three files matches the table in `design.md`, before and after `git commit`; `npm run format:check` passes.

Commit: `feat(tokens): add the tokens package with the colour source`

## 2. Install Style Dictionary

1. `npm install -D -E style-dictionary@5.5.4` at the root.
2. Set the `style-dictionary` row of `docs/stack-and-dependencies.md` to 5.5.4.
3. Check: `package.json` and the stack doc both say 5.5.4; `npm ls style-dictionary` shows one copy.

Commit: `build(deps): add style-dictionary 5.5.4`

## 3. Write the failing tests

Depends on task 1.

1. Write `packages/tokens/vitest.config.mts` and `packages/tokens/tests/outputs.test.mjs` as in "Tests" in `design.md`.
2. Add the `test` target to `project.json`, without `dependsOn`.
3. Check: `npx nx run tokens:test` runs every test and fails, because `dist/` does not exist. `npm test` still passes.

Commit: `test(tokens): add failing tests for the colour outputs`

## 4. Build the colour outputs

Depends on tasks 2 and 3.

1. Write `packages/tokens/covered-types.mjs` and `packages/tokens/build.mjs` as in "The build" in `design.md`: the pair rule, the filter on `COVERED_TYPES`, the CSS mode filter and `commentStyle: 'none'`.
2. Add the `build` target, and `dependsOn: ["build"]` on `test`.
3. Check: `npx nx run tokens:build` writes the eight files and prints only the expected "filtered out token references" warning for dark CSS; `npx nx run tokens:test` passes; the counts match "Done when" in `requirements.md`. Attach `dist/css/dark.css` and the head of each light file to the pull request as evidence.

Commit: `feat(tokens): build colour outputs for css, ts, swift and kotlin`

## 5. Type-check the built declarations

Depends on task 4.

1. Write `packages/tokens/tsconfig.json` as in "Type-check" in `design.md` and add the `typecheck` target.
2. Check: `npx nx run tokens:typecheck` passes. Append `export const X: number;` twice to `dist/ts/dark.d.ts`, run it again and see `TS2451`; then `npx nx run tokens:build --skip-nx-cache` and see it pass.

Commit: `build(tokens): type-check the built declarations`

## 6. Run the package targets in CI

Depends on tasks 4 and 5.

1. Add the step from "CI" in `design.md` to `.github/workflows/checks.yml`.
2. Check: `npx nx run-many -t lint build typecheck test` passes locally; after the pull request in task 9 exists, the job passes there.

Commit: `ci(ci): build, type-check and test the packages on pull requests`

## 7. Record the commands and the colour build

Depends on tasks 4 and 5. Two commits.

1. Root `AGENTS.md` and `docs/stack-and-dependencies.md`, as in "Documentation" in `design.md`.
2. Check: every command in the root `AGENTS.md` runs; `grep -n "tokens:check" AGENTS.md` finds nothing; the stack doc's version table and every entry except DTCG and Style Dictionary are unchanged.

Commit: `docs(repo): name the token commands and the colour build`

3. `packages/tokens/AGENTS.md` and `packages/tokens/CLAUDE.md`, as in "Documentation" in `design.md`.
4. Check: under 60 lines; every command in it runs and every file it names exists; every rule in it names the build or test that enforces it, or says the workflow carries it.

Commit: `docs(tokens): add the package agent map`

## 8. Add the changeset

1. `npx changeset`, choosing `@inkhr/tokens`, minor, with the summary from "Documentation" in `design.md`.
2. Check: `npx changeset status` lists `@inkhr/tokens`.

Commit: `chore(tokens): add a changeset for the colour outputs`

## 9. Pull request

1. Set the 003 row in `PROGRESS.md` to `in review` in the last task commit.
2. Push the branch and open a pull request that names `specs/003-colour-tokens-build`, lists the "Done when" checks from `requirements.md` with their results, attaches the output evidence from task 4, and records the number of human correction rounds (F).
3. Merge with a rebase merge once every check passes.
