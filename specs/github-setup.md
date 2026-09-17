# GitHub setup: how contributors work in this repository

Hand-over for the session that creates the GitHub repository. Nothing here is implemented yet. Work through the steps in order, one commit per step, following `specs/commit-rules-setup.md` from the first commit. That spec already covers the `main` ruleset for pull requests, linear history and blocked force pushes, rebase-only merges, the commit-message check, the disclosure secret and `CONTRIBUTING.md`; this spec adds what those leave out and does not repeat them.

Why this exists: InkHR is built by a central team, product-area champions and agents. Local hooks and `.claude/` settings only reach some of them. What GitHub enforces reaches everyone, so reviews, gates, releases and security live there.

## Governance this setup follows

- A funded central team owns tokens, components, tooling, releases and docs. One design and one engineering champion per product area contribute. A monthly council decides on breaking changes, new components and the roadmap, and records decisions as ADRs.
- Decision rights: the central team decides new tokens and theme values; the council decides new components and breaking changes; product teams decide product-level components built with InkHR. Nobody grants an accessibility exception.
- Every proposal gets a triage answer within 5 working days: adopt, extend, product-level, or decline with a reason.
- Releases: patches weekly on Tuesday, minors monthly, at most two majors a year. A deprecation warns for six months and a deletion needs an `ng update` migration.

## Steps

### Step 1. Code owners

Create `.github/CODEOWNERS`. Team names are placeholders until the teams exist on GitHub.

```
*                                   @[org]/inkhr-core
/packages/tokens/                   @[org]/inkhr-core
/DESIGN.md                          @[org]/inkhr-core
/GAPS.md                            @[org]/inkhr-core
/docs/stack-and-dependencies.md     @[org]/inkhr-core
/docs/decisions/                    @[org]/inkhr-core
/AGENTS.md                          @[org]/inkhr-core
/.claude/                           @[org]/inkhr-core
/.github/                           @[org]/inkhr-core
/packages/angular/                  @[org]/inkhr-core @[org]/inkhr-champions
/packages/styles/                   @[org]/inkhr-core @[org]/inkhr-champions
/apps/docs/                         @[org]/inkhr-core @[org]/inkhr-champions
```

### Step 2. Review and gate rules on `main`

Extend the ruleset from `specs/commit-rules-setup.md`:

- At least one approving review, and review from code owners.
- Approvals are dismissed when new commits are pushed.
- All review conversations resolved before merging.
- The seven CI gates are required status checks: token check, contrast, axe per component example, visual regression, Angular lint and types, bundle budget, and changeset with API diff and docs.

### Step 3. Merge queue

Turn on the merge queue for `main` with the rebase merge method. It runs the required gates against the latest `main` before each merge, so two pull requests that pass separately cannot break `main` together. Make the gate workflows run on the `merge_group` event as well as `pull_request`.

### Step 4. Issue forms and labels

- `.github/ISSUE_TEMPLATE/proposal.yml`: use case, affected products, sketch, and whether it touches `GAPS.md`. Applies the `rfc` and `triage` labels.
- `.github/ISSUE_TEMPLATE/bug.yml`: package, version, steps to reproduce, expected and actual result.
- `.github/ISSUE_TEMPLATE/accessibility.yml`: component, theme, assistive technology, WCAG criterion, severity. Critical issues block minor releases.
- `.github/ISSUE_TEMPLATE/config.yml`: blank issues off, a link to the docs site.
- Labels: `rfc`, `triage`, `adopt`, `extend`, `product-level`, `declined`, `a11y-critical`, `breaking`, `dependencies`, and one `pkg:` label per package (`pkg:tokens`, `pkg:styles`, `pkg:angular`, and so on).

### Step 5. Pull request template

`.github/pull_request_template.md` asks for:

- The spec it implements (`specs/NNN-feature/`), or why none is needed.
- The changeset, or why the change needs none.
- Evidence: axe results and screenshots in light and dark.
- Breaking change: yes or no, and the `ng update` migration if yes.
- New dependency: yes or no, and its entry in `docs/stack-and-dependencies.md` if yes.

### Step 6. Decision records

Create `docs/decisions/` for ADRs, one file per decision, numbered, merged through pull requests. `AGENTS.md` and `DESIGN.md` link it where a rule comes from a decision.

### Step 7. Releases

- A release workflow uses the Changesets GitHub Action: it keeps a "Version packages" pull request open, and merging it publishes the packages.
- Publish to npm with trusted publishing (GitHub OIDC), so the repository holds no long-lived npm token and packages carry provenance.
- The publish job runs in a protected `release` environment that needs approval from `inkhr-core`.
- Each release creates a git tag and a GitHub release with the changelog.

### Step 8. Security

- Turn on secret scanning with push protection, Dependabot alerts and private vulnerability reporting.
- Add `SECURITY.md` with how to report a vulnerability.
- Set the default workflow token to read-only and grant write permissions per job.
- Pin third-party actions to a commit SHA.
- Require approval before workflows run on pull requests from forks.

### Step 9. Agents as contributors

- Agent pull requests go through the same ruleset, code owners and gates as people's.
- Agents open pull requests as drafts; a person marks them ready once the reviewer subagent's findings are resolved.
- Copilot, Codex and other agents do not read `.claude/`, so every must-happen rule is a required check on GitHub, not only a local hook.

## Done when

- A pull request without a code owner's approval cannot be merged.
- A pull request with a failing gate cannot be merged, and every gate also runs in the merge queue.
- Pushing a new commit dismisses earlier approvals.
- New issues can only be opened through the forms, and a proposal arrives labelled `rfc` and `triage`.
- A new pull request shows the template.
- Merging the "Version packages" pull request publishes to npm only after approval in the `release` environment, with no npm token stored in the repository, and the packages show provenance.
- A test push containing a secret is blocked.
- A workflow run from a fork waits for approval.

## Open points for that session

- Public or private repository. If public, choose a licence and add `CODE_OF_CONDUCT.md`.
- Dependency update bot: Renovate or Dependabot, grouping all `@angular/*` packages into one pull request. Add the choice to `docs/stack-and-dependencies.md`.
- Hosted visual diff service, which decides how contributors approve new screenshot baselines.
- The GitHub organisation and team names in `CODEOWNERS`.
