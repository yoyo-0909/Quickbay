# QuickBay Supabase setup and current status

## Current connection
- Supabase project: QuickBay (`zotokdookrbnjfyldizr`), Mumbai region.
- Project health: active and healthy at the last check.
- The public browser configuration is in `config.js` and contains only the Supabase project URL and publishable/anon key.
- Never place a service-role key or secret key in `config.js`, frontend code, or a public repository.

## Database migrations
The live database already contains the core schema from migrations `0001` through `0005`. The following additive migrations have also been applied:
- `0006_inventory_notifications_and_customer_workflows.sql`: inventory items, immutable stock movement ledger, in-app notification storage, customer booking cancellation and estimate-item policies.
- `0007_lock_inventory_ledger_permissions.sql`: restricts stock quantity changes to the audited inventory RPC and limits notification updates to `read_at`.
- `0008_private_inventory_rpc.sql`: moves the privileged stock movement implementation into the private schema; the public RPC is an invoker wrapper.
- `0009_move_btree_gist_to_extensions.sql`: moves the relocatable booking-slot exclusion extension out of the exposed `public` schema.
- `0010_rls_initplan_and_fk_indexes.sql`: optimises `auth.uid()` evaluation in policies and adds missing foreign-key indexes.
- `0011_support_and_saved_workshops.sql`: adds private support tickets/messages and account-level saved workshop references.
- `0012_private_workshop_reviews.sql`: adds private customer feedback and admin moderation; reviews are not published.
- `0013_booking_reschedule_and_fk_indexes.sql`: adds customer rescheduling permissions and the remaining support foreign-key indexes.
- `0014_admin_catalogues.sql`: adds admin-managed service categories and an initially empty vehicle catalogue.
- `0015_customer_estimate_response.sql`: adds private-schema customer approval / change-request responses for estimates made available in-app.
- `0016_harden_estimate_response.sql`: rejects null or unsupported estimate response values.

Do not reapply the original core migrations to an already-provisioned database. Apply future migrations in order and verify them before connecting new UI workflows.

## Authentication rules
- Email/password is the only authentication method.
- Registration collects full name and mobile number.
- The mobile number is copied to `public.profiles.phone` and is used as contact information only.
- No phone OTP, SMS verification, or phone-based sign-in is enabled.
- User role is never accepted from public signup metadata; new users receive the `vehicle_owner` role.
- Workshop pages require an active row in `workshop_members`. A workshop role alone is not sufficient to access a workshop record.

## Security and data handling
- Row Level Security is enabled on the public application tables.
- Workshop records are scoped through active workshop membership.
- Customer records are scoped to the authenticated customer.
- The inventory ledger is append-only from the browser; stock adjustments go through `record_inventory_movement`.
- In-app notification records are private to their owner. No SMS, email, push provider or customer notification dispatch is configured.
- Payment processing is not connected.
- No real workshop/customer dataset has been imported or published.

## Admin access
The first super-admin must be provisioned through a secure, one-time administrative process. Never expose role assignment in public signup or the browser. Admin access should be verified using a dedicated test account before launch.

## Local / preview validation
Use a dedicated test account and a test workshop membership to exercise customer and workshop flows. Do not use live customer data for testing. The development branch is separate from production; do not merge or promote it until the owner explicitly approves the release.