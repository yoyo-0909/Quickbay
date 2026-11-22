# Contributing to QuickBay

Thank you for helping improve QuickBay. This repository is currently a hackathon and product-validation prototype. Contributions should make the product clearer, safer and easier to demonstrate without implying that prototype workflows are production services.

## Before you start

- Read the [README](README.md) for product scope and setup.
- Review [Architecture](docs/ARCHITECTURE.md) before changing application flows.
- Read [Data sourcing](DATA_SOURCING.md) before adding workshop records.
- Read [Supabase setup](SUPABASE_SETUP.md) before changing database-related code.

## Development principles

1. Keep the existing product UI consistent unless a task explicitly asks for a redesign.
2. Prefer focused changes that solve one problem at a time.
3. Preserve customer, workshop and admin access boundaries.
4. Treat public directory listings as unverified unless partner onboarding has been completed.
5. Use fictional customer and vehicle details in demonstrations.
6. Keep demo billing separate from real financial transactions.
7. Do not add payment gateways, banking credentials, UPI collection or payment processing as part of the hackathon prototype.
8. Never commit secrets, service-role keys, personal customer data or private business data.

## Suggested workflow

1. Create a focused branch from the active development branch.
2. Make the smallest coherent change.
3. Check the browser console and relevant user flow.
4. Run syntax checks for modified JavaScript files.
5. Update documentation when behaviour or setup changes.
6. Open a pull request with the reason for the change, a concise summary and test notes.

## Pull request checklist

- [ ] The change matches the current prototype scope.
- [ ] Existing workflows remain intact.
- [ ] Customer and workshop data access remains appropriately scoped.
- [ ] No secrets or private data were added.
- [ ] No payment processing or banking integration was introduced.
- [ ] Relevant manual or automated checks were completed.
- [ ] Documentation was updated where needed.

## Reporting a problem

Use the bug report template and include the page, steps to reproduce, expected behaviour and actual behaviour. Remove personal information and credentials from screenshots and logs.
