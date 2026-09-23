# 004 Colour tokens check: design

## The check

`packages/tokens/check.mjs` runs `tz check -c terrazzo.config.mjs <shared> <theme>` once per theme, light then dark, never both theme files together. It reads each run's output, keeps the failure lines and prints them one per line, then exits 1 if either run failed:

```
light  inkhr/naming          sys.button.bg is outside the naming grammar
dark   parser:init           Could not resolve alias {ref.color.cobalt.750}.
```

Terrazzo's own output prints a source excerpt under every error, 3,522 lines for the 424 errors of the first trial run; the one-line form is what a person reads in a hook and what an agent acts on. Terrazzo's own rules do not always name the token (`core/valid-color` prints only "Migrate to the new object format…"), so the runner appends the file and line that the excerpt's `>` marker points at, as in `(modes/light.json:99)`. It runs `tz check --quiet`: without a terminal, Terrazzo prints its warnings in the same form as errors, so a notice such as "string colors will be deprecated" would read as a `parser:init` failure. Every configured rule is an error, so `--quiet` hides only Terrazzo's own notices, which `npx tz check` by hand still shows. `--src <dir>` points the check at another source folder, for the tests. Any other argument, such as the file names `lint-staged` passes, is ignored: a change to one file can break the other pair, so both pairs are always checked.

Everything is in the package:

| File                                   | Content                                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `packages/tokens/check.mjs`            | The runner above                                                       |
| `packages/tokens/terrazzo.config.mjs`  | `defineConfig` from `@terrazzo/cli`, the InkHR plugin and `lint.rules` |
| `packages/tokens/lint/inkhr-rules.mjs` | The InkHR plugin: the six rules and the grammar                        |
| `packages/tokens/tests/check.test.mjs` | The fixtures below, each run through `check.mjs --src`                 |

Only `@terrazzo/cli` is imported, the package the stack doc lists; the plugin is a plain object and needs nothing from `@terrazzo/parser`.

## The rules

Setting `lint.rules` replaces Terrazzo's recommended set instead of adding to it, so the config lists every rule it runs. All are errors.

| Rule                                                        | Checks                                                                           | Tokens              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| The 16 `core/valid-*` rules from Terrazzo's recommended set | Each value has the shape its type requires                                       | all                 |
| `core/required-type`                                        | Every token has a `$type`                                                        | all                 |
| `core/consistent-naming`, `kebab-case`                      | Every segment of a name is kebab-case                                            | all                 |
| `inkhr/descriptions`                                        | A `$description` is present and not empty                                        | the covered types   |
| `inkhr/naming`                                              | The name matches the grammar below                                               | the covered types   |
| `inkhr/references`                                          | A `ref` references nothing; a `sys` that references something references a `ref` | all                 |
| `inkhr/known-type`                                          | `$type` is a DTCG 2025.10 type, `string` or `asset`                              | all                 |
| `inkhr/deprecated-replacement`                              | A `$deprecated` value is a string naming a token in braces                       | all                 |
| `inkhr/theme-parity`                                        | `modes/light.json` and `modes/dark.json` declare the same names                  | the two theme files |

Two failures come from Terrazzo's parser, not from a lint rule, and print as `parser:init`: a reference to a name that does not exist, and a reference to a token of an unknown type. The parser stops that pair's run on them, so its lint rules do not report; the other pair's run still does, which is why an invented type referenced in one theme only fails as `parser:init` there and as `inkhr/known-type` in the other.

- **References** read `originalValue.$value`, which keeps the literal `{…}` alias that `aliasOf` resolves away. Counted on the source: every `sys` token that references anything references a `ref`, and no `ref` references anything, so the rule locks in what is true today.
- **Theme parity** cannot read the token map: loading both theme files in one run silently drops one. The rule finds the theme file among the run's `sources` and reads the other theme file from the same folder.
- **Not used:** `core/descriptions`, which can only skip tokens by id and so cannot be limited to a type; `core/duplicate-values`, which fails 152 times on the source because roles share values by design (in dark, eight roles resolve to `ref.color.cobalt.300`); `core/consistent-naming`'s function form, which receives only the id and so cannot be limited to a type either.

## The grammar

Chosen by the design lead on 23 September 2026 (option A): the board's component-role pattern, plus the neutral families it does not show. It accepts all 129 colour tokens of the source.

| Shape                                         | Closed words                                                                                                                                           | Tokens today |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `ref.color.base.{name}`                       | `white`, `black`, `transparent`                                                                                                                        | 3            |
| `ref.color.{hue}.{step}`                      | hue: `paper`, `ink`, `cobalt`, `moss`, `amber`, `brick`, `teal`, `plum`, `olive`, `violet`, `azure`; step: a number                                    | 66           |
| `sys.{role}[.{variant}].{property}[-{state}]` | role: `action`, `status`, `data`, `signal`, `selected`, `focus`, `avatar`; property: `bg`, `text`, `border`, `icon`, `ring`; state: `hover`, `pressed` | 42           |
| `sys.surface.{variant}`                       | `page`, `default`, `raised`, `sunken`, `inverse`                                                                                                       | 5            |
| `sys.text.{variant}`                          | `primary`, `secondary`, `tertiary`, `disabled`, `link`, `on-selected`, `placeholder`, `inverse`                                                        | 8            |
| `sys.border.{variant}`                        | `default`, `strong`, `subtle`, `focus`                                                                                                                 | 4            |
| `image.treatment.tint`                        | the duotone tint, named as it is: it belongs to the image treatment, not to a role                                                                     | 1            |

- **The component-role pattern is the board's,** with its two closed lists, property and state, and a closed role list, so `sys.button.bg` fails. A component variant (`primary`, `danger`, `success`, `1`) is one kebab-case word or number and not a closed list: a new action variant needs a person's approval of the token, not a rule change. A property word cannot stand as a variant, so `sys.action.bg.text` fails.
- **The neutral families name the painted part first and the variant second** (`sys.text.secondary`). Their variants are closed: they are the neutral axis, small and deliberate, and a new one is a design decision, so it goes into this table and the board together.
- **The board gains the neutral shape** in the design workspace, and its property sentence reads "every component role" instead of "every role"; that change is made there, not by this spec.

## Trial

Run on 23 September 2026 with `@terrazzo/cli` 2.7.1 from the design workspace's `scripts/token-check` harness, the rules and grammar above, and the source as merged in spec 003. A name added to one theme file only also fails `inkhr/theme-parity`, which the fixtures show where it happens.

| Fixture                                            | Result                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| The source, light pair and dark pair               | pass, about 0.6 s each                                                                      |
| A raw hex in a role                                | `core/valid-color`                                                                          |
| A reference to `{ref.color.cobalt.750}`            | `parser:init`                                                                               |
| A primitive given `$type: banana` and referenced   | `parser:init` in light, where it is referenced; `inkhr/known-type` in dark, where it is not |
| A colour role without `$description`               | `inkhr/descriptions`                                                                        |
| A duration without `$description`                  | pass: not a covered type                                                                    |
| A `ref` referencing `{sys.action.primary.bg}`      | `inkhr/references`                                                                          |
| A `sys` role referencing another `sys` role        | `inkhr/references`                                                                          |
| `sys.action.primary.bg.hover` beside the role      | `inkhr/naming`                                                                              |
| `sys.action.primary.hover.bg`                      | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.button.bg`                                    | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.action.primary.background`                    | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.action.primary.bg-active`                     | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.action.bg.text`                               | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.text.background`                              | `inkhr/naming`, `inkhr/theme-parity`                                                        |
| `sys.surface.inverse` deleted from `dark.json`     | `inkhr/theme-parity`                                                                        |
| A token of `$type: banana` that nothing references | `inkhr/known-type`                                                                          |
| `$deprecated: true`                                | `inkhr/deprecated-replacement`                                                              |
| `$deprecated: "Use {sys.action.secondary.bg}."`    | pass                                                                                        |
| A segment in camelCase (`ref.color.cobaltBlue.*`)  | `inkhr/naming`, `core/consistent-naming`                                                    |

The first run, with `core/descriptions` and `core/duplicate-values` on as the plan had them, failed 424 times on the source: 60 undescribed non-colour tokens and 152 duplicate values, each reported for both pairs.

## Where the check runs

| When                                   | What runs                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| An agent edits or writes a source file | `PostToolUse` hook, `tools/hooks/after-token-edit.mjs`: the check, failures on stderr, exit 2        |
| An agent tries to finish               | `Stop` hook, `tools/hooks/before-done.mjs`: `npm test` and `npx nx run-many -t check typecheck test` |
| A session starts                       | `SessionStart` hook, `tools/hooks/session-start.mjs`: the state on stdout                            |
| A person or agent commits              | `.githooks/pre-commit` through `lint-staged`: `packages/tokens/src/**/*.json` runs the check         |
| A pull request                         | CI: `check` joins the `run-many` step                                                                |
| Anyone, by hand                        | `npx nx run tokens:check`                                                                            |

### `.claude/settings.json`

Added next to the existing hooks:

```json
"PostToolUse": [
  { "matcher": "Edit|Write|MultiEdit", "hooks": [ … the format hook … ] },
  {
    "matcher": "Edit|Write|MultiEdit",
    "hooks": [
      {
        "type": "command",
        "if": "Edit(packages/tokens/src/**)",
        "command": "node \"$CLAUDE_PROJECT_DIR/tools/hooks/after-token-edit.mjs\""
      }
    ]
  }
],
"Stop": [
  { "hooks": [ { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/tools/hooks/before-done.mjs\"" } ] }
],
"SessionStart": [
  { "hooks": [ { "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/tools/hooks/session-start.mjs\"" } ] }
]
```

- **The `if` condition** uses permission-rule syntax, and the hooks documentation calls it best-effort. It is spelled with `Edit` although the matcher also catches `Write`, because path rules are consulted in the `Edit(path)` and `Read(path)` forms. How a relative path is anchored is not documented; `Edit(packages/tokens/src/**)` fired in task 7, relative to the project folder, so the `**/` fallback was not needed. Either way the script decides for itself: it reads `tool_input.file_path`, and runs nothing for a file outside `packages/tokens/src/`.
- **Order does not matter.** Claude Code runs the hooks that match one event in parallel, so the format hook and the check are not ordered; the format hook never touches the source, which `.prettierignore` excludes, so the check always sees the file as written.
- **Verified on 23 September 2026 in the session that added the hooks**, which Claude Code applied without a restart: the after-edit hook returned `light  inkhr/naming  sys.action.primary.bg.hover is outside the naming grammar` for a dotted state and nothing for an edit to a spec file, and the Stop hook refused once with the failing `npm test` output for a test broken on purpose.
- **Timeouts:** 60 s for the after-edit check, 300 s for `Stop`, 30 s for `SessionStart`. Measured on 23 September 2026 with the Nx cache warm, the `Stop` hook takes about 14 s, most of it `npm test`, whose hook tests start the token check; it runs at the end of every turn.
- **`Stop` blocks once.** With `stop_hook_active` false and a failure, it exits 2 with the failures on stderr; with `stop_hook_active` true it exits 0. The plan had it refuse until the tests pass, within Claude Code's cap of eight blocks in a row. That conflicts with the loop: the agent commits failing tests on purpose and then stops to propose the next commit, so every stop in that phase would be refused eight times. Blocking once makes sure the agent sees the failures and has to say why it stops on them.
- **`SessionStart`** has no matcher, so it runs on `startup`, `resume`, `clear`, `compact` and `fork`. Claude Code adds plain stdout to the session's context.

### `tools/hooks/session-start.mjs`

Prints, under plain headings:

1. The `## Now` and `## Interrupted work` blocks of `PROGRESS.md`, verbatim.
2. `git log --oneline -10` and `git status --porcelain`.
3. "Merged recently (derived from the pull requests, not typed):" and the output of `gh pr list --state merged --limit 5 --json number,headRefName,mergedAt,title`, one line each. If `gh` fails or is missing, the line says the list is unavailable and the hook still exits 0.

Tried on 23 September 2026 after pull request 4 merged by rebase and its branch was deleted: the query returned it, with its branch name, in about one second. The pull request's `merge_commit_sha` is the last rebased commit on `main`, `2ec615b`.

## Tests

- **`packages/tokens/tests/check.test.mjs`**, run by `tokens:test`: the source passes, and each fixture in the trial table gives the rule named there. A fixture is a copy of `src/` in a temporary folder with one edit, checked with `check.mjs --src`. About 17 runs of 0.6 s.
- **`tools/hooks/*.test.mjs`**, run by `npm test`:
  - `after-token-edit`: a path outside `packages/tokens/src/` exits 0 without running the check; a clean source exits 0; a source with a dotted state exits 2 and names `inkhr/naming` on stderr.
  - `before-done`: with a failing command it exits 2 and prints the failure, and with `stop_hook_active: true` it exits 0; with passing commands it exits 0. The commands are injectable so the test does not run the repository's own.
  - `session-start`: prints the two `PROGRESS.md` blocks from a sample file, and the unavailable line when `gh` is not on the path.

## Nx target

| Target  | Command          | Cache inputs                                                                 |
| ------- | ---------------- | ---------------------------------------------------------------------------- |
| `check` | `node check.mjs` | `src/**`, `check.mjs`, `terrazzo.config.mjs`, `lint/**`, `covered-types.mjs` |

`test` gains `check.mjs`, `terrazzo.config.mjs` and `lint/**` as inputs. CI's step becomes `npx nx run-many -t lint build typecheck test check`.

## Documentation

- **Root `AGENTS.md`:** "Check the tokens: `npx nx run tokens:check`" under "Build the tokens". The Verify step reads: "after each edit under `packages/tokens/src/` the hook runs the token check; before you finish, the Stop hook runs the tests once". Its claim that the hook runs `tsc` goes, since no `tsc` hook exists until Stage 1.
- **`packages/tokens/AGENTS.md`:** the check command; each rule beside the rule name that enforces it, replacing the "not checked yet" line; the common failures from the gate table, one line each: what you did, what the check says, what to do.
- **`docs/stack-and-dependencies.md`**, the `@terrazzo/cli` entry: checks the shared file with one theme file at a time; its format rules, `required-type` and `consistent-naming` run on every token; the InkHR rules run inside it as a local plugin; an unknown reference and an unknown type stop the parser rather than failing a rule; it does not check reference direction, the grammar, theme parity or an unreferenced invented type on its own, which is what the plugin adds.
- **Changeset:** an empty one, since no output changes: `npx changeset --empty` writes it.

## Decisions

- **Option A for the grammar**, over renaming the 17 neutral roles to the component shape (which would change names this slice keeps) or listing them as exceptions (which would leave the board wrong).
- **The grammar is an InkHR rule, not `core/consistent-naming`'s function**, because the function sees only the id and the grammar covers only the colour type this iteration.
- **Descriptions and naming cover the covered types; the four structural rules cover every token.** References, known types, deprecation and parity pass on every token today and have nothing type-specific to wait for, so limiting them to colour would only remove protection.
- **`core/duplicate-values` stays off.** The plan named it a regression guard, but InkHR roles share values on purpose.
- **The runner prints its own one-line format**, because Terrazzo's excerpts are thousands of lines and an agent acts on a rule name and a token.
- **`Stop` blocks once, not until green**, as above.
- **`SessionStart` is in this spec** because it is a hook and it can now be tried against a real rebase-merged pull request.
- **An empty changeset**, because the package gains a check and ships nothing new.
