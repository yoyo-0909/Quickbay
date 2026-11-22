# QuickBay roadmap

This is a proposed delivery sequence. Checkboxes are intentionally open until work has been implemented and validated with evidence.

## Stage 1 — Foundation

- [ ] Reproduce a clean local setup from a fresh clone.
- [ ] Provision a dedicated Supabase test project.
- [ ] Apply and verify migrations in order.
- [ ] Validate authentication and role boundaries.
- [ ] Add repeatable source-quality checks.

**Exit gate:** the demo and backend setup are reproducible, and database access is tested with dedicated accounts.

## Stage 2 — Regional workshop pilot

- [ ] Define pilot localities and workshop categories.
- [ ] Onboard workshop owners with documented consent.
- [ ] Review listing accuracy, provenance and public-display rights.
- [ ] Measure duplicate and stale-record rates.
- [ ] Test booking request handoff with pilot partners.

**Exit gate:** a measured directory and a repeatable partner onboarding process.

## Stage 3 — Workshop operations

- [ ] Validate booking and job-card workflows.
- [ ] Test bay allocation and service-stage transitions.
- [ ] Verify estimates and service records.
- [ ] Add operational reporting with defined metrics.

**Exit gate:** workshop teams can complete the intended service workflow with auditable state changes.

## Stage 4 — Customer experience

- [ ] Validate discovery filters, map behaviour and location permission UX.
- [ ] Test booking cancellation and rescheduling edge cases.
- [ ] Improve loading, empty, offline and error states.
- [ ] Test responsive layouts on common Android and iOS sizes.

**Exit gate:** customers can complete the core service journey and understand its status.

## Stage 5 — Controlled expansion

- [ ] Expand geography only after pilot quality gates pass.
- [ ] Obtain written licenses for any commercial directory datasets.
- [ ] Establish data refresh and correction processes.
- [ ] Review operational cost and support capacity.

**Exit gate:** expansion is backed by verified workshop supply and measured service quality.

## Separate approval required

Payment gateway activation, outbound SMS/email/push notifications, phone OTP, unlicensed bulk imports and production promotion require separate review and approval.
