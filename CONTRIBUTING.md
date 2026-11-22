# Contributing to QuickBay

Thanks for helping improve QuickBay. The project is evolving, so small, reviewable and well-tested changes are preferred.

## Before you start

1. Read the [README](README.md), [architecture](docs/ARCHITECTURE.md) and [Supabase setup](SUPABASE_SETUP.md).
2. Search existing issues and pull requests before opening a duplicate.
3. Describe the problem and expected behaviour before proposing a large refactor.
4. Never include real customer data, workshop contact exports, credentials or private screenshots in commits.

## Development expectations

- Keep changes focused and avoid unrelated formatting churn.
- Preserve existing role and RLS boundaries.
- Treat UI checks as separate from backend authorization.
- Keep service-role keys server-side.
- Do not add phone OTP, payment activation or outbound messaging without a separately approved product/security review.
- For directory work, retain source attribution and licensing metadata.
- Do not fabricate workshop records, ratings, locations or partner verification.

## Testing

For every change, report:

- What changed.
- How it was tested.
- Which role(s) were tested.
- Any migration or environment requirements.
- Known limitations or untested paths.

Use dedicated test accounts and non-production data. Do not run destructive SQL against a shared database.

## Pull requests

A good pull request should include:

- A clear problem statement and scope.
- Screenshots or a short recording for visible UI changes.
- Relevant migration notes.
- Security and RLS implications.
- Manual or automated test evidence.
- Rollback considerations for database or workflow changes.

Keep the pull request small enough to review safely. Do not merge or promote to production without explicit owner approval.
