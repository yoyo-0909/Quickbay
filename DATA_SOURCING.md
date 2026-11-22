# QuickBay workshop data acquisition

## Target
30,000+ genuine automotive workshop/service-centre records across India. The target is a sourcing goal, not a claim of current directory coverage.

## Sources and rights
- **Workshop-submitted/claimed records:** collect directly through QuickBay onboarding and retain consent and source timestamps.
- **Licensed commercial datasets:** obtain a written license that explicitly permits storage, public display, derived indexing, commercial use and update cadence. Ask the vendor for a sample, field dictionary, geography coverage, duplicate rate, source lineage, deletion/refresh process and restrictions before purchase.
- **Open Government Data:** the UDYAM MSME dataset is a potentially useful discovery lead, but it is not a workshop directory. The resource page currently says its data is dynamically generated and the API for that resource does not exist; it must not be assumed downloadable as a ready-to-import garage list. If a usable export becomes available, filter for relevant activity codes and independently validate business activity and public display rights.
- **Google Places and other map providers:** use only within the provider's current API terms. Do not bulk scrape or permanently copy restricted listing content into QuickBay's independent directory. Store only identifiers and fields the license permits; attribute live sourced content.

## Import workflow
1. Obtain the file/API under a written license.
2. Record source name, license, attribution, date, coverage and allowed retention/public display.
3. Normalise phone, PIN, state, city and address; deduplicate by source ID and a reviewed name/address fingerprint.
4. Import to staging, not directly to verified partners.
5. Display third-party listings with a source badge and without implying QuickBay verification.
6. Let workshop owners claim the listing; verify ownership separately.
7. Monitor per-state counts, stale records, failed geocodes and duplicate rates.

## Import command
Install dependencies with `npm install`, then set server-only environment variables and run:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
SOURCE_NAME="Licensed provider" SOURCE_LICENSE="Contract ref / license" \
SOURCE_ATTRIBUTION="Required attribution" PUBLIC_DISPLAY_PERMITTED=true \
node scripts/import-workshops.mjs ./licensed-workshops.csv
```

The service-role key is server-only. Never place it in `config.js`, browser code, GitHub Actions logs, or a public repository. The importer requires explicit public-display permission and records source attribution.

## Initial pilot
Start with Tiruvallur and nearby localities, measure actual coverage and validate sample records with workshop calls/claims. Expand district-by-district after quality checks. Never pad coverage with generated businesses or inferred ratings.

## Commercial dataset candidates (not acquired)
Public vendor pages advertise large India-wide automotive datasets that may meet the numerical target, but the dataset files and contractual reuse rights are not included here:
- Auspector advertises 332,252 auto-repair-shop records in its India business catalogue.
- LeadSetu advertises 60,186 car and bike garage records in its service-centre category and offers access on request.

These are vendor-stated counts, not verified QuickBay records. Before purchase/import, obtain a sample and written confirmation of the rights to store, display, index, update, and use the data commercially; check whether contact details, ratings, reviews and map coordinates have separate restrictions. Do not import until approved by the data owner/license.
