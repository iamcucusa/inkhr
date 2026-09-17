# Dependency management: how agents use the dependency rules

Hand-over for the code sessions in this repository. It turns `docs/stack-and-dependencies.md` into something agents follow because the tooling enforces it, not because they read it. Work through the steps in order, one commit per step; dependency changes use the `deps` scope from `specs/commit-rules-setup.md`.

Why this exists: a dependency list that is only read drifts from `package.json`, and an agent that meets an unchosen tool picks the obvious one. The two failures to prevent are agents adding packages nobody chose, and the doc drifting away from what is installed.

## Already in this folder

- `AGENTS.md` carries the pointer from step 1.
- `GAPS.md` carries the reference from step 2.
- `docs/stack-and-dependencies.md` holds the rules and the table every step below reads.

## Rule for the doc itself

The checks in steps 3 and 4 read the "Where each dependency runs" table in `docs/stack-and-dependencies.md`, so the table follows one rule: one backticked package name per cell, and product names (Claude Code, Claude Design) never in backticks. The test row groups four packages in one cell; either split it into one row per package or make the script split backticked names within a cell.

## Steps

Start with steps 1, 3 and 4. They are cheap and catch both failures.

### Step 1. `AGENTS.md`: one line, not a copy

The root map gets one pointer: "Before adding, removing or upgrading a package, read `docs/stack-and-dependencies.md`." `AGENTS.md` stays short, and an agent still knows where the rules are.

### Step 2. `GAPS.md`: unchosen tools mean stop and ask

`GAPS.md` refers to every row marked "To choose" in the table (today the MCP SDK, the bundle size checker, the SVG tools and the font source) without copying the list. An agent then stops and asks instead of picking one, for example installing `@modelcontextprotocol/sdk` because it looks like the obvious choice.

### Step 3. Pre-install hook: only listed packages

A Claude Code hook runs before `npm install`, `ng add` or any edit to `package.json`, and fails when the package is not in the "Where each dependency runs" table. A new dependency then needs its entry written in the same pull request, and a person approves it.

### Step 4. CI check: the table and `package.json` stay in step

A small script reads the backticked package names and versions from the table and compares them with `package.json` in both directions:

- every installed package is listed,
- every listed package is installed,
- pinned versions match, including `typescript` 6.0 and the exact pins for tools below 1.0.

It follows the same pattern as the check that every token name in `DESIGN.md` exists, and runs in gate 7.

### Step 5. Hooks match the "Runs in" column

The after-edit hook runs exactly what the table marks as after-edit (`tsc` and Terrazzo), and the before-done hook runs the tests. The column then describes what the hooks run, and never lists a check that nothing runs.

### Step 6. InkHR skill: an upgrade procedure

A rule file in the InkHR skill turns the "Dependency management" section into steps, with an incorrect and a correct example:

- Incorrect: bumping `@angular/core` by hand in `package.json`.
- Correct: `ng update @angular/core @angular/cli`, all `@angular/*` packages together, in one pull request, then run the gates.

### Step 7. Reviewer subagent: a dependency checklist

When a pull request touches `package.json` or the lockfile, the reviewer checks:

- one upgrade per pull request,
- the Angular packages moved together,
- the new versions fit Angular's accepted ranges,
- the entry in `docs/stack-and-dependencies.md` was updated.

### Step 8. `specs/NNN-feature/design.md`: dependencies are named

A feature that needs a new package names it in its design file. Like token and component names, the package must exist in `docs/stack-and-dependencies.md` before the spec is approved.

### Step 9. `llms.txt`: one link

The `llms.txt` the docs build generates in `apps/docs` links `docs/stack-and-dependencies.md`, so agents working from the docs site find it too. Add the link to the index template the build uses, not to a generated file.
