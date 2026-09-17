# 002 Commit rules: tasks

Work on the branch `002-commit-rules`. One commit per task unless a task says otherwise; stop after each task and propose the commit message for approval. Open one pull request at the end and merge it with a rebase merge.

The order follows the dependencies: the checkers first, then the layers that call them, then the documentation, then CI, then the clean-up.

## 1. Write the checkers

Vitest fails a run with no test files, so the runner and the first tests land together.

1. `npm install -D -E vitest@5.0.1`, write `vitest.config.mts` and add the `test` script, as listed in `design.md`.
2. Write `rules.mjs`, `check-message.mjs`, `check-branch.mjs` and `check-range.mjs` from "The rules" in `design.md`, with the disclosure part left out.
3. Write their tests: one passing and one failing case per rule, including the pass-through cases.
4. Check: `npm test` passes. `check-message.mjs` exits 1 on a message with a bad type, an over-long header, an uppercase letter after the colon, a trailing period, a three-line body or a trailer, and 0 on a good one. `check-branch.mjs` exits 1 on `claude/some-work` and `Feature_X`, and 0 on `002-commit-rules` and `main`.

Commit: `build(repo): add commit message and branch checkers`

## 2. Add the disclosure check

Depends on task 1.

1. Write `disclosure-patterns.mjs`, `disclosure.mjs`, `.disclosure-terms.example` and `init-local.mjs`, and call the check from both checkers.
2. Extend the `prepare` script with `init-local.mjs`.
3. Write the tests: a generic term, its plural and its possessive fail; the same word inside a code span passes; a name from a private list fails; a missing list gives a notice and no failure; the failure output contains the rule and not the matched text.
4. Check: `npm test` passes; `npm install` creates `.disclosure-terms.local` and a second `npm install` does not overwrite it; `git status` does not show that file.

Commit: `build(repo): add the disclosure check to the checkers`

## 3. Wire the agent layer

Depends on task 1.

1. Add the `attribution` setting, the `permissions.deny` rules and the `PreToolUse` hook to `.claude/settings.json`, next to the formatting hook, and write `claude-pre-commit.mjs`.
2. Check: piping a sample hook input for `git commit -m "Bad: Message."` gives exit 2 and names the rules; a good message gives exit 0; a command whose message cannot be extracted gives exit 0. In a session, `git commit --no-verify` is refused and a Claude Code commit carries no trailer.

Commit: `build(repo): check agent commits before git runs`

## 4. Wire the git hooks

Depends on tasks 1 and 2.

1. Write `.githooks/commit-msg` and `.githooks/pre-push` (both executable), as listed in `design.md`.
2. Check, in a throwaway repository with the same `package.json`, `tools/` and `node_modules`: a bad message is rejected at commit time and a good one passes; `pre-push` rejects a branch named `claude/x` and a commit made with `--no-verify` before the hooks were on.

Commit: `build(repo): reject bad messages and branches in git hooks`

## 5. Write the guide and the agent pointer

Depends on task 1, because the guide states the rules the checkers enforce.

1. Write `docs/commit-guide.md` from "The rules" in `design.md`, with five right and wrong message examples and one example of splitting a mixed change into two commits.
2. Add the `## Commits` section to `AGENTS.md` and `npm test` to its Commands list.
3. Check: every rule in the guide is one the checkers enforce, or is named as one the workflow carries.

Commit: `docs(repo): add the commit guide and agent pointer`

## 6. Add the CI check

Depends on tasks 1, 2 and 4.

1. Write `.github/workflows/checks.yml` as described in "CI" in `design.md`.
2. Check, after the pull request in task 8 exists: the job passes on this branch, and a scratch commit that breaks a rule makes it fail with the rule named and no term in the log. Remove the scratch commit afterwards.
3. Tell the maintainer to add the job as a required status check in the `main` ruleset; that setting belongs to `specs/github-setup.md`.

Commit: `ci(repo): check commits, branch and formatting on pull requests`

## 7. Retire the hand-over

Depends on tasks 1 to 6.

1. Delete `specs/commit-rules-setup.md`.
2. Point every reference to it at `docs/commit-guide.md` for the rules and `specs/002-commit-rules/` for the enforcement: `specs/001-nx-workspace/requirements.md`, `design.md` and `tasks.md`, `specs/dependency-management-setup.md`, `specs/github-setup.md`.
3. Check: `grep -rn commit-rules-setup . --exclude-dir=node_modules --exclude-dir=.git` finds only the two lines of this task.

Commit: `docs(repo): replace the commit rules hand-over with the guide`

## 8. Pull request

1. Push the branch and open a pull request that names `specs/002-commit-rules` and lists the "Done when" checks from `requirements.md` with their results.
2. Merge with a rebase merge once every check passes.
