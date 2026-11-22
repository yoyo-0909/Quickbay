# QuickBay
Every Bay. Every Job. One Platform.

QuickBay is an India-focused automotive workshop marketplace and workshop operations workspace.

## Current build
This repository currently contains a responsive, browser-based MVP in `index.html`:
- Vehicle-owner dashboard, garage, workshop discovery shell and local booking requests
- Workshop OS with local bay management, job cards and repair-stage progression
- Partner onboarding and local admin application review
- Branded loading experience and responsive monochrome UI

## Important implementation boundaries
This is an MVP/demo frontend. Records are stored in browser localStorage and are not shared between users or devices. It does not provide production authentication, server-side authorization, a persistent database, live workshop discovery, OTP delivery, payment processing, SMS, live chat, or document verification.

Workshop discovery intentionally shows no invented listings. Configure a compliant licensed listing provider or onboard workshops with permission before publishing business data. The map is a geographic reference only.

Checkout/payment is not connected. Do not collect payment credentials or mark demo records as paid.

## Deploy
The project is a static site and can be deployed to Vercel with the repository root as the output.