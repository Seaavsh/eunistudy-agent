# EUnistud development map

Use `D:\Project\EUnistud` as the working checkout. GitHub `Seaavsh/eunistudy-agent`, branch `main`, is the source for the Render demo. Do not assume copies or deploys match: run `npm run status:project`, compare the local commit with GitHub, and inspect the hosted `/api/health` revision. The `originMain` value reflects the last fetch and can be stale; a null revision means the deployed revision is unknown. Render provides `RENDER_GIT_COMMIT` at runtime.

The original local checkout and the published repository began with separate Git histories. If no upstream is configured or histories have diverged, inspect and preserve uncommitted changes before setting up tracking or merging. Never force-push, replace `.git`, or reset a checkout to make it match. Keep local `.env.local` and `data/` outside Git.

| Question | Start here |
| --- | --- |
| Chat request and results | `app/api/app/route.ts`; Gemini instructions: `lib/advisor-prompt.ts` |
| Profile extraction and confirmation | `lib/conversation-state.ts`; `tests/conversation-state.test.mjs` |
| Chat interface and browser storage | `app/page.tsx` |
| Germany and Italy source records | `vendor/deqar-germany.json`, `vendor/italy-2025.json`, `vendor/official-programmes.json`, `DATA-SOURCES.md` |
| Catalogue counts | `/api/catalogue-coverage`; local `npm run status:project` |
| Catalogue import and Render startup | `vendor/import-catalogue.cjs`, `vendor/bootstrap-render.cjs`, `render.yaml` |
| Budget and fit | `lib/automatic-budget.ts`, `lib/preference-fit.ts`, `lib/official-assessment.ts` |
| Hosted revision | `/api/health`; Render service deployment history |

Use focused searches, for example `rg -n 'canRecommend|confirmProfile' lib tests`. Avoid dumping whole files, generated data, browser trees, secrets or private profile contents into logs. Read the relevant code and reproduce the issue before changing it. Prefer small, behavior-preserving module extractions when a file is hard to navigate.

For chat changes, run `node --test tests/conversation-state.test.mjs`; for broader changes, run the relevant tests, `npx tsc --noEmit`, and `npm run build` when appropriate. Check the deployed commit and app behavior after deployment. Render's catalogue is reconstructed from bundled snapshots and is ephemeral; the Italian 2025/26 records are historical and German accreditation records do not establish current admission requirements.
