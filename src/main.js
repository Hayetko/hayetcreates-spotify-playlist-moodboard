// Importing my CSS styling
import "./style.css";

// Importing Spotify auth functions (login + token handling)
import { loginWithSpotify, handleSpotifyCallback, getAccessToken, logout } from "./spotifyAuth.js";

// Importing Spotify API helper functions (playlist fetch + track fetch)
import { extractPlaylistId, getPlaylist, getPlaylistTracks } from "./spotifyApi.js";

// Selecting all important elements from the HTML by their IDs
const els = {
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  loadBtn: document.getElementById("loadBtn"),
  playlistInput: document.getElementById("playlistInput"),
  status: document.getElementById("status"),
  playlistHeader: document.getElementById("playlistHeader"),
  insights: document.getElementById("insights"),
  grid: document.getElementById("grid"),
  insightsToggle: document.getElementById("insightsToggle"),
};

// If any HTML element is missing, I want to know immediately
for (const [key, el] of Object.entries(els)) {
  if (!el) console.error(`Missing element: ${key}. Check index.html IDs.`);
}

// I'm using this helper to show a status message (errors, loading states, etc)
function setStatus(msg, show = true) {
  els.status.hidden = !show;
  els.status.textContent = msg;
}

// I'm using this helper to change the UI depending on whether the user is logged in
function setAuthedUI(isAuthed) {
  // If logged in -  hide login button, show logout button
  els.loginBtn.hidden = isAuthed;
  els.logoutBtn.hidden = !isAuthed;
}

// I'm using this helper to avoid inserting “unsafe” strings into HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// I'm using this helper to choose the best image from Spotify image arrays
function pickBestImage(images) {
  return images?.[0]?.url ?? null;
}

// I'm using this helper to format the artist list like: “Rihanna, Drake”
function fmtArtists(track) {
  return track?.artists?.map((a) => a.name).join(", ") || "Unknown artist";
}

// ----------------------------
// Preview mode (so the UI still shows a moodboard if Spotify blocks with 403)
// ----------------------------


// I'm using this as a “Preview Mode” playlist so the moodboard always shows the concept
const PREVIEW_PLAYLIST = {
  name: "Preview Mode Moodboard",
  owner: { display_name: "HayetCreates" },
  images: [
    {
      url: "https://images.unsplash.com/photo-1516223725307-6f76b9182f7c?auto=format&fit=crop&w=1200&q=60",
    },
  ],
  tracks: {
    items: [
      {
        track: {
          name: "Neon Fever",
          artists: [{ name: "City Lights" }],
          album: {
            images: [
              
              { url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Late Night Radio",
          artists: [{ name: "FM Dreams" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Vinyl Therapy",
          artists: [{ name: "Analog Heart" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Bassline Bloom",
          artists: [{ name: "Club Signal" }],
          album: {
            images: [
              
              { url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Midnight Studio",
          artists: [{ name: "Tape Delay" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "After Hours",
          artists: [{ name: "Night Shift" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Glow Up",
          artists: [{ name: "Electric Bloom" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
      {
        track: {
          name: "Night Ride",
          artists: [{ name: "Neon Roads" }],
          album: {
            images: [
              { url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=60" },
            ],
          },
        },
      },
    ],
  },
};

// I'm using this function to render the playlist header (cover + title + owner + total)
function renderHeader(playlist, totalTracksOverride = null) {
  const cover = pickBestImage(playlist.images);
  const total = totalTracksOverride ?? playlist.tracks?.total ?? (playlist.tracks?.items?.length ?? 0);
  const owner = playlist.owner?.display_name || playlist.owner?.id || "Unknown";

  els.playlistHeader.innerHTML = `
    ${cover ? `<img class="cover" src="${cover}" alt="Playlist cover" />` : ""}
    <div class="meta">
      <h2>${escapeHtml(playlist.name)}</h2>
      <p>${escapeHtml(owner)} • ${total} tracks</p>
    </div>
  `;
  els.playlistHeader.hidden = false;
}

// I'm using this function to render the moodboard cards for each track
function renderMoodboard(trackItems) {
  // I'm filtering only items that actually have a track (sometimes Spotify returns null)
  const usable = (trackItems || []).filter((i) => i && i.track);

  // If there are no tracks, show a clear message instead of a blank screen
  if (!usable.length) {
    els.grid.innerHTML = "";
    els.grid.hidden = true;
    setStatus("No tracks returned. Try another playlist.", true);
    return;
  }

  els.grid.innerHTML = usable
    .map((i) => {
      const track = i.track;

      const img = pickBestImage(track.album?.images);
      const title = track.name || "Untitled";
      const artists = fmtArtists(track);

      return `
        <article class="card">
          ${img ? `<img src="${img}" alt="Album art" loading="lazy" />` : ""}
          <div class="pad">
            <p class="t">${escapeHtml(title)}</p>
            <p class="a">${escapeHtml(artists)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  els.grid.hidden = false;
}

// I'm using this function to show Preview Mode when Spotify blocks access
function showPreviewMode(reasonText) {
  // I hide insights for now (Spotify restrictions + you didn't like the 0% / message)
  els.insights.hidden = true;

  renderHeader(PREVIEW_PLAYLIST, PREVIEW_PLAYLIST.tracks.items.length);
  renderMoodboard(PREVIEW_PLAYLIST.tracks.items);

  setStatus(
    `Preview Mode: Spotify access is restricted right now (${reasonText}). Showing a sample moodboard so the UI can still be reviewed.`,
    true
  );
}

// I'm using this main function that runs when the page loads
async function run() {
  // Handle redirect back from Spotify login (if any)
  try {
    await handleSpotifyCallback();
  } catch (e) {
    setStatus(e.message, true);
  }

  // Update UI based on whether token exists
  setAuthedUI(Boolean(getAccessToken()));

  // When the user clicks login - redirect to Spotify auth page
  els.loginBtn.addEventListener("click", loginWithSpotify);

  // When the user clicks logout - token will be cleared and UI updates
  els.logoutBtn.addEventListener("click", () => {
    logout();
    setAuthedUI(false);
    setStatus("Logged out.", true);
  });

  // When the user clicks “Create moodboard”
  els.loadBtn.addEventListener("click", async () => {
    // Clear old UI each run so it feels clean
    els.grid.hidden = true;
    els.playlistHeader.hidden = true;
    els.insights.hidden = true;

    const tokenNow = getAccessToken();

    // If not logged in -> still show Preview Mode so the page isn't empty
    if (!tokenNow) {
      showPreviewMode("not logged in");
      return;
    }

    const playlistId = extractPlaylistId(els.playlistInput.value);

    // If the input is invalid -> still show Preview Mode so user sees the concept
    if (!playlistId) {
      showPreviewMode("invalid playlist input");
      return;
    }

    try {
      setStatus("Fetching playlist…", true);

      // 1) Fetching the playlist metadata 
      const playlist = await getPlaylist(playlistId, tokenNow);

      // 2) Fetching tracks 
      setStatus("Fetching tracks…", true);
      const tracksData = await getPlaylistTracks(playlistId, tokenNow, 50, 0);

      // Renderingh UI
      renderHeader(playlist, tracksData.total ?? null);
      renderMoodboard(tracksData.items || []);

      // I'm disabling audio features for now (Spotify can restrict it + you don't want weird 0%s)
      els.insights.hidden = true;

      setStatus("Done ✅", true);
    } catch (e) {
      console.error(e);

      // If Spotify blocks the access (403), the Preview Mode will be shown so the project still looks complete.
      if (String(e.message).includes("403")) {
        showPreviewMode("403 forbidden");
        return;
      }

      // Any other error -> The preview will be shown
      showPreviewMode("API error");
    }
  });
}

// Starting the app
run();
