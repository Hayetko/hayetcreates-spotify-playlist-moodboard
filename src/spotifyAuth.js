// Spotify authorization endpoints
// I'm saving these Spotify URLs here because we will use them for login and token exchange
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// I'm pasting my Spotify Client ID here (from Spotify Developer Dashboard)
// This is like my app's public ID so Spotify knows which app is requesting login
export const CLIENT_ID = "6dfcf18c48004dbd82be1a5037b96ada";

// I'm setting the redirect URI here and it MUST match the one in Spotify Dashboard 100%
// After the user logs in, Spotify will send them back to this exact URL with a code (?code=...)
export const REDIRECT_URI = "http://127.0.0.1:5174/callback";



// - playlist read private: allows reading private playlists too
// - playlist read collaborative: allows reading collaborative playlistss
const SCOPES = ["playlist-read-private", "playlist-read-collaborative"];

// I'm saving localStorage keys here so I can reuse them and avoid typos
const storageKeys = {
  verifier: "pkce_verifier",
  token: "spotify_access_token",
  expiresAt: "spotify_expires_at",
};

//This function gets the access token from localStorage
// It also checks if the token is still valid
export function getAccessToken() {
  const token = localStorage.getItem(storageKeys.token);
  const expiresAt = Number(localStorage.getItem(storageKeys.expiresAt) || 0);

  // If token doesn’t exist -> user is not logged in
  if (!token) return null;

  // If token expired -> we treat it like logged out
  if (Date.now() > expiresAt) return null;

  // If token exists and is not expired -> return it
  return token;
}

// Logging out the user and clearing the stored token.
export function logout() {
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.expiresAt);
  localStorage.removeItem(storageKeys.verifier);
}

// I'm using this helper to convert bytes into a base64 URL-safe format
function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// I'm using this helper to hash a string with SHA-256

async function sha256(plain) {
  const enc = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", enc);
}


// This randomm string becomes the PKCE "code verifier"
function randomString(length = 64) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// I'm using this function to start Spotify login (PKCE flow)
// 1) generating a PKCE verifier (random string)
// 2) creating a PKCE challenge from the verifier (hashed version)
// 3) redirecting the user to Spotify login page
export async function loginWithSpotify() {
  // Step 1: creating verifier and store it so we can use it later in the callback
  const codeVerifier = randomString(64);
  localStorage.setItem(storageKeys.verifier, codeVerifier);

  // Step 2: hashing verifier and convert it into a Spotify friendly challenge
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  // Step 3: building the Spotify authorize URL parameters
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  // Redirectihng user to Spotify auth page
  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

// After the user logs in, Spotify redirects back to REDIRECT_URI with ?code=...
// I'm using this function to exchange that code for an access token and store it
export async function handleSpotifyCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // If Spotify returned an error -> show it
  if (error) throw new Error(`Spotify auth error: ${error}`);

  // If we are not on the callback page - do nothing
  if (!code) return false;


  const verifier = localStorage.getItem(storageKeys.verifier);
  if (!verifier) throw new Error("Missing PKCE verifier. Try logging in again.");

  // Build request body for token exchange
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  // Request token from Spotify
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  // If the token exchange fails -  show readable error
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  // Saving token + expiry time in localStorage
  const data = await res.json();
  const expiresAt = Date.now() + data.expires_in * 1000 - 10_000; // small safety buffer

  localStorage.setItem(storageKeys.token, data.access_token);
  localStorage.setItem(storageKeys.expiresAt, String(expiresAt));

  // Cleaning URL
  window.history.replaceState({}, document.title, "/");
  return true;
}
