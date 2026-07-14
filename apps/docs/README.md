# Commons Docs

Docs microsite — Fumadocs, Phase 3. Will live at commonsui.com.

## Analytics

Fathom Analytics is build-time opt-in. Local builds and downstream forks do
not include an analytics script unless `NEXT_PUBLIC_FATHOM_SITE_ID` is set.
The production workflow reads that value from the public GitHub Actions
repository variable `FATHOM_SITE_ID`.

In Fathom, configure the site's Allowed Domains firewall to allow only
`commonsui.com`. Preview domains, localhost, and downstream deployments will
then be rejected even if they serve a production-built artifact.
