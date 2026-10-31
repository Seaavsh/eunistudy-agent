import {subjectMatches} from './subject-matching';
import {db} from './db';
type Profile={degree?:string;subject?:string;studyLanguage?:string};
type Stored={id:string;source:{url:string};fields:{title:{value:string};university:{value:string};degree:{value:string};language:{value:string|null}}};
const stop=new Set(['italy','italian','study','master','masters','bachelor','programme','programmes','program','programs','university','universities','please','would','like','find','want','english','degree','course','courses','available','looking','with','science']);
export function retrieveItalian(message:string,profile:Profile){
 const text=`${message} ${profile.subject||''}`.toLowerCase();let terms=(text.match(/[a-zà-ÿ]{4,}/g)||[]).filter(t=>!stop.has(t));
 if(/comput|computer|informat|software/.test(text))terms=['informat','computer','computing','software'];else if(/engineer|ingegner/.test(text))terms=['ingegner','engineering'];else if(/business|econom/.test(text))terms=['business','econom','management'];
 terms=[...new Set(terms)].slice(0,8);if(!terms.length)return [];
 const query=terms.map(t=>`"${t.replaceAll('"','')}"*`).join(' OR ');
 const language=profile.studyLanguage||(/(?:english[ -]taught|in english|english.only)/i.test(message)?'English':'');const requiredLanguage=language==='English'?'inglese':language==='Italian'?'italiano':language==='German'?'tedesco':'';
 const matches=db.prepare(`SELECT c.content FROM programme_search s JOIN programme_catalog c ON c.id=s.id WHERE programme_search MATCH ? AND c.country='Italy' AND c.kind='historical' AND (?='' OR (?='Bachelor' AND json_extract(c.content,'$.fields.degree.value')='Laurea') OR (?='Master' AND json_extract(c.content,'$.fields.degree.value') LIKE '%Magistrale%')) AND (?='' OR lower(json_extract(c.content,'$.fields.language.value'))=?) ORDER BY bm25(programme_search,0,5,1,2,1) LIMIT 12`).all(query,profile.degree||'',profile.degree||'',profile.degree||'',requiredLanguage,requiredLanguage) as {content:string}[];
 return matches.filter(row=>subjectMatches((JSON.parse(row.content) as Stored).fields.title.value,profile.subject==='Computer Engineering'?profile.subject:'')).map(row=>{const p=JSON.parse(row.content) as Stored;return {id:p.id,title:p.fields.title.value,institution:p.fields.university.value,degree:p.fields.degree.value,country:'Italy',language:p.fields.language.value,source:p.source.url}});
}
