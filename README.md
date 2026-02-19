# hayetcreates-spotify-playlist-moodboard
## Playlist Moodboard (Spotify Web API) — WIP

## About
I plan to build a lightweight web app that lets users explore Spotify playlists in a more visual way.  
The main idea is to paste a playlist link/ID and display it as a “moodboard” using cover art + track details, and then (optionally) add simple audio-feature insights.

I enjoy Spotify and I also enjoy experimenting with creative coding and UI, so this is a project where I can combine both.  
I’m building the MVP first (clean UI + playlist fetch), then I’ll improve it step by step.

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
- [ ] Setting up project structure + basic UI
- [ ] Adding Spotify authentication (PKCE)
- [ ] Fetching the playlists data + render tracklist
- [ ] Adding audio features insights
- [ ] Deploying and add live demo link
