# BuildBudget PH

A responsive, functional construction-planning MVP for Filipino homeowners. It includes a guided estimator, transparent budget breakdown, scenario optimizer, budget-to-build planner, five scoped material calculators, private saved projects, and server-generated PDF reports.

## Run locally

Use **Node.js 24** (the SQLite backend requires the built-in `node:sqlite` module).

```sh
npm ci
npm run dev
```

The development server runs on port 3000. Use `npm run build` followed by `npm start` for a production-mode server. No external keys, database account, or email service is needed for the demo. Fonts and the generated architectural illustration are bundled locally.

Create your own demo account when saving a project. New accounts start with no projects. Passwords must contain at least 10 characters. Guest estimates are kept only in the current browser tab; saved projects and reports require a server-authenticated account.

## Verify

```sh
npm run typecheck
npm test
npm run test:e2e
```

The five unit tests verify calculations, input bounds, centavo rounding, category totals, and rate provenance. Playwright tests exercise the actual HTTP API and full browser workflow, including authentication, project ownership, reports, optimization, material formulas, failure states, and mobile layouts. The test server uses port 3100, `.next-e2e`, and a separate disposable database under `/tmp`. Playwright uses system Chromium by default; set `CHROMIUM_PATH` to another compatible executable if needed. Do not run multiple Playwright invocations on port 3100 simultaneously.

## Storage and configuration

The default database is `.data/buildbudget.sqlite`. SQLite saves users, hashed sessions, and original estimate snapshots across process restarts. `.data` is ignored by Git and must remain private. `BUILDBUDGET_DATA_DIR` selects another directory; use durable storage and a tested backup/restore process before deployment. `BUILDBUDGET_NEXT_DIST_DIR` optionally isolates development/test build output. Keep the default `.next` directory when running a production build and server.

Only the database belongs to persistent application state. Live servers must be restarted in restored cloud environments. Use the existing checkout in the isolated cloud task; there is no need to create a worktree.

## Estimation and limitations

Read [the estimating method](docs/METHOD.md) for the documented formula, inclusions, exclusions, demonstration rate version, scope limits, and security boundaries. Rates and category allocations are **educational assumptions**, not current market data or measured bills of quantities. The ±15% range is an exploration scenario, not an accuracy guarantee. Estimates do not replace licensed professional review, signed/sealed documents, or permits.

This is a tested MVP, not a certified production service. Email verification/reset, paid checkout, consultations, professional verification, and administrator rate management are marked upcoming; they do not simulate successful real services. Production still needs verified Philippine rate data, durable deployment infrastructure, email/account recovery, operational abuse controls, backups, and privacy rights processes. The privacy notice explains data collected, project deletion, and those limitations. No OWASP ASVS certification or legal compliance claim is made.
