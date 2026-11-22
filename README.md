# QuickBay
**Every Bay. Every Job. One Platform.**

QuickBay is an India-focused automotive workshop marketplace and workshop operations platform.

## Project status
- Production UI: https://quickbay.vercel.app
- Active development branch: `work/quickbay-completion`
- Supabase project: connected and healthy in the Mumbai region.
- The current development branch is a preview only. It has not been merged into the production branch or assigned to the production domain.
- No workshop directory records have been imported or published. The directory must display only source-permitted or approved records.

## Authentication
- Email + password sign-in.
- Registration collects full name and mobile number.
- Mobile number is saved as contact information in `profiles.phone`.
- No mobile OTP, SMS verification, or phone-based login.
- Email changes are not exposed in the profile editor because they require a separate confirmation flow.

## Application modules
- Customer: profile, garage, vehicle updates, workshop discovery, booking requests, cancellation of eligible bookings, service tracking, service history, saved workshops, private support tickets, private feedback and in-app inbox.
- Workshop: member-scoped bookings, bays, job cards, stage transitions, technicians, service catalogue, draft estimates, invoice register, inventory ledger, parts-return records and private customer feedback.
- Admin: platform overview, customer/profile list, booking list, workshop applications, partner directory, service category management, vehicle catalogue management, private review moderation, support tickets, analytics and audit log views.

## Backend
The Supabase project contains the core profiles, workshops, workshop membership, vehicles, services, bookings, bays, technicians, job cards, estimates, invoices, parts-return and audit tables. Migrations `0001`–`0005` established the core schema and security helpers. Migrations `0006`–`0012` add inventory, in-app notification storage, customer cancellation rules, estimate-item access, a private-schema inventory movement implementation, safer extension placement, RLS/index optimisations, private support, saved workshops and non-public feedback moderation.

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for environment and migration notes.

## Workshop data and licensing
The directory target is 30,000+ genuine records, but this is a sourcing goal—not a current count. Do not invent workshops, phone numbers, ratings, locations or partner verification. Only import data after a written license confirms storage, public display, commercial use and attribution rights. See [DATA_SOURCING.md](DATA_SOURCING.md).

## Intentionally disabled during this development phase
- Payment gateway activation and financial transactions.
- Paid third-party services or subscriptions.
- Outbound SMS, email, push or customer notifications.
- Publishing or importing real customer/workshop records.
- Destructive database changes or deleting existing data.
- Merging development branches or changing production deployments.

The in-app notification table is storage only; no outbound notification provider or automatic customer messaging is configured.

## Validation status
- JavaScript syntax checks pass for the inline application scripts and `workflows.js`.
- Vercel preview builds have reached `READY`.
- Database migration objects and inventory RPC have been verified.
- Full interactive browser QA and authenticated end-to-end testing remain outstanding because no dedicated test accounts were supplied.