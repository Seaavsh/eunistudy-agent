# EUnistud local demo

Run `npm run status:project` for a read-only summary of the local revision and catalogue. The hosted `/api/health` reports its Render Git revision when available. See `docs/agent-workflow.md` for the project map and checkout workflow.

## Render demonstration

The `render.yaml` Blueprint creates a free Node web service. Set `GEMINI_API_KEY` and a long, random `EUNISTUD_DEMO_PASSWORD` in Render's environment settings; neither secret belongs in Git. The demo uses the username `demo` and the configured password. The Blueprint uses the same Gemini model as the existing local configuration, and `GEMINI_MODEL` can be changed in Render if needed. Gemini usage may incur charges under the connected Google Cloud project.

The hosted demo keeps profiles, conversations and shortlists in the visitor's browser; they do not sync between devices. Clearing browser storage deletes them. The catalogue is rebuilt from the bundled public snapshots on every service start because Render Free has ephemeral storage. Italian 2025/26 records are historical; accreditation does not confirm current admissions, teaching language, fees or requirements. The free instance can sleep when idle. Semantic retrieval is disabled in the hosted demo; keyword search remains available. The demo password provides shared access only; it is not an account system or production security.

The existing Windows local mode continues to store state in its local SQLite database. Do not run `npm run start:render` against the local database: that command rebuilds catalogue and search tables.

An English, chat-first study exploration demo for one local user. University identities are real; program details and admission estimates are generated examples. This is not a source of verified admissions or immigration advice.

## Start on Windows

1. Install a current Node.js version with `node:sqlite` support (the project was prepared with Node 25).
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your Google AI Studio API key. Never share or commit that file. The model can be changed with `GEMINI_MODEL`.
3. Double-click `start.bat`, or run `npm install` and `npm run dev -- --hostname 127.0.0.1` in PowerShell. Open http://127.0.0.1:3000.
4. Use a fictional sample profile, chat with the advisor, explore programs, save a shortlist, compare and export it.

Google limits unpaid Gemini usage and restricts submitting personal information to unpaid services. Use only fictional inputs with the free tier. Google’s terms require paid services for API clients made available in the EEA, Switzerland or UK. Check https://ai.google.dev/gemini-api/terms and project model/quota availability. This app does not enable billing.

The API key stays server-side; data is stored in `data/eunistud.sqlite` on this PC. There is no user authentication: do not expose the app to a network. To reset the demo, stop the server and remove that database. `DATA-SOURCES.md` documents provenance and scoring. External APIs may be unavailable; exchange rates use cached data when available, otherwise conversion is unavailable. Gemini has no offline conversational fallback.

## Programme catalogue import

Run `node vendor/import-catalogue.cjs` from the project directory to rebuild the dedicated catalogue and full-text index from the bundled Italian 2025/26 snapshot and the sourced-programme seed. The importer validates input before replacing catalogue data in a transaction. The snapshot is historical and is not evidence that admissions are open; missing tuition, scholarships, deadlines and requirements stay unknown. The command does not fetch newer data automatically.


## Check or refresh Italian source

Run `powershell -ExecutionPolicy Bypass -File vendor/refresh-italy.ps1 -CheckOnly` to validate the official source without changing data. Omit `-CheckOnly` to import the validated 2025 cohort; a previous snapshot is retained. If the ministry publishes a newer cohort or changes its schema, the script stops so the import can be reviewed. This refresh does not verify live admissions, fees or scholarships.


## Check official programme sources

Run `node vendor/audit-sources.cjs` to fetch the six official programme pages and compare them with the last observation. Changed or unavailable pages are flagged for review in Verified assessments. This is a content-change signal, not confirmation that requirements or fees are current; it does not reset the verified date. It does not automatically extract or modify programme facts.


## Local semantic search

The app uses the local multilingual-e5-small model and a local SQLite vector index alongside keyword search. On first setup or after catalogue changes, run `node vendor/build-semantic-index.cjs` to build missing vectors; the first run downloads the free model to `data/models`. Programme queries are embedded locally. If the model or index is unavailable, chat falls back to keyword search. Source records are historical and similarity does not establish admission eligibility. The Italian refresh invalidates changed vectors and attempts to rebuild them. Model: https://huggingface.co/Xenova/multilingual-e5-small

