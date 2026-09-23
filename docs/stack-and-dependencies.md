# Stack decisions and dependency management

The stack of the InkHR package repository, the dependencies it installs or calls, and how they are kept current. A dependency is something the repository installs or calls; packages InkHR builds itself (`@inkhr/*`, the InkHR MCP server) are outputs, and their entries name what they are built on.

Versions were the latest on npm on 2026-09-16, except the ones the repository installs, which are the installed versions. Where no version is shown, none is chosen.

## Decisions without a dependency

- **Styling.** CSS custom properties, with one framework-free stylesheet per component in `@inkhr/styles`. No runtime cost, and other web frameworks get the same look as the Angular components.
- **Mobile.** iOS and Android use the Swift and Kotlin tokens; native component libraries are deferred.

The reasons for every other stack choice are in its dependency entry below.

## Dependency management

- **One pull request per upgrade.** Every dependency change lands as one pull request that passes the seven CI gates. A person merges it.
- **Angular moves as a set.** `@angular/*` (including `@angular/aria`, `@angular/cdk` and `@angular/cli`) and `@angular-devkit/*` move together on the same major and minor. Support is the active Angular release and the previous major in long-term support, starting at 22 and 21.
- **Angular majors go through `ng update`.** A new major is adopted with `ng update` and the migration schematics Angular ships, never by hand. Components use only current Angular APIs (enforced by gate 5), so the schematics meet no legacy patterns. Anything the schematics cannot migrate is fixed in the same pull request.
- **Peer ranges set the pins.** Angular 22 accepts TypeScript `>=6.0 <6.1`, so `typescript` stays on 6.0 although 7 is released. Node is 22.22.1 or later, the floor `lint-staged` 17 sets.
- **DTCG moves by `$schema`.** Each token file names its format version in `$schema`. A newer version is adopted once `style-dictionary` and `@terrazzo/cli` read it: the token files and both tools change in one pull request.
- **Consumers upgrade InkHR the same way.** InkHR's own breaking changes ship as `ng update` migrations, and every package change carries a changeset. Apps read the generated outputs, so a token format change reaches them only when an output is renamed or reshaped.

## Where each dependency runs

| Dependency                                                                                    | Version                 | Runs in                                              | Status                       | Stage        |
| --------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------- | ---------------------------- | ------------ |
| DTCG                                                                                          | 2025.10                 | Token source format                                  | Pinned by `$schema`          | 0            |
| `style-dictionary`                                                                            | 5.5.4                   | Token build                                          | Chosen                       | 0            |
| `@terrazzo/cli`                                                                               | 2.7.1                   | After-edit hook, gate 1                              | Chosen                       | 0            |
| Angular (`@angular/*`)                                                                        | 22.1.6, and 21          | Components, apps                                     | Chosen                       | 0            |
| `typescript`, Node                                                                            | 6.0.3, 22.22.1 or later | Every build; `tsc` in the after-edit hook and gate 5 | Required by Angular 22       | 0            |
| `@angular/aria`                                                                               | 22.1.7                  | Components                                           | Chosen, validated in Stage 1 | 1            |
| `@angular/cdk`                                                                                | 22.1.7                  | Components                                           | Chosen, validated in Stage 1 | 1            |
| `@angular/forms` (Signal Forms)                                                               | 22.1.6                  | Form controls                                        | Proposed                     | 1            |
| Open Sans, Instrument Serif                                                                   |                         | Shipped font files                                   | Chosen, delivery not decided | 0            |
| SVG optimiser and sprite builder                                                              |                         | Icon build                                           | To choose                    | 1            |
| `vitest`, `@vitest/browser-playwright`, `@testing-library/angular`, `@angular/aria` harnesses |                         | Before-done hook, CI                                 | Chosen                       | 1            |
| `@playwright/test`                                                                            |                         | Gate 4                                               | Chosen                       | 1            |
| `axe-core`, `@axe-core/playwright`                                                            |                         | Gate 3                                               | Chosen                       | 1            |
| `angular-eslint`, `strictTemplates`                                                           |                         | Editor, gate 5                                       | Chosen                       | 0            |
| `eslint`                                                                                      | 9.39.5                  | Editor, gate 5                                       | Chosen                       | 0            |
| `stylelint`                                                                                   |                         | Editor, gate 5                                       | Needed, version not chosen   | 0            |
| Bundle size checker                                                                           |                         | Gate 6                                               | To choose                    | Not set      |
| `nx`                                                                                          | 23.2.1                  | Every build and CI run                               | Chosen                       | 2            |
| `@nx/js`                                                                                      | 23.2.1                  | Every build and CI run                               | Chosen                       | 2            |
| `@nx/eslint`                                                                                  | 23.2.1                  | Lint target, gate 5                                  | Chosen                       | 2            |
| `@nx/eslint-plugin`                                                                           | 23.2.1                  | Root ESLint config                                   | Chosen                       | 2            |
| `prettier`                                                                                    | 3.9.7                   | Agent hook, pre-commit hook, `nx format`             | Chosen                       | 0            |
| `lint-staged`                                                                                 | 17.5.1                  | Pre-commit hook                                      | Chosen                       | 0            |
| `@changesets/cli`                                                                             | 3.0.3                   | Gate 7, release                                      | Chosen                       | 2            |
| `@angular-devkit/schematics`                                                                  |                         | `ng add`, `ng generate`, `ng update` in apps         | Chosen                       | 2            |
| `@compodoc/compodoc`                                                                          | 2.0.0                   | Metadata build, gate 7 API diff                      | Chosen                       | 1            |
| `@cngxjs/compodocx`                                                                           | 0.8.0                   | Metadata build                                       | Candidate                    | Later        |
| `@analogjs/platform`, `@analogjs/content`                                                     | 2.7.2                   | Docs site build                                      | Chosen                       | 3            |
| `storybook`, `@storybook/angular-vite`                                                        | 10.6.0                  | Local workbench                                      | Optional                     | Re-evaluated |
| Claude Code                                                                                   |                         | Agent sessions                                       | Chosen                       | 0            |
| `@angular/cli` MCP server, Angular Agent Skills, `best-practices.md`                          |                         | Agent sessions                                       | Chosen                       | 0            |
| MCP SDK                                                                                       |                         | InkHR MCP server                                     | To choose                    | 4            |
| `web-codegen-scorer`                                                                          | 0.0.70                  | Agent baseline                                       | Chosen                       | 0            |
| `adsa-cli`                                                                                    | 0.1.5                   | Gate 7                                               | Chosen                       | 4            |
| Claude Design                                                                                 |                         | Design work                                          | Chosen                       | 3            |
| Higgsfield, GPT Image 2.5                                                                     |                         | Design time only                                     | Chosen                       | Design time  |

## Dependencies

Each entry answers the same questions: **Use** (what it does in InkHR), **Human loop** (what a person sees or approves), **Agent loop** (how an agent runs it or is checked by it), **Why** and **Gaps** (what is still open).

### Tokens

#### DTCG 2025.10

- **Use.** The format of the token files in `packages/tokens/src/`: one file for primitives and theme-independent values, and one file per theme, `modes/light.json` and `modes/dark.json`, for the colour roles and the other roles that change with the theme, under the same names in both. Colours are sRGB component objects with the hex kept; dimensions and durations are `{value, unit}`; images are `asset` tokens.
- **Human loop.** A token change is a JSON diff reviewed in the pull request.
- **Agent loop.** A closed, typed vocabulary: an agent reads token names and `$description`, and an unknown or off-format token fails gate 1.
- **Why.** The first stable W3C format, read by both `style-dictionary` and `@terrazzo/cli`.
- **Gaps.** No type for the spring easing, so it is a `linear()` string with a fallback note.

#### `style-dictionary` 5.5.4

- **Use.** Builds the shared file with one theme file at a time, never both, into `packages/tokens/dist/`: CSS custom properties with the `--ink-` prefix (light under `:root`, dark under `[data-ink-theme="dark"]`), TypeScript, Swift and Kotlin. The dark CSS block holds only the tokens the dark file declares, through a file filter on CSS alone, since Swift and Kotlin have no cascade. Only the types in `packages/tokens/covered-types.mjs` are built, colour today.
- **Human loop.** Outputs are reviewed when a transform changes.
- **Agent loop.** A deterministic build step whose outputs an agent can diff; the generated CSS variables are the names components and `DESIGN.md` use.
- **Why.** Reads the 2025.10 colour and dimension objects and has the widest set of platform outputs, which web, iOS and Android need.
- **Gaps.** The built-in transform groups print the other types wrong, so they join the build with their own slices: six transforms written by InkHR (durations, typography to four properties, native dimensions, native shadows, native cubic beziers, quoting in Kotlin) and one typography format.

#### `@terrazzo/cli` 2.7.1

- **Use.** Lints the token source: off-format values and unknown or reversed references fail. Gate 1.
- **Human loop.** A failed check on the pull request names the token.
- **Agent loop.** Runs in the after-edit hook and in CI, so an agent corrects a broken token before it can ship.
- **Why.** The strictest reader of the 2025.10 format, and independent of the build tool.
- **Gaps.** None known.

### Angular platform

#### Angular (`@angular/*`), from 22 and 21

- **Use.** `@inkhr/angular` holds standalone components on signals with the `ink-` prefix. Upgrade rules are under Dependency management.
- **Human loop.** Product teams use the components directly and upgrade with `ng update`.
- **Agent loop.** Angular's first-party agent material (see `@angular/cli` MCP server) steers agents to current APIs; the research documents weaker model output for Angular than for React, which is why the agent baseline is measured first.
- **Why.** The portfolio is Angular, so components use Angular directly.
- **Gaps.** No time limit is set for adopting a new major after its release.

#### `@angular/aria` 22.1.7

- **Use.** Headless, accessible behaviour for listbox, combobox, menu, tabs, grid and tree.
- **Human loop.** Keyboard maps, ARIA contracts and states in the component specs are checked against it.
- **Agent loop.** Per-pattern test harnesses (for example `@angular/aria/menu/testing`) that agents run in component tests.
- **Why.** First-party, stable in Angular 22, signal-based, zoneless and SSR ready.
- **Gaps.** Not yet validated against the component specs (Stage 1). ng-primitives is the fallback where it falls short, not yet assessed.

#### `@angular/cdk` 22.1.7

- **Use.** Overlays and focus management for dialogs, menus, popovers and toasts.
- **Human loop and agent loop.** Checked against the component specs and covered by the same tests as `@angular/aria`.
- **Why.** First-party, and the base under `@angular/aria`.
- **Gaps.** Not yet validated against the component specs (Stage 1).

#### `@angular/forms` (Signal Forms)

- **Use.** The form controls implement its control interfaces, imported from `@angular/forms/signals`: `FormValueControl` (a `value` model) for `ink-input`, `ink-select`, `ink-textarea` and `ink-date-field`; `FormCheckboxControl` (a `checked` model) for checkboxes and switches.
- **Human loop.** Teams bind the same control with `[formField]` in a signal form, `formControlName` in a reactive form or `ngModel` in a template-driven form, with no adapter.
- **Agent loop.** Agents write Signal Forms for new forms, as Angular's best practices say, and never need a second control implementation or a `ControlValueAccessor`.
- **Why.** Stable in Angular 22; one implementation per control serves all three form systems.
- **Gaps.** In Angular 21 Signal Forms was experimental and the bridge to reactive and template-driven forms arrived in 21.2; the component specs must say whether the form controls support 21.

### Assets

#### Open Sans and Instrument Serif

- **Use.** Font files shipped with the components: Open Sans in three weights everywhere; Instrument Serif for one italic display phrase on welcome, onboarding and empty surfaces. Without them the interface falls back to Segoe UI or Georgia.
- **Human loop and agent loop.** Read only through the `sys.type.*` roles, never by family name.
- **Why.** Part of the InkHR direction; the serif is kept away from work surfaces.
- **Gaps.** Self-hosting through `@inkhr/styles` is the proposed default, because loading from Google Fonts sends each visitor's IP address to Google, which a German court ruled unlawful without consent in 2022. Still open: the source of the files (repository or npm font package), their pinned version, and the owner of the SIL Open Font License note.

#### SVG optimiser and sprite builder

- **Use.** Turn the SVG sources in `packages/icons` into the sprite and CSS classes of `@inkhr/icons`.
- **Agent loop.** The generated class names are a closed set, read like token names.
- **Why.** A sprite with classes works for Angular and for frameworks that use `@inkhr/styles`.
- **Gaps.** Neither tool is chosen.

### Quality gates

#### `vitest`, `@vitest/browser-playwright`, `@testing-library/angular`, `@angular/aria` harnesses

- **Use.** Unit and interaction tests per component in a real browser.
- **Human loop.** Tests are written first and reviewed with the spec.
- **Agent loop.** The before-done hook: an agent cannot finish until the tests pass, and failing tests are committed before the code.
- **Why.** Vitest is Angular's default runner, Testing Library tests what a person does, and the harnesses come with `@angular/aria`.
- **Gaps.** None known.

#### `@playwright/test`

- **Use.** Visual regression screenshots per state and theme (gate 4), and the keyboard, zoom and reflow scripts.
- **Human loop.** Screenshot diffs are reviewed in the pull request.
- **Agent loop.** Screenshots are the evidence an agent attaches when it reports a change as done.
- **Why.** Scriptable and cross-browser, and already the browser behind Vitest.
- **Gaps.** No hosted diff service is chosen; the research names Argos and Chromatic.

#### `axe-core`, `@axe-core/playwright`

- **Use.** Zero violations per component example in both themes, plus the reduced-motion and reflow checks. Gate 3.
- **Human loop.** The manual screen reader pass covers what axe cannot.
- **Agent loop.** The agent runs axe until it is clean and attaches the result before opening the pull request. Gate 2, InkHR's own contrast check, computes every text role against its surfaces from the tokens in both themes.
- **Why.** The standard automated WCAG engine.
- **Gaps.** None known.

#### `angular-eslint`, `strictTemplates`

- **Use.** Gate 5 with `tsc`: no NgModule, `ngClass` or `HostBinding`, and typed templates.
- **Human loop.** Errors show in the editor and on the pull request.
- **Agent loop.** `tsc` runs in the after-edit hook, so legacy Angular an agent writes fails at once.
- **Why.** Models emit outdated Angular, and deterministic rules catch it where written instructions do not.
- **Gaps.** None known.

#### `eslint` and `stylelint`

- **Use.** The engines under `@inkhr/eslint-plugin` and `@inkhr/stylelint-plugin`, which ship `no-raw-color`, `no-primitive-token`, `no-deprecated-token`, `no-deleted-token`, `prefer-component`, `button-size-touch`, `no-signal-fill` and `no-literal-radius`. Stylelint also measures token coverage against a 95 percent target.
- **Human loop.** Deprecated tokens warn for six months, with an autofix, before they are deleted.
- **Agent loop.** A raw or unknown value is the same lint error for an agent as for a person, and `lint_snippet` on the InkHR MCP server applies the same rules.
- **Why.** The standard linters for TypeScript, templates and CSS; `angular-eslint` already runs on ESLint.
- **Gaps.** The `stylelint` version is not chosen.

#### `prettier`

- **Use.** The formatter for every file type in the repository: TypeScript, Angular templates, CSS, JSON and Markdown. `nx format` runs it, Changesets formats changelogs with it, and `npm run format` and `npm run format:check` are the entry points.
- **Human loop.** Nobody formats by hand: a pre-commit hook formats the staged files, so a diff never mixes formatting with the change.
- **Agent loop.** A Claude Code hook formats every file an agent edits, right after the edit, so an agent never has to remember the formatter.
- **Why.** The default for Angular and Nx, and the one every generator and Changesets already support. oxfmt is faster but newer, and less proven on Angular templates and CSS.
- **Gaps.** No CI format check yet; it comes with the gates. Editor format-on-save is a personal setting.

#### `lint-staged`

- **Use.** The pre-commit hook runs it, and it formats only the staged content with `prettier --write --ignore-unknown`, then stages the result.
- **Human loop.** A partly staged file keeps its unstaged lines, so staging part of a file still works.
- **Agent loop.** An agent's commit is formatted even when the Claude Code hook did not run, for example after a file was written by a command.
- **Why.** The standard tool for the job, and the only one that formats staged content without touching the working tree.
- **Gaps.** It needs Node 22.22.1 or later, which sets the repository's Node floor.

#### Bundle size checker

- **Use.** Gate 6: a gzip limit per component, tree-shaken.
- **Gaps.** Not chosen; no stage set.

### Repository and release

#### `nx`

- **Use.** The monorepo: packages, apps, caching, and builds and tests limited to what a change affects.
- **Human loop.** Pull requests only wait for the packages they touch.
- **Agent loop.** Generators create packages and components in the standard shape instead of hand-written files.
- **Why.** Angular-aware generators, affected-only runs and caching.
- **Gaps.** None known.

#### `@changesets/cli`

- **Use.** `changeset` writes a pull request's release intent into `.changeset/`; `changeset version` bumps all packages together and writes changelogs and upgrade notes; `changeset publish` publishes `@inkhr/*` to npm. Gate 7 fails a package change without a changeset.
- **Human loop.** A person writes or reviews the release intent. Patches weekly, minors monthly, at most two majors a year.
- **Agent loop.** An agent adds the changeset file with its change.
- **Why.** Written release intent, and fixed versioning so an app pins one InkHR version.
- **Gaps.** None known.

#### `@angular-devkit/schematics`

- **Use.** Builds the `ng add`, `ng generate` and `ng update` schematics shipped with `@inkhr/*`. A breaking change without an `ng update` migration does not ship.
- **Human loop.** Setup and upgrades are one command in an app.
- **Agent loop.** Schematics are the reviewable actions an agent runs for setup and upgrades.
- **Why.** Angular's own schematics engine, so an app upgrades Angular and InkHR the same way.
- **Gaps.** None known.

### Docs and metadata

#### `@compodoc/compodoc` 2.0.0

- **Use.** Emits `components.json`, the API description behind the docs API tables, component pages, `llms.txt`, the InkHR MCP server and the API-diff check in gate 7.
- **Human loop.** API tables on the docs site; API changes show in the diff check.
- **Agent loop.** `get_component` on the InkHR MCP server answers from `components.json`.
- **Why.** Reliable for standalone components and signal inputs. `ngx-component-meta`, the research's first choice, is not published on npm.
- **Gaps.** Recheck `ngx-component-meta` before Stage 1. `@cngxjs/compodocx` 0.8.0 is a candidate once it matures.

#### `@analogjs/platform` and `@analogjs/content` 2.7.2

- **Use.** The docs site in `apps/docs`: a Markdown page per component with live examples, API tables and when-to-use, plus `llms.txt` and `llms-full.txt`.
- **Human loop.** The first place people read.
- **Agent loop.** `llms.txt` to find a page, `llms-full.txt` when context allows, and the same Markdown the MCP server serves.
- **Why.** Angular's own Vite meta-framework, and Markdown in the repository is easier for agents to find than Storybook.
- **Gaps.** The research found little evidence on what such a site costs to maintain at scale.

#### `storybook` and `@storybook/angular-vite` 10.6.0

- **Use.** An optional local workbench in `apps/workbench`; not part of the gates or the docs.
- **Why optional.** The Angular Vite builder is young with open Vitest bugs, the webpack builder is legacy, and the Storybook MCP server was React-only in March 2026. Re-evaluated when its Angular Vitest path is stable.
- **Gaps.** No owner or date for the re-evaluation.

### Agents

#### Claude Code

- **Use.** The coding agent the harness is built for: root `AGENTS.md` imported by `CLAUDE.md`, the InkHR skill, a reviewer subagent, hooks, `.mcp.json`, `specs/` and `PROGRESS.md`.
- **Human loop.** A person approves each spec and merges each pull request; a new component needs at most two correction rounds.
- **Agent loop.** Spec, plan, tests first, implement, verify with evidence, pull request. One agent does the work; subagents only review or run bulk audits.
- **Why.** The agent the baseline is measured with, and its hooks enforce the must-not-happen rules.
- **Gaps.** None known.

#### `@angular/cli` MCP server, Angular Agent Skills, `best-practices.md`

- **Use.** Listed in `.mcp.json` next to the InkHR MCP server; gives agents current Angular practice and workspace tasks.
- **Agent loop.** Replaces outdated Angular knowledge in the model with the current rules.
- **Why.** First-party.
- **Gaps.** The research labels the MCP server experimental, so its tools may change between releases.

#### MCP SDK

- **Use.** The base of the InkHR MCP server in `packages/mcp-server`, with the tools `list_components`, `get_component`, `get_tokens`, `get_pattern`, `lint_snippet` and `render_preview`.
- **Agent loop.** Agents query components, tokens and patterns instead of reading pasted docs, and `lint_snippet` applies the CI rules.
- **Why.** MCP servers are the most common agent surface among current design systems in the research survey.
- **Gaps.** Not chosen; `@modelcontextprotocol/sdk` is the reference implementation.

#### `web-codegen-scorer` 0.0.70

- **Use.** Scores Claude Code on InkHR components with the Angular skills and CLI MCP server. Below 80 of 100, or with NgModule or zone.js in the output, a plan to close the gap comes before scaling.
- **Human loop.** A person reads the score and decides whether to scale.
- **Why.** Angular's own code-generation scorer; no public per-model Angular ranking exists.
- **Gaps.** Below 1.0, so it needs an exact pin and a recheck date.

#### `adsa-cli` 0.1.5

- **Use.** Scores the docs for agent-readiness out of 45; from Stage 4 the score may not drop in gate 7.
- **Why.** The one open rubric for agent-ready design systems.
- **Gaps.** Below 1.0 with a small community, so it needs an exact pin and a recheck date.

### Design time

#### Claude Design

- **Use.** Screen design on top of the repository, set up from the token files, the generated CSS and `components.json`, with `DESIGN.md` as the guide.
- **Human loop.** Designers build and review screens with InkHR values; values flow from the repository to the tool, never back.
- **Agent loop.** `DESIGN.md` holds the prompt guide and the closed set of token names. A feature's `specs/NNN-feature/design.md` names the tokens and components it reuses, and the names must resolve before the spec is approved.
- **Why.** Design and code read one source.
- **Gaps.** Stage 3 tests whether it builds the leave request screen with InkHR values; if not, `DESIGN.md` gains a generated values section.

#### Higgsfield and GPT Image 2.5

- **Use.** Generate the ink textures and portraits once, at design time; the files ship as `asset` tokens and nothing is called at runtime. One credit per image at medium quality.
- **Human loop.** Every asset is checked against the art direction.
- **Why.** Real ink cannot be drawn by code, and InkHR never draws ink in code.
- **Gaps.** None known.
