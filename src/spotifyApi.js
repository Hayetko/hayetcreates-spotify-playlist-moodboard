// Base URL for Spotify Web API
const API_BASE = "https://api.spotify.com/v1";

// I'm using a helper function to fetch JSON from Spotify API with Authorization header
// token = your access token after login (so Spotify knows who you are)
async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // If an error occurs it will be shown
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}

// I'm using this function to accept different playlist inputs:
export function extractPlaylistId(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;

  // Case One: spotify:playlist:ID
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Case Two: any URL that contains, playlist/ID 
  const urlMatch = trimmed.match(/\/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  // Case Three: the user pasted only the playlist ID
  if (/^[a-zA-Z0-9]{10,}$/.test(trimmed)) return trimmed;

  // If nothing matched, then the input isn't a valid playlist link/ID
  return null;
}

// I'm using this function to fetch playlist metadata:
// cover image, playlist name, owner, etc
export async function getPlaylist(playlistId, token) {
  return apiGet(`/playlists/${playlistId}`, token);
}

// I'm using this function to fetch playlist tracks (this is more reliable than using playlist.tracks.items)
export async function getPlaylistTracks(playlistId, token, limit = 50, offset = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiGet(`/playlists/${playlistId}/tracks?${params.toString()}`, token);
}

// I'm using this function to fetch audio features for multiple tracks:
// energy, valence, danceability, etc.
export async function getAudioFeaturesForTracks(trackIds, token) {
  // Spotify allows up to 100 track IDs at once
  const ids = trackIds.filter(Boolean).slice(0, 100);

  // If there are no tracks -  just return an empty list
  if (!ids.length) return { audio_features: [] };

  const params = new URLSearchParams({ ids: ids.join(",") });
  return apiGet(`/audio-features?${params.toString()}`, token);
}
