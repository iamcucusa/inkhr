# 002 Commit rules: requirements

## Goal

Make the commit and branch rules binding: a bad commit message, branch name or disclosure slip is blocked before it exists, for people and for agents, and again in CI for clones where the local layers never ran.

## Context

- The rules and the enforcement plan come from `specs/commit-rules-setup.md`, which this spec replaces and deletes.
- 001 left the pieces this spec builds on: `.claude/settings.json`, `.githooks/pre-commit` with `lint-staged`, the `prepare` script, `tools/` for hook scripts and `npm run format:check`.
- `main` is protected: changes land through pull requests with rebase merges, and the owner merges.
- The repository is public. Commit messages, branch names and pull request text are permanent and cannot be unpublished.

## Requirements

1. One checker decides whether a commit message is valid, and one decides whether a branch name is valid. Every layer calls them, so all layers give the same verdict.
2. The checkers are covered by tests that run in the repository.
3. The disclosure check needs no upkeep for ordinary cases: generic hiring and portfolio vocabulary is committed and matched with its plural and possessive forms, and only proper nouns live in the private list.
4. The private list is created automatically, is never committed, and its absence weakens the check without breaking it.
5. A Claude Code session in this repository adds no attribution trailer, is told why a bad commit message is refused before git runs, and cannot bypass the hooks.
6. Git hooks reject a bad message at commit time and bad messages or branch names at push time. They are switched on by `npm install`.
7. Pull request CI re-checks every commit in the pull request, the branch name and the formatting, and does not print any disclosure term it matched.
8. The rules a person or agent must follow are stated once, in `docs/commit-guide.md`, with a short pointer from `AGENTS.md`.
9. `specs/commit-rules-setup.md` is deleted, and everything that referred to it points at the guide or this spec.

## Out of scope

- The seven CI gates, and any check that needs a project under `packages/` or `apps/`: the affected lint, test and type-check steps join `pre-commit` and CI with the spec that creates the first project.
- GitHub settings: rulesets, required status checks and merge methods (`specs/github-setup.md`). This spec produces the check CI exposes; a person makes it required.
- `CONTRIBUTING.md` and code owners (`specs/github-setup.md`).

## Done when

- `npm test` passes, covering every rule in both checkers.
- A commit whose message has a bad type or scope, a subject over 72 characters, an uppercase letter after the colon, a trailing period, a three-line body or any trailer is rejected, and the message names the broken rule.
- A commit message containing a term from the committed patterns, in singular or plural, or a name from the private list, is rejected.
- `git commit --no-verify` and `git push --no-verify` are refused when an agent tries them.
- A Claude Code commit in this repository has no attribution lines.
- Pushing a branch named `claude/some-work` or `Feature_X` is rejected; `002-commit-rules` and `fix/tokens-dark-contrast` pass.
- After a fresh clone and `npm install`, `git config core.hooksPath` prints `.githooks` and `.disclosure-terms.local` exists.
- `.disclosure-terms.local` is absent from `git ls-files`, and a disclosure failure names the commit and the rule, never the term.
- A pull request containing a commit that breaks a rule fails CI; the job log does not show the term.
- `specs/commit-rules-setup.md` is gone and no file refers to it.
- The work is merged into `main` through a pull request whose commits follow the rules it adds.
