# QuickBay
**Every Bay. Every Job. One Platform.**

QuickBay is an India-focused automotive workshop marketplace and workshop operations platform.

## Live links
- Production: https://quickbay.vercel.app
- Preview reference shared by the project owner: https://quickbay-r4a71cqzp-yoyo-0909.vercel.app/?utm_source=chatgpt.com
- Active development branch: `work/quickbay-completion`
- Release review: [Pull request #3](https://github.com/yoyo-0909/Quickbay/pull/3)

The preview reference above is a previously created Vercel preview. It is not a claim that the latest development commit has been deployed there.

## Application modules
- **Customer:** profile, garage, vehicle updates, workshop discovery, verified-partner booking requests, booking cancellation/rescheduling, service tracking, service history, saved workshops, estimate responses, invoice summaries, private support tickets, private feedback and in-app inbox.
- **Workshop:** member-scoped bookings, bays, job cards, stage transitions, technicians, service catalogue, draft estimates, invoice register, inventory ledger, parts-return records and private customer feedback.
- **Admin:** platform overview, customer/profile list, booking list, workshop applications, partner directory, service category management, vehicle catalogue management, private review moderation, support tickets, analytics and audit log views.

## Authentication and security
- Email/password sign-in.
- Registration collects full name and mobile number; the number is contact information only.
- No phone OTP, SMS verification, or phone-based login.
- Public signup cannot choose a privileged role. Workshop/admin access requires controlled provisioning and active workshop membership.
- Row Level Security scopes customer and workshop records.
- Never put a Supabase service-role key or secret in browser code or this repository.

## Backend and migrations
The project uses Supabase for authentication and PostgreSQL data. Migrations `0001`–`0016` establish the core schema and additive workflows. Migration `0017_verified_partner_booking_requests.sql` has been applied to the connected Supabase project and its function permissions and partner-verification checks have been verified. Authenticated customer/workshop end-to-end testing is still required before production release.

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for current backend status and migration instructions.

## Workshop discovery and booking rules
QuickBay can show source-attributed public automotive listings and location-based discovery. A third-party map listing is not a QuickBay partner. Customers may use published contact details and directions, but in-app booking requests are restricted to approved, QuickBay-verified partners and their active service catalogue. A request is not a confirmed appointment until the workshop accepts it.

The directory target is 30,000+ genuine records; this is a sourcing goal, not a current count. Do not invent workshops, phone numbers, ratings, locations or partner verification. Import only data with documented rights for storage, public display, commercial use and attribution. See [DATA_SOURCING.md](DATA_SOURCING.md).

## Intentionally disabled
- Payment gateway activation and payment collection.
- Paid third-party services or subscriptions.
- Outbound SMS, email and push notifications.
- Publishing/importing customer or workshop records without permission.
- Destructive database changes.

## Validation and release status
- Existing Vercel preview builds reached `READY` before the latest booking changes.
- Static JavaScript syntax checks were previously reported as passing for the inline application scripts and `workflows.js`.
- Full interactive browser QA and authenticated end-to-end testing remain outstanding.
- Apply migration 0017 and test customer/workshop accounts before promoting the release to production.
