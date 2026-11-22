# QuickBay — Roadmap

This roadmap is a proposed delivery sequence, not a claim that the listed work is complete.

## Stage 1 — Foundation and reliability
- [ ] Confirm clean local setup from a fresh clone.
- [ ] Maintain a documented environment-variable inventory.
- [ ] Add repeatable lint, syntax and smoke-test commands.
- [ ] Verify migrations against a disposable test database.
- [ ] Complete role-based browser QA with dedicated test accounts.
- [ ] Add accessibility and responsive-layout checks.

**Exit gate:** customer, workshop and admin flows pass repeatable tests without exposing data across roles.

## Stage 2 — Tiruvallur pilot
- [ ] Define pilot localities and workshop categories.
- [ ] Onboard workshop owners through a documented consent process.
- [ ] Validate source attribution and public-display permissions.
- [ ] Measure duplicate, stale and incomplete listing rates.
- [ ] Test booking-to-job-card handoff with pilot partners.
- [ ] Establish a process for listing corrections and removal requests.

**Exit gate:** a measured, source-transparent pilot directory and reliable operational workflow.

## Stage 3 — Workshop operations
- [ ] Complete bay allocation and job-stage transition QA.
- [ ] Validate technician assignment and service records.
- [ ] Complete estimate creation, approval and revision workflows.
- [ ] Validate inventory ledger and old-parts handover controls.
- [ ] Add operational reports with clearly defined metrics.

**Exit gate:** workshop users can complete the intended workflow with auditable state changes.

## Stage 4 — Customer experience
- [ ] Validate search filters, map behaviour and location permission UX.
- [ ] Complete booking cancellation and rescheduling edge cases.
- [ ] Verify service history, saved workshops and support privacy.
- [ ] Improve empty, loading, offline and error states.
- [ ] Test mobile layouts on common Android and iOS viewport sizes.

**Exit gate:** customers can understand and complete the main service journey.

## Stage 5 — Controlled expansion
- [ ] Expand district by district after pilot quality gates pass.
- [ ] Acquire written licenses before using commercial directory datasets.
- [ ] Establish a data refresh, correction and deletion process.
- [ ] Monitor performance, security events and support trends.
- [ ] Review operational costs before enabling any paid service.

**Exit gate:** expansion is backed by verified supply, support capacity and measured service quality.

## Explicitly out of scope until separately approved
- Payment gateway activation.
- Outbound SMS, email or push notifications.
- Phone OTP authentication.
- Unlicensed bulk data imports.
- Production promotion without release approval.
