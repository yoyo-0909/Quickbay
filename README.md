# QuickBay
**Every Bay. Every Job. One Platform.**

India-focused automotive workshop marketplace and workshop operations OS.

## What's in this repository
- Responsive customer, workshop and admin workspace UI.
- Branded loading screen and a sign-in / customer registration screen.
- Supabase Auth integration points in `config.js` (project URL + public anon key only).
- PostgreSQL schema, row-level security and transactional workflow functions in `supabase/migrations`.
- Customer garage, booking requests and permitted workshop-directory reads wired to Supabase when configured.
- OpenStreetMap (ODbL) tiled automotive POI discovery collector and a licensed CSV import pipeline.
- Partner application, bay and job-card demo workflows.

## Live deployment
https://quickbay.vercel.app

## Backend activation status
Backend code is scaffolded, but the live Supabase project has not yet been connected or provisioned. The site therefore remains in demo preview until a Supabase project is connected, migrations are applied and `config.js` is configured. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Workshop data
The goal is 30,000+ genuine records, not a fabricated count. The repository includes an OSM collector and a source-attributed CSV importer. The OSM collector may return fewer than 30,000 named automotive POIs because mapping coverage varies. For the 30k+ target, obtain a written license from a commercial data supplier if open data is insufficient. See [DATA_SOURCING.md](DATA_SOURCING.md).

Never scrape or bulk-copy restricted Google Maps listings. Never claim a third-party listing is a QuickBay-verified partner. Ratings and review counts are shown only when supplied by an attributable source.

## Run the OpenStreetMap collector
```bash
python scripts/fetch_osm_workshops.py --out osm-workshops.csv
```
The collector uses tiled Overpass queries with rate limiting and retry behaviour. Public Overpass endpoints can throttle or time out; a Geofabrik PBF extract is preferable for large-scale repeatable ingestion.

## Import licensed records
```bash
npm install
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
SOURCE_NAME="OpenStreetMap" SOURCE_LICENSE="ODbL-1.0" \
SOURCE_ATTRIBUTION="© OpenStreetMap contributors" PUBLIC_DISPLAY_PERMITTED=true \
node scripts/import-workshops.mjs ./osm-workshops.csv
```
Only run the import after verifying the source license and public display rights. Keep service-role credentials server-side.

## Payment boundary
Payment processing remains intentionally disconnected. No real payment credentials are collected and demo checkout must never be represented as a real payment.
