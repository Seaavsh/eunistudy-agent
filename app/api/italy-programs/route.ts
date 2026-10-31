import {NextRequest,NextResponse} from 'next/server';
import {db} from '@/lib/db';
type Value={value:string|null};
type Entry={id:string;fields:Record<string,Value>};
export async function GET(req:NextRequest){
 const params=req.nextUrl.searchParams;const q=(params.get('q')||'').trim().toLocaleLowerCase();const degree=params.get('degree')||'';const language=params.get('language')||'';const page=Math.max(1,Math.min(10000,Math.floor(Number(params.get('page'))||1)));
 const records=db.prepare("SELECT content FROM programme_catalog WHERE country=? AND kind=?").all('Italy','historical') as {content:string}[];
 const rows=records.map(row=>{const {id,fields:f}=JSON.parse(row.content) as Entry;return {id,title:f.title.value||'',university:f.university.value||'',subject:f.subject.value||'',level:f.degree.value||'',city:f.city?.value||'',language:f.language.value||'',academicYear:'2025/26'}}).filter(c=>(!degree||(degree==='Bachelor'?c.level==='Laurea':c.level.includes('Magistrale')))&&(!language||c.language.toLocaleLowerCase().includes(language.toLocaleLowerCase()))&&(!q||`${c.title} ${c.university} ${c.subject} ${c.city}`.toLocaleLowerCase().includes(q)));
 return NextResponse.json({total:rows.length,page,programs:rows.slice((page-1)*30,page*30),source:'Italian Ministry of Universities and Research (MUR), USTAT',sourceUrl:'https://ustat.mur.gov.it/opendata/',academicYear:'2025/26',notice:'Historical catalogue snapshot; availability, tuition, scholarships and requirements are unverified.'});
}
