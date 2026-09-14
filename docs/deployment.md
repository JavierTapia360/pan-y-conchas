# Deployment

Development, Preview and Production must use separate environment values. Never copy production payment or service-role credentials into Preview.

Automated CI runs asset/content checks, lint, TypeScript, tests and build. Deployment should depend on that job. Sites applies generated D1 migrations before Worker upload. Keep each applied migration and matching metadata immutable.

Production needs HTTPS, the chosen custom domain, `ADMIN_EMAILS`, database backups and approved legal/contact content. If email is enabled, configure sender-domain SPF/DKIM. If merch payments are enabled, verify provider webhooks and Apple Pay domain association in sandbox before live credentials.

For custom DNS, follow the hosting provider’s generated A/CNAME records rather than guessing registrar-specific values.
