# InkHR

Design system packages for the HR portfolio: DTCG tokens, framework-free styles and Angular components with the `ink-` prefix. This is the map; detail lives in the files it links.

## Commands

A bracket is a placeholder until the project it needs exists; replace it with the exact command.

- Install: `npm ci`
- Build all packages: `npx nx run-many -t build`
- Build the tokens: `npx nx run tokens:build`
- Check the tokens: `npx nx run tokens:check`
- Check the names in the docs: `npm run check:names`
- Lint: `npx nx affected -t lint`
- Type-check: `npx nx affected -t typecheck`
- Test: `npx nx affected -t test`; the repository tools: `npm test`
- Visual and axe checks: [e2e command]
- Format: `npm run format`; check formatting: `npm run format:check`
- Add a changeset: `npx changeset`

Formatting is automatic: a Claude Code hook formats every file an agent edits, and a pre-commit hook formats staged files. Run the format commands only to check or to fix a file by hand.

## Read first

- `DESIGN.md` for design work: roles, component recipes, do's and don'ts.
- `docs/commit-guide.md` before committing: message format, branch names, disclosure. Hooks reject what breaks it, and you propose each message for approval.
- `docs/stack-and-dependencies.md` before adding, removing or upgrading a package.
- `GAPS.md` for what InkHR does not have. If a component, token or tool is not there, stop and ask.
- `components.json` or the InkHR MCP server for a component API; the token files for values.
- `PROGRESS.md` for the current phase, status and next action.
- The `AGENTS.md` of a package before working in it.

## How work runs

1. A person approves the spec in `specs/NNN-feature/`. Names it uses must exist in the token files, `components.json` and `docs/stack-and-dependencies.md`.
2. Plan, then commit failing tests.
3. Implement with InkHR components and token roles only.
4. Verify: after each edit under `packages/tokens/src/` the hook runs the token check; before you finish, the Stop hook runs the tests once, and they must pass or you say why not. Attach axe results and screenshots as evidence.
5. Add a changeset, open a pull request, and let the reviewer subagent check accessibility and the API contract. A person merges.

One agent does the work. Subagents only review or run bulk audits.

## Definition of done

A pull request is done when all seven CI gates pass. People and agents pass the same gates.

1. Token check
2. Contrast
3. Axe per component example
4. Visual regression
5. Angular lint and types
6. Bundle budget
7. Changeset, API diff and docs

## Rules

- Read tokens by role (`sys.text.secondary`). Never write a hex, px radius or shadow, and never read a primitive such as `ref.color.cobalt.700`. Enforced by `ink/no-raw-color`, `ink/no-primitive-token` and `no-literal-radius` (gate 5).
- Components are standalone and on signals. No NgModule, `ngClass` or `HostBinding`. Enforced by angular-eslint and `tsc` (after-edit hook, gate 5).
- Upgrade Angular only with `ng update`, all `@angular/*` packages together, in one pull request. Checked by the reviewer subagent.
- Every package change carries a changeset. A breaking change ships with an `ng update` migration. Enforced by gate 7.
- A new package gets its own `AGENTS.md` and a one-line `CLAUDE.md` containing `@AGENTS.md`. No check yet.
- Never edit the generated outputs in `packages/tokens` (CSS, TypeScript, Swift, Kotlin). Change the DTCG source and rebuild. No check yet.

## Common failures

- `ink/no-raw-color` or `ink/no-primitive-token`: replace the value with the `sys.*` role `DESIGN.md` names for it.
- Unknown token or component name: check the token files and `components.json`; if it is not there, check `GAPS.md` and ask.
- NgModule or zone.js code in the output: rewrite as a standalone component on signals.
- Contrast gate fails after a token change: the new value misses 4.5:1 for text or 3:1 for boundaries in one theme; fix the value, not the check.
- Changeset gate fails: run `npx changeset` and describe the change for consumers.
- Package not in `docs/stack-and-dependencies.md`: do not install it; propose the entry and ask.
