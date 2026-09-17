# Gaps

What InkHR does not have. The closed sets are the token files, `components.json` and `docs/stack-and-dependencies.md`. If what you need is in none of them, stop and ask; never invent a token, component, variant, prop or package, and never build a local stand-in.

## Not in InkHR, by decision

Do not add these or work around them. A change needs a decision first.

- **White-label theming.** One brand only: no brand loader, no third token tier, no brand files. The app bar always carries the InkHR lock-up.
- **A second accent colour.** Cobalt is the only action and signal hue. Status and data colours never fill a button and never colour body text.
- **Behaviour outside Angular.** Other web frameworks get the `@inkhr/styles` classes only, without keyboard handling or ARIA logic.
- **Ink or texture on work surfaces.** No ink art, gradient or photograph behind a table, form or chart; ink appears only on welcome, onboarding and empty surfaces, one asset per surface. Ink is never drawn or generated in code, and photographs are never shown without the duotone.
- **Instrument Serif beyond one phrase.** Never for headings, labels or body copy.
- **Motion nobody caused.** Nothing animates on load or loops.
- **Values flowing back from design tools.** Values change in the token source only, never in a design file or a screenshot.
- **Accessibility exceptions.** Nobody can grant one.

## Not in InkHR yet

Ask before building anything that depends on these.

- **Chart components.** `data.1` to `data.6` exist for chart series, but there is no chart component.
- **`ink-icon`.** Icons are a sprite with CSS classes; whether a component is needed is decided when the icon work starts.
- **Control height tokens.** Heights 32, 40 and 48 (compact 28, 32 and 40) are not tokens, so there are no density token files; density is the `data-density` attribute.
- **Components outside the inventory.** `components.json` is the full list; a component or variant that is not in it does not exist.
- **Unchosen tools.** Rows marked "To choose" in `docs/stack-and-dependencies.md` are open; do not pick one.

## When you hit a gap

1. Stop the task at that point.
2. Write what is missing and why the feature needs it in the spec or the pull request.
3. A person decides: use what exists, extend InkHR through the contribution process, or build it at product level.
