# QuickBay backend setup

## Current status
The application now includes an authentication screen wired to Supabase Auth when configured, SQL migrations, row-level security, and a licensed workshop CSV importer. The live Vercel site is still using the demo preview until a Supabase project is connected and configured.

## Connect Supabase
1. Connect the Supabase integration in ChatGPT when prompted, or create a Supabase project at https://supabase.com/dashboard.
2. Apply migrations in order:
   - `supabase/migrations/0001_quickbay_core.sql`
   - `supabase/migrations/0002_directory_and_workflow.sql`\n   - `supabase/migrations/0003_booking_concurrency.sql`
3. In Supabase Auth settings, enable email/password and set the site URL to `https://quickbay.vercel.app`.
4. Put the project's URL and anon/publishable key in the public `config.js` file. Never put the service-role key in frontend code.
5. Configure the Vercel production deployment to serve the updated `config.js`.
6. Create the first Super Admin through a secure, one-time server-side administrative operation. Do not expose role assignment in public signup or the browser.

## Important
The Supabase integration has not yet been connected to this ChatGPT session, and no live database has been provisioned or migrations executed. Do not enter production credentials in chat. Once connected, apply and test the migrations against the actual project before inviting users.

## OpenStreetMap discovery import
OpenStreetMap provides reusable map data under ODbL. The India data page describes Overpass API and daily Geofabrik extracts. QuickBay includes a polite tiled Overpass collector for named automotive POIs:

```bash
python scripts/fetch_osm_workshops.py --out osm-workshops.csv
```

This collector can take a long time and may be throttled by public Overpass servers. It collects only named OSM objects tagged as car repair, car mechanics, car painters, tyre shops, car dealers or car washes. Coverage is mapper-dependent, not exhaustive. It does not invent phone numbers, ratings, addresses or partner verification. The resulting CSV is a candidate directory and must be deduplicated/quality-reviewed before import.

Then import the collected data only after checking the ODbL obligations and your intended database distribution model. ODbL attribution: © OpenStreetMap contributors. Use the importer with server-only credentials and `PUBLIC_DISPLAY_PERMITTED=true`.
