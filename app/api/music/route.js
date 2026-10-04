import { getDatabase } from '../../../lib/projects'
import { readMusic } from '../../../lib/music'
export const dynamic = 'force-dynamic'
export async function GET() {
  try { return Response.json({ tracks: await readMusic(getDatabase()) }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return Response.json({ error: '音乐列表暂时无法读取。' }, { status: 503 }) }
}
