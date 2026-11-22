# Security policy

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Contact the repository owner privately through the GitHub profile and include:

- A concise description of the issue.
- Affected file, endpoint or workflow.
- Reproduction steps and impact.
- A suggested mitigation, if known.

Do not include real customer data, passwords, tokens or service-role credentials in a report.

## Security expectations

- Never commit secrets or privileged Supabase credentials.
- Keep service-role operations server-side.
- Enforce access through database policies, not UI visibility.
- Scope customer records to their owner and workshop records to approved membership.
- Review SQL migrations before applying them to a connected database.
- Use dedicated test accounts and non-production records.

## Current status

The default-branch setup describes a Supabase integration scaffold. Do not assume production security has been verified until a live test project, authentication flows and Row Level Security policies have been exercised.
