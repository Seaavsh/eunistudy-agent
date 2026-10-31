import { DatabaseSync } from 'node:sqlite';
import { programs, guidance } from './data';
import path from 'node:path';
import fs from 'node:fs';
const dir=path.join(process.cwd(),'data');fs.mkdirSync(dir,{recursive:true});
const globalDb=globalThis as typeof globalThis & { eunistudDb?:DatabaseSync };
export const db=globalDb.eunistudDb ?? new DatabaseSync(path.join(dir,'eunistud.sqlite'));
globalDb.eunistudDb=db;
db.exec('PRAGMA busy_timeout=30000; PRAGMA secure_delete=ON');
db.exec(`CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,kind TEXT NOT NULL,content TEXT NOT NULL); CREATE VIRTUAL TABLE IF NOT EXISTS knowledge USING fts5(id UNINDEXED, content); CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
db.exec('BEGIN IMMEDIATE');
try{
 const insert=db.prepare('INSERT OR IGNORE INTO records VALUES(?,?,?)');
 for(const p of programs)insert.run(p.id,'program',JSON.stringify(p));
 for(const g of guidance)insert.run(g.id,'guidance',JSON.stringify({...g,checked:'2026-10-31'}));
 insert.run('agency-faq','faq',JSON.stringify({id:'agency-faq',text:'EUnistud is a fictional demonstration agency. It helps students explore programs, prepare a shortlist, and understand application steps. It does not submit applications or guarantee admission.'}));
 const hasUniversity=db.prepare("SELECT 1 AS present FROM records WHERE kind='university' LIMIT 1").get();
 const directoryPath=path.join(process.cwd(),'vendor','hipo-universities.json');
 if(!hasUniversity&&fs.existsSync(directoryPath)){const entries=JSON.parse(fs.readFileSync(directoryPath,'utf8')) as {name:string;country:string;domains:string[];web_pages:string[]}[];entries.filter(e=>['Germany','Italy','Canada'].includes(e.country)).forEach((e,i)=>insert.run(`hipo-${i}`,'university',JSON.stringify({...e,source:'https://github.com/Hipo/university-domains-list',provenance:'Hipo university directory; program data not included.'})))}
 if(!(db.prepare('SELECT count(*) AS n FROM knowledge').get() as {n:number}).n){const add=db.prepare('INSERT INTO knowledge VALUES(?,?)');for(const row of db.prepare('SELECT id,content FROM records').all() as {id:string;content:string}[])add.run(row.id,row.content)}
 db.exec('COMMIT');
}catch(e){db.exec('ROLLBACK');throw e}
export function readState(key:string,fallback:unknown){const row=db.prepare('SELECT value FROM state WHERE key=?').get(key) as {value:string}|undefined;return row?JSON.parse(row.value):fallback}
export function writeState(key:string,value:unknown){db.prepare('INSERT OR REPLACE INTO state VALUES(?,?)').run(key,JSON.stringify(value))}
export function searchKnowledge(query:string){const words=query.toLowerCase().match(/[a-z]{3,}/g)?.slice(0,8);if(!words?.length)return [];try{return db.prepare("SELECT records.content FROM knowledge JOIN records ON knowledge.id=records.id WHERE knowledge MATCH ? AND records.kind IN ('guidance','faq') LIMIT 8").all(words.map(w=>`"${w}"`).join(' OR ')).map(row=>JSON.parse(String(row.content)))}catch{return []}}
