# 004 Colour tokens check: tasks

Work on the branch `004-colour-tokens-check`. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Every task commit also moves the 004 row in `PROGRESS.md`. When a task finds the spec wrong, the correction is its own `docs(repo)` commit. Open one pull request at the end and merge it with a rebase merge.

The order follows the dependencies: the tool, the failing tests, Terrazzo's rules, the InkHR rules, then the layers that call the check, then the documentation.

## 1. Install Terrazzo

1. `npm install -D -E @terrazzo/cli@2.7.1` at the root.
2. Check: `package.json` and the stack doc both say 2.7.1; `npx tz --version` prints 2.7.1.

Commit: `build(deps): add @terrazzo/cli 2.7.1`

## 2. Write the failing check tests

Depends on task 1.

1. Write `packages/tokens/tests/check.test.mjs` as in "Tests" in `design.md`: the source passes, and every fixture in the trial table gives its rule.
2. Add `check.mjs`, `terrazzo.config.mjs` and `lint/**` to the `test` target's inputs.
3. Check: `npx nx run tokens:test` fails on every new test, because `check.mjs` does not exist; the output tests from spec 003 still pass.

Commit: `test(tokens): add failing tests for the token check`

## 3. Check with Terrazzo's rules

Depends on task 2.

1. Write `packages/tokens/check.mjs` and `packages/tokens/terrazzo.config.mjs` with the Terrazzo rules from "The rules" in `design.md`, and add the `check` target.
2. Check: `npx nx run tokens:check` passes on the source; the fixtures for `core/valid-color`, `parser:init` and `core/consistent-naming` pass their tests; the InkHR fixtures still fail.

Commit: `feat(tokens): check the token source with terrazzo`

## 4. Add the InkHR rules

Depends on task 3.

1. Write `packages/tokens/lint/inkhr-rules.mjs` with the six rules and the grammar, reading `covered-types.mjs`, and turn each rule on as an error in `terrazzo.config.mjs`.
2. Check: `npx nx run tokens:check` passes on the source; `npx nx run tokens:test` passes every fixture.

Commit: `feat(tokens): add the inkhr token rules`

## 5. Run the check before commits and in CI

Depends on task 4. Two commits.

1. Add `"packages/tokens/src/**/*.json": "node packages/tokens/check.mjs"` to `lint-staged` in `package.json`.
2. Check: stage a source file with a raw hex in a role and see `git commit` fail with `core/valid-color`; restore it; a commit touching nothing under `packages/tokens/src/` does not run the check.

Commit: `build(repo): run the token check before commits`

3. Add `check` to the `run-many` step in `.github/workflows/checks.yml`.
4. Check: `npx nx run-many -t lint build typecheck test check` passes locally; after the pull request exists, the job passes there.

Commit: `ci(ci): check the token source on pull requests`

## 6. Write the failing hook tests

1. Write `tools/hooks/after-token-edit.test.mjs`, `before-done.test.mjs` and `session-start.test.mjs` as in "Tests" in `design.md`.
2. Check: `npm test` runs them and they fail, because the scripts do not exist; the commit rule tests still pass.

Commit: `test(repo): add failing tests for the agent hooks`

## 7. Add the agent hooks

Depends on tasks 4 and 6.

1. Write `tools/hooks/after-token-edit.mjs`, `before-done.mjs` and `session-start.mjs`, and add the three hooks to `.claude/settings.json` as in "Where the check runs" in `design.md`.
2. Check: `npm test` passes, and `node tools/hooks/session-start.mjs` prints the `PROGRESS.md` blocks, the git state and the merged pull requests. Then, in the session that adds the hooks:
   - an edit that writes `sys.action.primary.bg.hover` into `modes/light.json` gets `inkhr/naming` back before the next step, and the edit is undone;
   - an edit to a file outside `packages/tokens/src/` runs no check;
   - with a test broken on purpose, finishing is refused once with the failure; the test is restored.
     If the `if` condition does not fire for the source edit, change it to `Edit(**/packages/tokens/src/**)` and repeat, and record which spelling fired in `design.md`.

Commit: `build(repo): check token edits and tests in agent hooks`

## 8. Record the check

Depends on tasks 4, 5 and 7. Two commits.

1. Root `AGENTS.md` and the `@terrazzo/cli` entry of `docs/stack-and-dependencies.md`, as in "Documentation" in `design.md`.
2. Check: every command in the root `AGENTS.md` runs; the stack doc's version table and every entry except `@terrazzo/cli` are unchanged.

Commit: `docs(repo): name the token check and what terrazzo covers`

3. `packages/tokens/AGENTS.md`, as in "Documentation" in `design.md`.
4. Check: under 60 lines; every command runs and every file named exists; every rule names the rule or test that enforces it.

Commit: `docs(tokens): add the check rules to the package agent map`

## 9. Add the changeset

1. `npx changeset --empty`; if it prompts, write the empty changeset by hand, as spec 003 did.
2. Check: `npx changeset status` passes. Set the 004 row in `PROGRESS.md` to `in review`.

Commit: `chore(tokens): add a changeset for the token check`

## 10. Pull request

1. Push the branch and open a pull request that names `specs/004-colour-tokens-check`, lists the "Done when" checks from `requirements.md` with their results, includes the new-session hook checks from task 7, and records the number of human correction rounds.
2. Merge with a rebase merge once every check passes.
