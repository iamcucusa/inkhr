# 006 Colour role references: requirements

## Goal

Make gate 1 enforce the first rule of the Naming rules board, "a role holds a reference, never a value", for every form a value can take. Today the check catches a hex string only through a format rule, and passes a well-formed colour object in a role. After this spec, a colour role that holds anything other than a `{…}` reference fails under one InkHR rule that names the token, and the rule file names that rule as the one that catches rule 1.

## Context

- Found on 24 September 2026 against `origin/main` at `8d99829` and reproduced on a copy of the source: `sys.action.primary.bg` in `modes/light.json` set to `{ "colorSpace": "srgb", "components": [0.1725, 0.2784, 0.8431], "hex": "#2C47D7" }` passes `node packages/tokens/check.mjs` with exit 0. The same role set to `"#2C47D7"` fails only under `core/valid-color` ("Migrate to the new object format…"), a format rule that the object form satisfies.
- `inkhr/references` reads only a value that is a `{…}` alias, so a role holding no reference is never seen by it. Spec 004 wrote the rule as "a `sys` token that references something references a `ref`"; nothing requires a `sys` token to reference anything.
- Three places state the rule and name `core/valid-color` or `inkhr/references` as its check: row 1 of `.claude/skills/inkhr/rules/tokens.md`, the rules line and a common failure in `packages/tokens/AGENTS.md`, and the Gaps of the `@terrazzo/cli` entry in `docs/stack-and-dependencies.md`. The rule file's test runs row 1's incorrect form against the check it names; it passes today only because the row shows a hex string.
- On the source today, every token of a covered type outside `ref` holds a `{…}` reference: 59 `sys` colour roles and `image.treatment.tint` in each theme file. Outside the covered types, the 11 `sys.type.*` typography roles hold composite values whose fields are references, so a rule over every `sys` token would fail on the source.
- A colour can also sit inside a composite value, such as a shadow layer's `color`. The eight `ref.elevation.*` primitives hold raw colour objects there, and no rule reads the colour of a composite.

## Requirements

1. The check fails when a token of a covered type outside `ref` holds a `$value` that is not exactly one `{…}` reference, whatever the value's shape: a hex string, a colour object, a JSON Pointer `$ref`, or anything else.
2. The failure prints under its own InkHR rule, `inkhr/role-reference`, as one line naming the theme, the rule and the token, and says what to do.
3. The rule reads the covered types from `packages/tokens/covered-types.mjs`, so it grows with the other rules when a slice adds a type.
4. `packages/tokens/tests/check.test.mjs` has a fixture for a colour object in a role, keeps the hex string fixture with both rules it now fails, and has fixtures for a JSON Pointer reference in a role and a colour value in `image.treatment.tint`. The source passes.
5. Row 1 of the rule file names `inkhr/role-reference` as the check that catches it, with one row for the hex string and one for the colour object, and its test runs both.
6. `packages/tokens/AGENTS.md` and the `@terrazzo/cli` entry of the stack doc name the rule, and the package map states the composite limit.
7. The package change carries a changeset.

## Out of scope

- A colour inside a composite value (a shadow layer, a border, a gradient stop): the known limit above. It becomes a question when a slice adds `shadow`, `border` or `gradient` to the covered types, and that slice decides whether a primitive's composite may hold a raw colour.
- Tokens of types that are not covered, including the typography roles, which hold composites of references by design.
- Spec 004's rule and trial tables: they record what spec 004 decided and ran, and stay as merged (see "Decisions" in `design.md`).
- The contrast gate (colour slice 2) and any other token group.

## Done when

- `npx nx run tokens:check` passes on both pairs of the source.
- On a copy of the source, the colour object from "Context" in `sys.action.primary.bg` fails the light pair under `inkhr/role-reference`, naming the token.
- Every fixture in the trial table in `design.md` gives the rules named there in `npx nx run tokens:test`, and the new and changed fixtures failed in the commit that added them.
- Every row of the rule file passes its test, both rows of rule 1 under `inkhr/role-reference`.
- `npm test`, `npm run check:names` and `npx nx run-many -t lint build typecheck test check` pass locally and in CI.
- `packages/tokens/AGENTS.md` stays under 60 lines, and every command it names runs.
- `npx changeset status` passes.
- The work is merged into `main` by a person through a pull request whose commits follow `docs/commit-guide.md`, with the number of human correction rounds recorded in the pull request.
