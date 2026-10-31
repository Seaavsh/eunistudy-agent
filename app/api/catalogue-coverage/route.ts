import {NextResponse,connection} from 'next/server';
import {db} from '@/lib/db';

export async function GET(){ await connection();
 const rows=db.prepare(`SELECT country,kind,CASE WHEN kind='accreditation' THEN 'EQAR DEQAR' ELSE json_extract(content,'$.source.url') END AS source,json_extract(content,'$.source.publishedPeriod') AS period,COUNT(*) AS count FROM programme_catalog GROUP BY country,kind,source,period ORDER BY country,kind`).all();
 return NextResponse.json({groups:rows,total:rows.reduce((sum,row)=>sum+Number(row.count),0)});
}
