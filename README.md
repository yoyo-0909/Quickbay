<!-- QuickBay repository front page -->
<div align="center">

<img src="assets/quickbay-banner.svg" alt="QuickBay — Every Bay. Every Job. One Platform." width="100%" />

<br />

[![Repository](https://img.shields.io/badge/GitHub-QuickBay-111827?style=flat-square&logo=github&logoColor=white)](https://github.com/yoyo-0909/Quickbay)
[![Application](https://img.shields.io/badge/Application-Browser--based-1F2937?style=flat-square)](index.html)
[![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](SUPABASE_SETUP.md)
[![License](https://img.shields.io/badge/License-Not%20yet%20specified-lightgrey?style=flat-square)](#licensing)

**Every Bay. Every Job. One Platform.**

A connected service experience for vehicle owners and a practical operations workspace for independent multi-brand workshops.

[Product overview](docs/PRODUCT_OVERVIEW.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md) · [Setup guide](SUPABASE_SETUP.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## What we're building

Independent workshops are essential to everyday mobility, but discovery and service operations are often fragmented across calls, paper records and disconnected tools.

**QuickBay brings the customer journey and workshop workflow into one platform.** Vehicle owners can discover suitable workshops, request service and follow progress. Workshop teams can organise bookings, bays, job cards and operational records. Platform administrators govern partner onboarding, catalogues and directory quality.

The product is being developed with a regional-first approach: validate the experience with real partner workflows before making broad coverage claims.

## Product experience

<table>
<tr>
<td width="33%" valign="top">

### Customer

Find a suitable workshop and keep the service journey understandable.

- Vehicle profile and garage
- Workshop discovery and map
- Booking requests
- Service progress and history
- Estimate responses
- Invoice summaries
- Support and feedback

</td>
<td width="33%" valign="top">

### Workshop

Run daily service operations through a structured workspace.

- Booking queue
- Bay allocation
- Job cards
- Technician directory
- Service-stage updates
- Estimates and invoice records
- Inventory and parts records

</td>
<td width="33%" valign="top">

### Administration

Maintain platform quality, partner access and operational oversight.

- Workshop applications
- Partner directory
- Service catalogue governance
- Customer and booking views
- Support workflows
- Private feedback moderation
- Audit visibility

</td>
</tr>
</table>

> **Capability note:** These are product areas represented in the repository. Their presence in the interface is not proof of production readiness. Browser, permission and end-to-end validation are required before launch.

## How QuickBay works

    PEOPLE                         QUICKBAY                         PLATFORM
    ──────────────────────────────────────────────────────────────────────────
    Vehicle owner  ────────────>  Customer workspace  ───────┐
    Workshop team  ────────────>  Workshop operations ───────┼──> Supabase Auth
    Platform admin ────────────>  Admin workspace     ───────┘         │
                                                                      ▼
                                                               PostgreSQL
                                                                      │
                                                                      ▼
                                                            Row Level Security

    Rights-cleared source ──> Staging and review ──> Approved directory records

## Technology

| Layer | Current implementation |
|---|---|
| Application | HTML, CSS and browser JavaScript |
| Backend | Supabase |
| Authentication | Supabase Auth, email and password |
| Database | PostgreSQL with Row Level Security |
| Maps and directory | OpenStreetMap-based discovery tooling |
| Data ingestion | Python Overpass collector and Node.js CSV importer |

See [Architecture](docs/ARCHITECTURE.md) for the application boundaries and [Data sourcing](DATA_SOURCING.md) for provenance and licensing requirements.

## Repository layout

    Quickbay/
    ├── .github/                 # Contribution templates and quality workflow
    ├── assets/                  # QuickBay repository brand assets
    ├── docs/
    │   ├── ARCHITECTURE.md      # System context and trust boundaries
    │   ├── BRAND_GUIDE.md       # Visual identity for project materials
    │   ├── PRODUCT_OVERVIEW.md  # Users, journeys and product principles
    │   ├── REPOSITORY_MAP.md    # Codebase orientation
    │   └── ROADMAP.md           # Delivery stages and exit gates
    ├── scripts/                 # Directory collection and import tools
    ├── supabase/                # Database migrations and Supabase assets
    ├── index.html               # Browser application entry point
    ├── config.js                # Public Supabase browser configuration
    ├── workflows.js             # Core workflow extensions
    ├── directory-map.js         # Workshop discovery map
    ├── customer-experience.js   # Customer-facing experience
    ├── customer-billing.js      # Estimate and invoice views
    ├── admin-catalogues.js      # Catalogue administration
    ├── support.js               # Support workflows
    └── package.json             # Importer dependencies and scripts

For a guided tour of the code, start with [Repository map](docs/REPOSITORY_MAP.md).

## Run locally

QuickBay is currently a browser-based application rather than a packaged desktop or mobile app.

1. Clone the repository:

       git clone https://github.com/yoyo-0909/Quickbay.git
       cd Quickbay

2. Install the Node dependencies used by the data-import tooling:

       npm install

3. Review [Supabase setup](SUPABASE_SETUP.md). The browser configuration should contain only the project URL and publishable/anon key. Never put a service-role key in frontend code.

4. Start a local static server from the repository root:

       python -m http.server 4173

5. Open http://localhost:4173.

Use dedicated test accounts and test workshop memberships. Do not test with real customer records. The importer is a separate administrative operation and is not required to launch the browser application.

## Project status

QuickBay is under active development. The current repository includes the browser application, Supabase integration, migration history, directory tooling and product documentation.

The following remain important release gates:

- Complete interactive browser QA across customer, workshop and admin roles.
- Verify RLS policies and role boundaries using dedicated test accounts.
- Validate location permission, map behaviour and mobile layouts.
- Test booking-to-job-card handoff and service-stage transitions.
- Confirm the source, license and public-display rights for every directory dataset.

The [roadmap](docs/ROADMAP.md) tracks the proposed delivery sequence. A target of 30,000+ workshop records is a sourcing goal—not a current directory count.

## Trust, privacy and scope

QuickBay prioritises accurate listings, clear operational states and least-privilege access.

- Directory records must retain source, license, attribution and display permissions.
- Third-party listings must not be presented as QuickBay-verified partners without verification.
- Customer records must be scoped to their owner; workshop records must be scoped to active membership.
- Privileged credentials must remain server-side.
- Invoice records do not imply payment processing.

The current development scope intentionally excludes payment gateway activation, outbound SMS/email/push notifications, phone OTP authentication, unlicensed bulk imports and production promotion without explicit release approval.

Read [Security](SECURITY.md) and [Data sourcing](DATA_SOURCING.md) before handling credentials or directory data.

## Contributing

Contributions should solve a clear problem and include enough context to review and reproduce the change.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Open an issue for significant changes before starting implementation.
3. Keep pull requests focused and include screenshots for user-interface changes.
4. Never include secrets, personal customer data or unlicensed workshop datasets.

## Licensing

No repository-wide open-source license has been specified yet. Until a license is added, the default copyright rules apply; do not assume that the code or assets are available for unrestricted reuse.

---

<div align="center">

**QuickBay**

*Built to help workshops run better and vehicle owners navigate service with confidence.*

[Explore the repository](https://github.com/yoyo-0909/Quickbay) · [Read the roadmap](docs/ROADMAP.md)

</div>
