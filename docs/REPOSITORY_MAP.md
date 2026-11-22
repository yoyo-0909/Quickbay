# Repository map

A practical guide to the current default-branch codebase. File names describe code ownership, not a guarantee that every workflow is production-ready.

## Application

| Path | Purpose |
|---|---|
| index.html | Browser application shell and role-oriented interface |
| config.js | Public Supabase URL and anon/publishable key configuration |
| package.json | Node dependencies and importer scripts |

## Data collection and import

| Path | Purpose |
|---|---|
| scripts/fetch_osm_workshops.py | Collects named automotive-service points of interest from OpenStreetMap / Overpass |
| scripts/import-workshops.mjs | Imports source-attributed CSV records into the configured backend |

Collected listings are candidates for review. They are not automatically verified QuickBay partners. Read [Data sourcing](../DATA_SOURCING.md) before running either workflow.

## Database

- supabase/migrations/ contains ordered SQL migrations.
- Apply migrations only to the intended test or project database after reviewing the SQL.
- The current default-branch setup documents a backend scaffold; do not assume a live database has been provisioned.

See [Supabase setup](../SUPABASE_SETUP.md) for the current activation steps.

## Project documentation

- [Product overview](PRODUCT_OVERVIEW.md) — product purpose, users and journeys.
- [Roadmap](ROADMAP.md) — proposed stages and release gates.
- [Brand guide](BRAND_GUIDE.md) — visual identity and repository artwork.
- [Data sourcing](../DATA_SOURCING.md) — provenance, licensing and review.
- [Supabase setup](../SUPABASE_SETUP.md) — backend configuration and migration sequence.

## Security boundaries

- Only public Supabase values belong in browser configuration.
- Service-role credentials must remain server-side.
- A visible UI control is not an authorization boundary.
- Validate database policies before connecting real users.
- Use test accounts and non-production records during development.
