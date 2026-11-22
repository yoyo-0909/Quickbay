# Security policy

## Supported development target

Security reports should identify the affected repository branch, file or workflow and include enough detail to reproduce the issue safely.

## Reporting a vulnerability

Please do not publish credentials, personal data, exploit payloads or an unpatched vulnerability in a public issue. Use GitHub's private vulnerability reporting feature if it is enabled for this repository. Otherwise, contact the repository owner privately through GitHub.

Include:

- A concise description and impact.
- Affected paths, roles or database policies.
- Reproduction steps using test data.
- Any suggested mitigation.

## Security requirements

- Never commit API keys, passwords, service-role keys, access tokens or private certificates.
- Browser configuration may contain only public client configuration.
- Never expose Supabase service-role credentials to browser code or client logs.
- Enforce customer and workshop access with Row Level Security.
- Do not trust role values supplied by public signup metadata.
- Keep inventory movements auditable and append-only from the client.
- Keep support tickets and customer feedback private.
- Do not publish imported records unless the source license explicitly permits public display.
- Do not present third-party listings as QuickBay-verified partners.

## Data handling

Use synthetic or explicitly consented test data in development. Do not commit production database dumps, customer exports, workshop contact lists or screenshots containing personal information.
