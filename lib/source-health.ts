import fs from 'node:fs';
import path from 'node:path';
export function needsSourceReview(id:string,checked:string,now=new Date()):boolean{
 const date=new Date(`${checked}T00:00:00Z`);if(!Number.isFinite(date.getTime())||date>now||(now.getTime()-date.getTime())/86400000>180)return true;
 try{const file=path.join(process.cwd(),'data','source-observations.json');if(!fs.existsSync(file))return false;const rows=JSON.parse(fs.readFileSync(file,'utf8')) as Record<string,{changed?:boolean;error?:string}>;return rows[id]?.changed===true||Boolean(rows[id]?.error)}catch{return true}
}
