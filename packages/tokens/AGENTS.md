# @inkhr/tokens

The DTCG source of the InkHR tokens and the outputs built from it. The root map is `../../AGENTS.md`; this file adds what token work needs. It covers the colour tokens; each other group joins when its slice lands.

## Files

- `src/inkhr.tokens.json`: the primitives (`ref.*`) and every role that does not change with the theme. `src/modes/light.json` and `src/modes/dark.json`: the roles that change with the theme, the same names in both.
- `covered-types.mjs`: the token types the package covers, `color` today. The build and the description and naming rules read it.
- `build.mjs`: the Style Dictionary build. `dist/`: its output, ignored by git: `css/`, `ts/`, `swift/` and `kotlin/`, one file per theme.
- `check.mjs`, `terrazzo.config.mjs` and `lint/inkhr-rules.mjs`: gate 1, Terrazzo with the InkHR rules as a local plugin.

`src/` is exported by the design workspace and copied here; nothing in it is written by hand, and a hand edit is lost at the next export. `dist/` is built; do not edit it.

## Commands

- Build the outputs: `npx nx run tokens:build`
- Check the source: `npx nx run tokens:check`
- Type-check the built declarations: `npx nx run tokens:typecheck`
- Test the outputs and the check: `npx nx run tokens:test`

The check also runs after an agent edits `src/`, before a commit that stages `src/`, and in CI. Nx caches by the input files, so after a hand edit to `dist/` add `--skip-nx-cache`.

## The grammar

`inkhr/naming` enforces it for the covered types; every word list is closed. The source is `specs/004-colour-tokens-check/design.md`.

- `ref.color.base.{white|black|transparent}`; `ref.color.{hue}.{step}`, hue one of `paper`, `ink`, `cobalt`, `moss`, `amber`, `brick`, `teal`, `plum`, `olive`, `violet`, `azure`.
- `sys.{role}[.{variant}].{property}[-{state}]`: role `action`, `status`, `data`, `signal`, `selected`, `focus`, `avatar`; property `bg`, `text`, `border`, `icon`, `ring`; state `hover`, `pressed`. `sys.action.primary.bg-hover`, `sys.data.1.bg`.
- `sys.surface.{page|default|raised|sunken|inverse}`, `sys.text.{primary|secondary|tertiary|disabled|link|on-selected|placeholder|inverse}`, `sys.border.{default|strong|strong-hover|subtle|focus}`. A neutral name takes a state only where `NEUTRAL_STATES` in the lint lists one: `strong-hover` today.
- `image.treatment.tint`, the duotone tint, the one colour token outside `sys`.

## Rules, each with what enforces it

- A check or a build takes `inkhr.tokens.json` with one theme file, never both: the second silently overrides the first (`check.mjs`, `build.mjs`).
- A colour value is written only in a `ref.color` primitive; every other colour token holds one reference to it in braces (`inkhr/role-reference`). A colour inside a composite value, such as a shadow layer, is not checked.
- `ref` references nothing, and `sys` references only `ref` (`inkhr/references`); every reference resolves (`parser:init`).
- Every covered token has a `$description` saying what it paints and what it never paints (`inkhr/descriptions`).
- Every `$type` is a DTCG type, `string` or `asset` (`inkhr/known-type`); a `$deprecated` token names its replacement in braces (`inkhr/deprecated-replacement`).
- Both theme files declare the same names (`inkhr/theme-parity`).
- The outputs carry only the covered types, the dark CSS block only the dark file's tokens as `var()` references, and no description (`tokens:test`).
- Every token name and CSS variable the docs mention exists; a line that shows wrong names on purpose ends in `<!-- name-check: skip -->` (`npm run check:names`).
- A role that is not in the files is not missing by accident. Read `../../GAPS.md`, then ask before adding one.

## Common failures

- `inkhr/naming` on `sys.action.primary.bg.hover`: a state is a hyphen, `sys.action.primary.bg-hover`. On `sys.button.bg` or `…background`: the role or word is not in the lists; ask, do not invent. <!-- name-check: skip -->
- `inkhr/references` on a `ref`: turn it round, the role references the primitive. On a `sys` pointing at a `sys`: point it at the primitive that role uses.
- `parser:init` "Could not resolve alias": the step does not exist; choose one the ramp has.
- `inkhr/role-reference`: a hex or colour object in a role; replace it with a reference to the primitive in braces.
- `core/valid-color` with a file and line: a hex string in a primitive; write it as a colour object.
- `inkhr/theme-parity`: add the role to the other theme file under the same name, with that theme's primitive.
- `inkhr/descriptions`: write the sentence; do not copy the name into it.
- Style Dictionary warns "filtered out token references were found" for `dark.css`, and "Unknown CSS Font Shorthand properties found for 11 tokens" once per theme. Both are expected; any other warning is not.

## Where to look next

- `../../DESIGN.md`: what each role is for. `../../GAPS.md`: before adding a role.
- `../../specs/003-colour-tokens-build/`, `../../specs/004-colour-tokens-check/`, `../../specs/006-colour-role-references/`, `../../specs/007-field-hover-role/` and `../../specs/008-dark-boundary-step/`: why the build, the check and the values are shaped as they are.
