# Dexplora — Staging / Preview workflow

Production branch: **master**. Testing branch: **staging**.

## Goal

Develop and test new features in staging without changing the production website or production MongoDB records. Every `staging` push should build as a Vercel Preview deployment **if** GitHub integration and branch deployment rules permit it.

## Already prepared in GitHub

- The `staging` branch has been created from `master`.
- `.env.staging.example` documents environment variable names without credentials.
- This staging guide is versioned with the branch.

## Vercel configuration to complete

The Vercel team/project is managed separately from GitHub. A GitHub branch alone does not create production isolation or prove a preview deployment worked.

1. Open the Vercel project linked to `AMNAS-skylora/dexplora`.
2. Confirm Git integration is enabled, production branch is **master**, and Preview deployments are enabled for the **staging** branch.
3. In **Project → Settings → Environment Variables**, assign staging-only variables to the `staging` branch's Preview environment. Do not overwrite production values.
4. Use a **different MongoDB database (and preferably a different database user)** for staging. Do not reuse production `MONGODB_URI`. Configure `MONGODB_URI` and any database-name variable that the current code actually reads.
5. Configure a distinct `JWT_SECRET`; leave `EMAIL_AUTOMATION_ENABLED=false` and `WHATSAPP_AUTOMATION_ENABLED=false`.
6. Trigger a staging deployment by pushing a commit to `staging`. Open its preview URL and verify it really uses staging data.
7. Restrict the staging URL with Vercel Deployment Protection if the admin UI or testing data should be private.

**Important:** `NEXT_PUBLIC_SITE_URL` must point to the staging URL if testing brand links; it must not point to production. Do not paste passwords into source or documentation.

## Release workflow

1. Create working branches from `staging` or target a feature PR into `staging`.
2. Test **Create Package → Add multiple same-day Departures → Set separate Rates/Seats → Save → Reload → Book → Sold Out** in the staging database.
3. Review deployment logs and fix errors before production release.
4. Merge the tested staging changes to **master** only after checks and approval. Do not automatically promote staging to production.
5. Validate the production deployment and watch error logs.

## Current limitations

The GitHub branch and example configuration are ready, but Vercel-specific Environment Variables, deployment protection and the isolated database cannot be configured without authorized access to the Vercel project and MongoDB staging credentials. Until then staging may deploy against missing or production environment variables; avoid submitting or changing live data.
