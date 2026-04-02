# UI QA Checklist (Frontend)

## Visual Consistency
- [ ] Headers keep clear hierarchy: title + supporting description.
- [ ] Action buttons are consistent (`primary`, `outline`, `destructive`) and responsive on mobile.
- [ ] Summary tiles use the shared pattern (icon + label + value/helper) with consistent spacing.
- [ ] Empty and loading states are explicit (not silent blank sections).
- [ ] Dark mode keeps contrast and legibility for cards, popovers, and text.

## Select + Form UX
- [ ] Every `Select` has `Label` + `id/htmlFor`.
- [ ] Placeholder text is present when value is optional.
- [ ] Loading/empty/disabled states are handled and visible.
- [ ] Dependent selects clear orphaned child values when parent changes.
- [ ] Keyboard flow works (`open`, arrows, `enter`, `escape`, tab order).

## Flow Safety
- [ ] User gets explicit feedback when required filters/steps are missing.
- [ ] Destructive actions use `AlertDialog` (no `confirm()`).
- [ ] File uploads validate type/size before submit when required.
- [ ] Client-facing errors are sanitized; technical detail stays in server logs.
