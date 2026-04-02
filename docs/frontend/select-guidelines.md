# Select Guidelines (shadcn + Base UI)

## Standard Pattern
- Always pair `Label` + `SelectTrigger` with a shared `id`/`htmlFor`.
- Keep `SelectTrigger` full width by default. Use explicit width classes only when needed (`sm:w-[160px]`, `w-fit`, etc.).
- Provide placeholder text for non-required values.
- For dynamic options, add:
  - disabled state while loading,
  - disabled state when the list is empty,
  - empty message inside `SelectContent`.
- For dependent selects, clear invalid child selection when parent value changes.

## Accessibility
- Use stable IDs:
  - `Label htmlFor="fieldId"`
  - `SelectTrigger id="fieldId"`
- Keep concise, explicit labels and placeholders.
- Preserve keyboard flow: open, arrows, enter, escape.

## Review Checklist
- [ ] `Select` has associated `Label` and `id`.
- [ ] Width behavior is intentional and responsive.
- [ ] Loading/empty/disabled states are covered.
- [ ] Empty option list shows clear user feedback.
- [ ] Dependent select state is reset safely when needed.
- [ ] No orphan selected values after data source changes.
- [ ] Visual tokens respect theme (`popover`, `border`, `muted`, dark mode).
