# EQAR DEQAR programme accreditation metadata

Source: https://www.eqar.eu/qa-results/download-data-sets/ and https://backend.deqar.eu/static/daily-csv/deqar-reports.csv. Attribution: European Quality Assurance Register for Higher Education (EQAR), Database of External Quality Assurance Results (DEQAR), Open Data Commons Public Domain Dedication and Licence (PDDL): https://opendatacommons.org/licenses/pddl/1-0/.

The German import selects positive programme accreditation reports valid on the processing date, and deduplicates by institution, programme title and degree cycle. The report language is the language of the report, not the language of instruction. Accreditation is not proof that an application is open; tuition, teaching language, admission and scholarship details are unknown. Expired records are excluded from discovery at request time.

To refresh, download the CSV using the URL above, then run `python vendor/prepare-deqar.py path/to/deqar-reports.csv` followed by `node vendor/import-catalogue.cjs`. Back up the database before refresh. Rebuilding the catalogue preserves application state; it can invalidate changed embeddings.
