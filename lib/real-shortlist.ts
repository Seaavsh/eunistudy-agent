import {db,readState,writeState} from './db';
import {assessOfficial} from './official-assessment';
import {needsSourceReview} from './source-health';
import fs from 'node:fs';import path from 'node:path';
export type SavedReal={tuitionAmount?:number|null;id:string;title:string;institution:string;degree:string;country:string;language:string|null;source:string;available:boolean;tuition:string|null;requirements:string|null;scholarships:string|null;checkedAt:string|null;reviewRequired:boolean;historical:boolean};
export function realShortlistIds():string[]{const stored=readState('realShortlist',[]);return Array.isArray(stored)?stored.filter((v):v is string=>typeof v==='string'):[]}
export function resolveReal(id:string):SavedReal|null{
 const row=db.prepare('SELECT content FROM programme_catalog WHERE id=?').get(id) as {content:string}|undefined;
 if(row){const p=JSON.parse(row.content) as {id:string;country:string;type:string;source:{url:string;checkedAt?:string};fields:Record<string,{value:string|null}>};const historical=p.type==='historical'||p.type==='accreditation';const reviewRequired=historical||needsSourceReview(p.id,p.source.checkedAt||'');return {tuitionAmount:reviewRequired?null:assessOfficial(p.id,{}).tuition,id:p.id,title:p.fields.title?.value||'Unknown',institution:p.fields.university?.value||'Unknown',degree:p.fields.degree?.value||'Unknown',country:p.country,language:p.fields.language?.value||null,source:p.source.url,available:true,tuition:reviewRequired?null:p.fields.tuition?.value||null,requirements:reviewRequired?null:p.fields.requirements?.value||null,scholarships:reviewRequired?null:p.fields.scholarships?.value||null,checkedAt:p.source.checkedAt||null,reviewRequired,historical}}
 if(id.startsWith('mur-')||id.startsWith('de-')||id.startsWith('it-'))return null;
 const file=path.join(process.cwd(),'vendor','duo-active.json');if(!fs.existsSync(file))return null;
 const rows=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')) as {id:string;title:string;institution:string;degree:string;country:string;source:string}[];const p=rows.find(row=>row.id===id);return p?{...p,language:null,available:true,tuition:null,requirements:null,scholarships:null,checkedAt:null,reviewRequired:true,historical:true}:null;
}
export function savedRealPrograms():SavedReal[]{return realShortlistIds().map(id=>resolveReal(id)||{id,title:'Programme no longer in local catalogue',institution:'Unknown',degree:'Unknown',country:'Unknown',language:null,source:'',available:false,tuition:null,requirements:null,scholarships:null,checkedAt:null,reviewRequired:true,historical:true})}
export function toggleRealProgram(id:string){const ids=realShortlistIds();if(ids.includes(id)){writeState('realShortlist',ids.filter(x=>x!==id));return savedRealPrograms()}if(ids.length>=100)throw new Error('Shortlist limit reached');if(!resolveReal(id))throw new Error('Programme is not in the catalogue');writeState('realShortlist',[...ids,id]);return savedRealPrograms()}
