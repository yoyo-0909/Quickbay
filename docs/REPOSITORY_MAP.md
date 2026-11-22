# Repository map

This guide is a starting point for navigating the current codebase. It describes the checked-in file layout; it is not a statement that every module has passed production validation.

## Application entry

| Path | Responsibility |
|---|---|
| index.html | Main browser application shell and UI |
| config.js | Public Supabase URL and publishable/anon key |
| workflows.js | Core workflow extensions |
| customer-experience.js | Customer-facing experience |
| customer-billing.js | Estimate and invoice presentation |
| directory-map.js / directory-map.css | Workshop discovery map and styles |
| admin-catalogues.js | Admin catalogue workflows |
| support.js | Support workflows |
| reviews.js | Private review and feedback workflows |
| interaction-fixes.js | Shared interaction fixes |

## Backend and data operations

- supabase/ contains database migration assets. Review the migration history before applying changes to any connected project.
- scripts/ contains directory collection and import utilities.
- DATA_SOURCING.md defines provenance, licensing and staging expectations.
- SUPABASE_SETUP.md documents the current Supabase setup, authentication constraints and migration notes.

## Project governance

- .github/workflows/ contains repository automation.
- .github/ISSUE_TEMPLATE/ contains issue templates.
- .github/PULL_REQUEST_TEMPLATE.md standardises review context.
- CONTRIBUTING.md explains contribution expectations.
- SECURITY.md explains responsible vulnerability reporting.

## Suggested reading order

1. [Product overview](PRODUCT_OVERVIEW.md) — understand users and journeys.
2. [Architecture](ARCHITECTURE.md) — understand the application and trust boundaries.
3. [Supabase setup](../SUPABASE_SETUP.md) — understand backend configuration.
4. [Data sourcing](../DATA_SOURCING.md) — understand directory data requirements.
5. [Roadmap](ROADMAP.md) — review delivery stages and release gates.

## Important implementation boundaries

- Browser configuration may contain only public Supabase values.
- Service-role credentials must remain server-side.
- UI visibility is not an authorization mechanism; enforce access in database policies.
- Use dedicated test accounts and test workshop memberships for validation.
- Do not enable payment processing, outbound messaging or phone OTP without separate approval.
