import csv,json,hashlib,sys
from datetime import date
from pathlib import Path
entries={}
if len(sys.argv)!=2: raise SystemExit('Usage: python vendor/prepare-deqar.py path/to/deqar-reports.csv')
checked=date.today().isoformat()
with open(sys.argv[1],encoding='utf-8-sig',newline='') as f:
 for r in csv.DictReader(f):
  if r['country']!='Germany' or not r['programme_name'] or r['report_valid_to']<checked or not r['report_decision'].startswith('positive'): continue
  level={'first cycle':'Bachelor','second cycle':'Master'}.get(r['programme_qf_ehea_level'])
  if not level: continue
  key=(r['hei_deqar_id'],r['programme_name'].strip(),level)
  if key in entries and entries[key]['validUntil']>=r['report_valid_to']:continue
  entries[key]={'id':'deqar-'+hashlib.sha256('\0'.join(key).encode()).hexdigest()[:20],'title':key[1],'university':r['hei_name'].strip(),'degree':level,'source':r['report_url'],'validUntil':r['report_valid_to'],'checkedAt':checked}
p=Path(__file__).resolve().parent/'deqar-germany.json';p.write_text(json.dumps(list(entries.values()),ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('Prepared',len(entries),'deduplicated German records')
