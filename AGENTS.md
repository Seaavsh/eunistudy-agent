<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## EUnistud workflow

- Treat `D:\Project\EUnistud` as the intended working checkout. Check its Git status and the deployed revision before editing or diagnosing a deployment issue. Preserve uncommitted work and ignored local data.
- Run `npm run status:project` for a compact, read-only local summary. Compare its commit with `/api/health` on the hosted service and the GitHub branch before drawing conclusions. An unknown revision is not proof that versions match.
- Start with the relevant paths in `docs/agent-workflow.md`; search narrowly with `rg` and limit tool output. Do not read or print API keys, conversations, local profiles, or entire data snapshots.
- Confirm the failing behaviour and identify which copy is running before changing code. Check only the relevant tests first, then run the checks required for the change.
- The local SQLite database and `.env.local` are private local state. Never commit them or run the Render bootstrap against the local database.
