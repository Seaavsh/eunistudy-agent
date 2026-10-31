import { connection, NextResponse } from 'next/server';

export async function GET() {
  await connection();
  const commit = process.env.RENDER_GIT_COMMIT;
  const revision = commit && /^[a-f0-9]{40,64}$/i.test(commit) ? commit : null;
  return NextResponse.json({ ok: true, revision }, { headers: { 'Cache-Control': 'no-store' } });
}
