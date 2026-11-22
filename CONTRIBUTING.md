# Contributing to QuickBay

Thanks for taking an interest in QuickBay. Focused, reproducible contributions are the easiest to review.

## Before you start

- Read the [product overview](docs/PRODUCT_OVERVIEW.md) and [repository map](docs/REPOSITORY_MAP.md).
- For significant changes, open an issue first to agree on the problem and approach.
- Keep changes aligned with the project's privacy, data-sourcing and security boundaries.

## Pull request expectations

Include:

1. The problem being solved.
2. A concise description of the implementation.
3. Screenshots or a short recording for interface changes.
4. Steps used to test the change.
5. Any migration or configuration impact.

## Local checks

- Review the changed JavaScript and SQL carefully.
- Run the available source-quality workflow locally where practical.
- Test with dedicated accounts and non-production data.
- Do not claim a workflow is production-ready without browser and permission testing.

## Do not commit

- Service-role keys, passwords, tokens or private credentials.
- Real customer or workshop personal data.
- Directory datasets without documented storage and public-display rights.
- Generated exports, local environment files or dependency folders.

## Scope boundaries

Payment processing, outbound messaging, phone OTP and production promotion are not implied by a contribution. Discuss these separately before implementation.
