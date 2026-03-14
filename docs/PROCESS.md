# Development Process — Promise Pipeline

## Architecture Decision Records

When making significant technical choices (new dependencies, schema changes, architectural patterns, deviations from spec), create a file in `docs/decisions/` with this format:

```
# ADR-NNN: [Short title]
## Context: What problem or question prompted this decision
## Decision: What we chose
## Reasoning: Why, including alternatives considered
## Consequences: What this enables, what it costs, what breaks if changed
```

If you deviate from the CLAUDE.md spec, always write an ADR explaining why.

## Invariants (never violate these)

- All database writes go through API routes, never client-side
- Promise schemas are immutable once published; new versions create new records
- Training data export is append-only, no deletion
- All API routes require authentication except public read endpoints
- Trust capital computation uses stakes weighting, never flat averaging
- The CLAUDE.md is the source of truth; if code and spec diverge, flag it
- Editorial content (narratives, insights) lives in frontend; computational backing (verification, projections) lives in API

## Testing Requirements

Every feature must include three layers of tests:

1. **Unit tests** — verify individual functions (trajectory math, trust capital calc, schema validation)
2. **Integration tests** — verify components work together (API returns correct data from seed data)
3. **Axiom tests** — verify Promise Theory properties are preserved (autonomy, composability, falsifiability, idempotency, observability)

If you add a feature without tests, flag it as technical debt in the build report.

## Self-Review Checklist

After completing a build session, include in the build report:

- [ ] What was built vs. what was specced — any deviations and why
- [ ] New dependencies added and justification
- [ ] Technical debt introduced (stubs, TODOs, shortcuts)
- [ ] Invariants — confirm none were violated
- [ ] Security considerations — any new attack surfaces
- [ ] What would break if the most fragile part of this change failed

## Branch Discipline

- `main` is always deployable
- Feature work happens on branches
- Tests must pass before merge
- Build report accompanies every branch

## Code Style

- Prefer explicit over clever
- Comment the "why" not the "what"
- Keep functions small and single-purpose
- Use meaningful variable names — someone reading this in 6 months should understand without context
- When in doubt, add a type annotation

## When Uncertain

If a decision could go multiple ways and the spec doesn't resolve it:

1. Choose the simpler option
2. Write an ADR explaining the choice
3. Flag it in the build report as a decision point for review
