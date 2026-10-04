import { getDatabase } from '../../../../lib/projects'
import { readMusic, validPlaylist } from '../../../../lib/music'
import { isAdmin, denied } from '../../../../lib/admin-auth'
export const dynamic = 'force-dynamic'
export async function GET(request) {
  if (!isAdmin(request.headers)) return denied()
  try { return Response.json({ tracks: await readMusic(getDatabase()) }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return Response.json({ error: '音乐列表读取失败，请刷新重试。' }, { status: 503 }) }
}
export async function PUT(request) {
  if (!isAdmin(request.headers)) return denied()
  let tracks
  try { ({ tracks } = await request.json()) } catch { return Response.json({ error: '音乐资料格式不正确。' }, { status: 400 }) }
  if (!validPlaylist(tracks)) return Response.json({ error: '请填写歌名并上传 MP3，最多保存 50 首。' }, { status: 400 })
  try {
    await getDatabase().prepare('INSERT INTO site_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('music_playlist', JSON.stringify(tracks)).run()
    return Response.json({ tracks })
  } catch { return Response.json({ error: '音乐保存失败，请重试。' }, { status: 503 }) }
}
