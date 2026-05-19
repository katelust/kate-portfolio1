// Toggle between Technical and Music pages
window.show = function show(page) {
  document.getElementById('page-tech').classList.toggle('hidden', page !== 'tech');
  document.getElementById('page-music').classList.toggle('hidden', page !== 'music');
  document.getElementById('btn-tech').classList.toggle('active', page === 'tech');
  document.getElementById('btn-music').classList.toggle('active', page === 'music');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// last.fm
const LASTFM_API_KEY = "";
const LASTFM_USER = "Katelustgarten";

const BASE_URL = "https://ws.audioscrobbler.com/2.0/";

async function getRecentTracks() {
  const url = `${BASE_URL}?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=6`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch recent tracks");
  }

  const data = await response.json();
  return data.recenttracks?.track || [];
}

async function getTopArtists() {
  const url = `${BASE_URL}?method=user.gettopartists&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&period=1month&limit=6`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not fetch top artists");
  }

  const data = await response.json();
  return data.topartists?.artist || [];
}

async function loadLastFm() {
  const recentTracksContainer = document.getElementById("recent-tracks");
  const topArtistsContainer = document.getElementById("top-artists");

  if (!recentTracksContainer || !topArtistsContainer) return;

  try {
    const [recentTracks, topArtists] = await Promise.all([
      getRecentTracks(),
      getTopArtists(),
    ]);

    recentTracksContainer.innerHTML = recentTracks
      .map((track) => {
        const artistName = track.artist?.["#text"] || "Unknown artist";
        const isNowPlaying = track["@attr"]?.nowplaying === "true";

        return `
          <div class="lastfm-row">
            <p>
              <strong>${track.name}</strong>
              <br />
              <span class="meta">${artistName}</span>
              ${isNowPlaying ? `<br /><span class="now-playing">Now playing</span>` : ""}
            </p>
          </div>
        `;
      })
      .join("");

    topArtistsContainer.innerHTML = topArtists
      .map((artist, index) => {
        return `
          <div class="lastfm-row">
            <p>
              <strong>${index + 1}. ${artist.name}</strong>
              <br />
              <span class="meta">${artist.playcount} plays</span>
            </p>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    recentTracksContainer.innerHTML =
      `<p class="meta">Could not load Last.fm data right now.</p>`;
    topArtistsContainer.innerHTML =
      `<p class="meta">Could not load Last.fm data right now.</p>`;
  }
}

loadLastFm();
