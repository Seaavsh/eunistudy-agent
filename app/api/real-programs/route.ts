import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
type Row={id:string;title:string;institution:string;degree:string;country:string;source:string};
let cached:Row[]|undefined;
function records(){if(!cached){const raw=JSON.parse(fs.readFileSync(path.join(process.cwd(),'vendor','duo-active.json'),'utf8')) as Row[];const unique=new Map<string,Row>();for(const row of raw)if(row.id&&row.title&&row.institution&&!unique.has(row.id))unique.set(row.id,row);cached=[...unique.values()]}return cached}
export async function GET(req:NextRequest){const q=(req.nextUrl.searchParams.get('q')||'').trim().toLowerCase();const degree=(req.nextUrl.searchParams.get('degree')||'').toUpperCase();const page=Math.max(1,Math.floor(Number(req.nextUrl.searchParams.get('page'))||1));const matches=records().filter(r=>(!degree||r.degree===degree)&&(!q||`${r.title} ${r.institution}`.toLowerCase().includes(q)));return NextResponse.json({total:matches.length,page,programs:matches.slice((page-1)*30,page*30),source:'DUO higher education programme register',sourceUrl:'https://data.overheid.nl/dataset/ho_opleidingsoverzicht',snapshotDate:'2026-10-31',notice:'Registration dates do not confirm that applications are open. Tuition, scholarships and admission requirements are not provided in this extract.'})}
