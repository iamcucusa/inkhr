# @inkhr/tokens

The DTCG source of the InkHR tokens and the outputs built from it. The root map is `../../AGENTS.md`; this file adds what token work needs. It covers the colour tokens; each other group joins when its slice lands.

## Files

- `src/inkhr.tokens.json`: the primitives (`ref.*`) and every role that does not change with the theme.
- `src/modes/light.json` and `src/modes/dark.json`: the roles that change with the theme, the same names in both.
- `covered-types.mjs`: the token types the package covers, `color` today.
- `build.mjs`: the Style Dictionary build.
- `dist/`: generated, and ignored by git: `css/`, `ts/`, `swift/` and `kotlin/`, one file per theme.

`src/` is exported by the design workspace and copied here; nothing in it is written by hand. `dist/` is built. Edit neither: a hand edit to `src/` is lost at the next export, and one to `dist/` at the next build.

## Commands

- Build the outputs: `npx nx run tokens:build`
- Type-check the built declarations: `npx nx run tokens:typecheck`
- Test the outputs: `npx nx run tokens:test`

`typecheck` and `test` build first. Nx caches all three by the files `dist/` is built from, so after a hand edit to `dist/` add `--skip-nx-cache`.

## The grammar

- `ref.color.{ramp}.{step}` is a primitive, the only place a colour value is written. Ramps: `base` (`white`, `black`, `transparent`), `paper` and `ink` (one neutral axis), `cobalt`, `moss`, `amber` and `brick`, and the data hues `teal`, `plum`, `olive`, `violet` and `azure` with only the steps a theme reads.
- A `sys.*` name is a role and always a reference to one `ref` primitive: `sys.action.primary.bg`, `sys.text.secondary`, `sys.surface.page`. A state is a hyphen on the last word: `bg-hover`, `bg-pressed`; the word is `pressed`, never `active`. Selected, disabled and focus are roles of their own: `sys.selected.bg`, `sys.text.disabled`, `sys.focus.ring`.
- Data colours are theme roles, `sys.data.1.bg` to `sys.data.6.bg`. One colour role sits outside `sys`: `image.treatment.tint`, the duotone tint.
- Every colour token carries a `$description` that says what it paints and what it never paints.
- The full grammar and its word lists are the Naming rules board in the design workspace.

## Rules, each with what enforces it

- A build takes `inkhr.tokens.json` with one theme file, never both theme files together: the second silently overrides the first on every shared name (`build.mjs`).
- The outputs carry only the types in `covered-types.mjs`; a type joins in the same pull request as its descriptions and its transform (`tokens:test`).
- The dark CSS block declares only the dark file's tokens, each a `var()` reference to a primitive; Swift and Kotlin carry every colour token of the pair (`tokens:test`).
- No description reaches an output; the source is its only home (`tokens:test`).
- The grammar above, the description on every colour token and the one-way references are not checked yet; the workflow carries them until gate 1 lands.
- A role that is not in the files is not missing by accident. Read `../../GAPS.md`, then ask before adding one.

## Common failures

- `tokens:test` fails on the tokens a file declares: a filter in `build.mjs` changed, so an output gained or lost tokens; the test names the platform and theme. Put the filter back, or change `covered-types.mjs` if a type is meant to join.
- `tokens:test` fails on a description: a comment style other than `none` reached a format; set `commentStyle: 'none'` on that file.
- Style Dictionary warns "filtered out token references were found" for `dark.css`, and "Unknown CSS Font Shorthand properties found for 11 tokens" once per theme. Both are expected; any other warning is not.

## Where to look next

- `../../DESIGN.md`: what each role is for and the recipe a component reads.
- `../../GAPS.md`: before adding a role.
- `../../specs/003-colour-tokens-build/`: why the build is shaped as it is.
