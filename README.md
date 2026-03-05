# hayetcreates-spotify-playlist-moodboard
## Playlist Moodboard (Spotify Web API) — WIP

## About
Hi! I’m Hayet and building a lightweight web app that lets users explore Spotify playlists in a more visual way.

I love Spotify because I use playlists to match my mood and routine (gym, commuting, studying), and I’ve always felt playlists have a strong “visual vibe” through cover art and album imagery. So the idea is simple: paste a playlist link/ID and generate a “moodboard” using the playlist cover + track details. I’m building the MVP first (clean UI + playlist fetch), then improving it step by step with optional insights and visual summaries.
## Planned features
- Pasting a Spotify playlist link/ID
- Showing playlist cover + title + basic info
- Displaying tracklist (first 10–50 tracks)
- Audio feature insights (energy, valence, danceability)
- Simple charts / visual summaries

## Tech stack (planned)
- Vite
- JavaScript / HTML / CSS
- Spotify Web API

## Status
- Sometimes Spotify blocks access (403) in development mode, even if login works. This happens depending on playlist permissions / app access.
- I added a Preview Mode so the moodboard UI still shows the concept and doesn’t stay empty if Spotify access is restricted.


## Roadmap
1.Setting up project structure + basic UI
2. Adding Spotify authentication (PKCE)
3. Fetching the playlists data + render tracklist
4. Adding audio features insights
5. Deploying and add live demo link
