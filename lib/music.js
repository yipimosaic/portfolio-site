import { defaultTracks } from '../app/music-defaults'

export async function readMusic(db) {
  const row = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind('music_playlist').first()
  return row ? JSON.parse(row.value) : defaultTracks
}

export function validPlaylist(tracks) {
  return Array.isArray(tracks) && tracks.length <= 50 && new Set(tracks.map(t => t?.id)).size === tracks.length && tracks.every(t =>
    t && typeof t.id === 'string' && t.id.length > 0 && t.id.length <= 100 &&
    typeof t.title === 'string' && t.title.trim().length > 0 && t.title.length <= 160 &&
    typeof t.artist === 'string' && t.artist.length <= 160 && typeof t.url === 'string' &&
    /^\/(?:media\/music\/[a-z0-9-]+|api\/media\/[a-f0-9-]{36})\.mp3$/.test(t.url))
}
