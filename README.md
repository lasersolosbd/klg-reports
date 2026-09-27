# klg-reports

The recurring **monthly client report** front-end for Kind Logic Group's AI-visibility
service. Static site (no build step, no framework) served by Vercel at
`klg-reports.vercel.app`, routed as `/r/:token`.

It calls the same Supabase project (`shjzokwlgpxjxywgnpig`) and the same
`get_client_report(token)` RPC as the main funnel site
([`lasersolosbd/aeo-report-site`](https://github.com/lasersolosbd/aeo-report-site)'s
`/report/[token]` page), but is a separate, richer report surface built for paying
clients who get a report every two weeks/month, not the free/paid initial report shown
during signup. Distinct feature set from the funnel site's report page:

- Interactive to-do checklist synced across the client's team (`set_task_status`)
- "Rate this question" feedback (keep / reword / not-a-fit) via `save_question_feedback`
- "Suggest up to 3 of your own questions" box via `add_question_suggestion`
- Full competitor-naming matrix (`renderMatrix()`) — shows the top 3 orgs named per
  question/engine and ranks the client among them. This is the "who else did AI name"
  feature described in `claude/competitor-naming-feature-scope.md`; it is **already live
  here**, even though it was scoped as "not yet built" against `aeo-report-site` (it was
  built into this repo instead — see the project's `github-repos-and-site-layout.md`).

## Files

- `index.html` — shell + `<template id="tpl">` that `app.js` clones and fills in
- `app.js` — all rendering logic: gauge score, matrix, to-do list, question feedback,
  localStorage'd reviewer name (`klg-name`)
- `style.css` — navy/gold/teal theme, light + dark mode via `prefers-color-scheme`
- `vercel.json` — **reconstructed, not verified against the original deploy.** The live
  Vercel project (`prj_qfPQgciiyhqt7W9VZgP4rMjOfLFn`) had no connected Git repo when this
  was written, so its actual `vercel.json` (if any) couldn't be read directly — this one
  is written to match the routing (`/r/:token` → `index.html`) and privacy headers
  (`noindex`, `no-referrer`, `X-Frame-Options: DENY`) that were observed/described.
  **Diff it against the live deployment's behavior before assuming it's byte-for-byte
  identical**, and replace it once the real one can be pulled (e.g. via `vercel pull`
  once this repo is connected to the Vercel project).

## Provenance

This repo was created retroactively on 2026-09-27 to put this code under version control.
It did not previously exist in GitHub — the live Vercel project had no `framework`
detected and no linked repo, suggesting it was deployed directly (e.g. `vercel --prod`
from a local folder). `index.html`, `app.js`, and `style.css` are reconstructed from
content pasted into a Claude session by the site's maintainer; `vercel.json` above is a
best-effort reconstruction, not a byte-for-byte copy of whatever (if anything) was
actually deployed.

**Next step:** connect this repo to the existing Vercel project
`klg-reports`/`prj_qfPQgciiyhqt7W9VZgP4rMjOfLFn` so future deploys are Git-triggered
instead of directly pushed, and so `vercel.json` above can be reconciled against
whatever config (if any) is really live.
