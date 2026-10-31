import {subjectMatches} from './subject-matching';
import {db} from './db';
import path from 'node:path';
type Profile={degree?:string;subject?:string;studyLanguage?:string};
type Stored={id:string;source:{url:string};fields:{title:{value:string};university:{value:string};degree:{value:string};language:{value:string|null}}};
type VectorRow={content:string;vector:string};
let extractorPromise:Promise<(text:string,opts:{pooling:'mean';normalize:true})=>Promise<{data:ArrayLike<number>}>>|undefined;
async function extractor(){if(!extractorPromise){extractorPromise=(async()=>{const lib=await import('@huggingface/transformers');lib.env.cacheDir=path.join(process.cwd(),'data','models');lib.env.allowRemoteModels=false;return await lib.pipeline('feature-extraction','Xenova/multilingual-e5-small',{dtype:'q8'}) as unknown as (text:string,opts:{pooling:'mean';normalize:true})=>Promise<{data:ArrayLike<number>}>})();}try{return await extractorPromise}catch(e){extractorPromise=undefined;throw e}}
export async function semanticItalian(message:string,profile:Profile){
 const ignored=new Set(['italy','italian','study','master','masters','bachelor','programme','programmes','program','programs','university','universities','please','would','like','find','want','english','degree','course','courses','available','looking','with','hello','help']);const words=(message+' '+(profile.subject||'')).toLowerCase().match(/[a-zà-ÿ]{4,}/g)||[];if(!words.some(word=>!ignored.has(word)))return [];
 const embed=await extractor();const result=await embed(`query: ${message} ${profile.subject||''}`,{pooling:'mean',normalize:true});const query=Array.from(result.data);
 const rows=db.prepare("SELECT c.content,e.vector FROM programme_embeddings e JOIN programme_catalog c ON c.id=e.id WHERE c.country='Italy' AND c.kind='historical' AND e.model=? AND (?='' OR (?='Bachelor' AND json_extract(c.content,'$.fields.degree.value')='Laurea') OR (?='Master' AND json_extract(c.content,'$.fields.degree.value') LIKE '%Magistrale%'))").all('multilingual-e5-small-q8',profile.degree||'',profile.degree||'',profile.degree||'') as VectorRow[];
 const language=profile.studyLanguage||(/(?:english[ -]taught|in english|english.only)/i.test(message)?'English':'');const requiredLanguage=language==='English'?'inglese':language==='Italian'?'italiano':language==='German'?'tedesco':'';
 const scored=rows.map(row=>{const p=JSON.parse(row.content) as Stored;const vector=JSON.parse(row.vector) as number[];let score=0;for(let i=0;i<query.length&&i<vector.length;i++)score+=query[i]*vector[i];return {p,score}}).filter(x=>x.score>=0.76&&subjectMatches(x.p.fields.title.value,profile.subject==='Computer Engineering'?profile.subject:'')&&(!requiredLanguage||(x.p.fields.language.value||'').toLowerCase()===requiredLanguage)).sort((a,b)=>b.score-a.score).slice(0,12);
 return scored.map(({p})=>({id:p.id,title:p.fields.title.value,institution:p.fields.university.value,degree:p.fields.degree.value,country:'Italy',language:p.fields.language.value,source:p.source.url}));
}


