# Gaps

What InkHR does not have. The closed sets are the token files, `components.json` and `docs/stack-and-dependencies.md`. If what you need is in none of them, stop and ask; never invent a token, component, variant, prop or package, and never build a local stand-in.

## Not in InkHR, by decision

Do not add these or work around them. A change needs a decision first.

- **White-label theming.** One brand only: no brand loader, no third token tier, no brand files. The app bar always carries the InkHR lock-up.
- **A second accent colour.** Cobalt is the only action and signal hue. Status and data colours never colour body text and never fill a button, except brick on the destructive button, `sys.action.danger.bg`.
- **A generic label colour.** Every fill that carries a label owns its text role: `sys.action.primary.text`, `sys.action.danger.text`, `sys.signal.text`, `sys.avatar.text` and `sys.status.{kind}.text`, and `sys.selected.bg` is labelled by `sys.text.on-selected`.
  `sys.text.on-accent` was retired on 22 September 2026. <!-- name-check: skip -->
- **Behaviour outside Angular.** Other web frameworks get the `@inkhr/styles` classes only, without keyboard handling or ARIA logic.
- **Ink or texture on work surfaces.** No ink art, gradient or photograph behind a table, form or chart; ink appears only on welcome, onboarding and empty surfaces, one asset per surface. Ink is never drawn or generated in code, and photographs are never shown without the duotone.
- **Instrument Serif beyond one phrase.** Never for headings, labels or body copy.
- **Motion nobody caused.** Nothing animates on load or loops.
- **Values flowing back from design tools.** Values change in the token source only, never in a design file or a screenshot.
- **Accessibility exceptions.** Nobody can grant one.

## Not in InkHR yet

Ask before building anything that depends on these.

- **Chart components.** `sys.data.1.bg` to `sys.data.6.bg` exist for chart series, but there is no chart component. It is in no stage of the roadmap yet: a person adds it before work starts.
- **`ink-icon`.** Icons are a sprite with CSS classes; whether a component is needed is decided when the icon work starts. It is in no stage of the roadmap yet: a person adds it before work starts.
- **Control height tokens.** Heights 32, 40 and 48 (compact 28, 32 and 40) are not tokens, so there are no density token files; density is the `data-density` attribute. They arrive in Stage 0, with the density pair.
- **Components outside the inventory.** `components.json` is the full list; a component or variant that is not in it does not exist. Stage 1 builds the components it lists; anything else needs a decision first.
- **A check for non-colour cues.** Nothing yet fails a link in running text without an underline or a selected option without a check or heavier label; axe's `link-in-text-block` rule covers links once gate 3 runs component examples in Stage 1.
- **Unchosen tools.** Rows marked "To choose" in `docs/stack-and-dependencies.md` are open; do not pick one. Each row's stage is in that file's Stage column.

## When you hit a gap

1. Stop the task at that point.
2. Write what is missing and why the feature needs it in the spec or the pull request.
3. A person decides: use what exists, extend InkHR through the contribution process, or build it at product level.
