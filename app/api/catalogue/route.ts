import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {normaliseOfficial} from '@/lib/catalogue-model';
import fs from 'node:fs';
import path from 'node:path';
export async function GET(req:NextRequest){const country=req.nextUrl.searchParams.get('country')||'';const rows=db.prepare("SELECT content FROM records WHERE kind = 'verified_program'").all() as {content:string}[];const file=path.join(process.cwd(),'data','source-observations.json');let observations:Record<string,{changed?:boolean;error?:string}>={};try{if(fs.existsSync(file))observations=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}const programmes=rows.map(row=>normaliseOfficial(JSON.parse(row.content))).filter(p=>!country||p.country.value===country).map(p=>({...p,reviewRequired:observations[p.id]?.changed===true||Boolean(observations[p.id]?.error)}));return NextResponse.json({programmes,total:programmes.length})}
