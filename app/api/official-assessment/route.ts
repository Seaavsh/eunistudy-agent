import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { safeAssessment } from '@/lib/safe-assessment';
import { preferenceFit } from '@/lib/preference-fit';
export async function POST(req:NextRequest){try{const {profile}=await req.json();const rows=JSON.parse(fs.readFileSync(path.join(process.cwd(),'vendor','official-programmes.json'),'utf8')) as {id:string;country:string;degree:string;language:string;checked:string}[];return NextResponse.json({programs:rows.filter(p=>!profile?.destination||p.country===profile.destination).map(p=>{const assessment=safeAssessment(p.id,p.checked,profile||{});return {...p,assessment,fit:preferenceFit(p,profile||{},assessment.reviewRequired)}})})}catch{return NextResponse.json({error:'Could not assess official programmes.'},{status:500})}}

