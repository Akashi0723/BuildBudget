# Estimating method and limits

BuildBudget PH currently uses an educational, unapproved demonstration rate schedule, `PH-DEMO-2026-10-09-v1`, dated **9 October 2026**. These figures are product assumptions; they are not verified Philippine market rates, supplier quotations, official government rates, or professional advice.

The supported scopes are a conventional low-rise new house, and a cosmetic, nonstructural renovation. Floor area is the sum of one to three entered floor areas, each 10–500 square metres. The entered location and finish remain visible in every saved report.

| Finish | Base PHP / square metre |
| --- | ---: |
| Basic | 22,000 |
| Standard | 30,000 |
| Premium | 42,000 |

Metro Manila applies a factor of 1.10 and Cebu applies 1.05. Davao and all other provinces use 1.00. City selection does not alter rates. Cosmetic renovation applies an additional factor of 0.55. This simplified factor is unsuitable for structural alterations, demolition, defects, or unknown existing conditions.

The adjusted rate equals the finish rate × location factor × scope factor. The base equals summed floor area × adjusted rate. Additional allowance is added once, and contingency (0–20%) applies to the base plus that allowance. Calculations use integer centavos. The low/high display is the total ×0.85/×1.15, an illustrative scenario range and **not** a probability or confidence interval.

The rate already includes labor, supervision, electrical/plumbing work, and contractor overhead. Category percentages of the base are 35% structure/civil, 25% finishes, 20% labor/supervision, 12% electrical/plumbing, and 8% site/overhead. These percentages are illustrative allocations, not quantities; no separate labor markup is added. The final category receives any centavo rounding residual. Allowance and contingency appear separately so category totals equal the estimate.

Land, financing, outside taxes, professional fees, permits, surveys, utility connections, furniture, appliances, specialist systems, major landscaping, unusual ground conditions, demolition, and structural remediation are excluded unless consciously covered by the user's additional allowance. All reports retain the assumptions, exclusions, model version, estimate date, and project inputs.

## Functional and security boundaries

The server validates every estimate and recomputes it when saving. User-provided totals are never trusted. Estimates can be calculated without an account; saved projects and PDF reports require an account. SQLite persists users, hashed sessions, login attempt limits, and saved estimate snapshots in `.data/buildbudget.sqlite`, or `BUILDBUDGET_DATA_DIR`. Back up that directory and use durable storage before deployment.

Passwords use a randomly salted scrypt hash. Sessions use 32 random bytes, store only their SHA-256 hash, expire after seven days, and use HttpOnly, SameSite=Lax cookies (Secure in production). Every saved project read, rename, delete, and report download includes the authenticated owner's ID in its database lookup. Parameterized queries prevent SQL injection. JSON-only writes check Origin and Fetch Metadata; invalid cross-origin mutations are rejected. Five login attempts per email per 15-minute window prevent simple credential guessing. This local limit does not replace edge rate limiting or production abuse monitoring.

Local account registration is available without email verification; no verification or reset email is claimed or sent. The prototype has no roles, administrator interface, paid processing, cloud sharing, email delivery, or multi-host database coordination. Current accounts cannot automatically verify ownership of an email address. Add an actual verification/reset provider and abuse controls before a public account launch.

Project PDFs are generated from the saved server snapshot and include provenance and limitations. They are preliminary planning documents, not signed bills of quantities, contracts, structural designs, or building-permit submissions. Seek licensed Philippine professional review and current, site-specific quotations before committing funds.

OWASP ASVS provides a useful verification framework, but this prototype has not undergone an independent ASVS audit. Any public deployment must establish appropriate consent, privacy notice, lawful processing, access/correction/deletion workflows, retention, backups, incident response, and processor agreements under the Philippine Data Privacy Act. Saving an account and project stores the user's name, email, password hash, and entered project information. No claimed legal compliance follows from implementing this demo.
