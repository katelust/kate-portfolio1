// Render experiences from portfolio-data.js so roles and artists are easy to edit in one file.
function renderExperience(listId, entries) {
  const container = document.getElementById(listId);
  if (!container || !Array.isArray(entries)) return;
  container.replaceChildren();

  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    const title = document.createElement('strong');
    title.textContent = entry.title || '';
    header.appendChild(title);
    if (entry.meta) {
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = entry.meta;
      header.appendChild(meta);
    }
    card.appendChild(header);

    if (entry.tag) {
      const tag = document.createElement('p');
      tag.className = 'meta tag';
      tag.textContent = entry.tag;
      card.appendChild(tag);
    }
    (entry.paragraphs || []).forEach(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      card.appendChild(p);
    });

    if (Array.isArray(entry.artists) && entry.artists.length) {
      const working = document.createElement('div');
      working.className = 'working-with';
      const label = document.createElement('span');
      label.className = 'working-label';
      label.textContent = 'Working with';
      working.appendChild(label);
      const list = document.createElement('div');
      list.className = 'artist-list';

      entry.artists.forEach(name => {
        const profileId = window.portfolioData?.spotifyArtists?.[name];
        const link = document.createElement('a');
        link.className = 'artist-chip';
        link.textContent = name;
        link.href = profileId
          ? 'https://open.spotify.com/artist/' + encodeURIComponent(profileId)
          : 'https://open.spotify.com/search/' + encodeURIComponent(name) + '/artists';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = profileId ? 'Open ' + name + ' on Spotify' : 'Find ' + name + ' on Spotify';
        if (!profileId) link.dataset.spotifySearch = 'true';
        list.appendChild(link);
      });
      working.appendChild(list);
      card.appendChild(working);
    }
    container.appendChild(card);
  });
}

if (window.portfolioData) {
  renderExperience('tech-experience-cards', window.portfolioData.techExperience);
  renderExperience('music-experience-cards', window.portfolioData.musicExperience);
}

// Toggle between Technical and Music pages
window.show = function show(page) {
  document.getElementById('page-tech').classList.toggle('hidden', page !== 'tech');
  document.getElementById('page-music').classList.toggle('hidden', page !== 'music');
  document.getElementById('btn-tech').classList.toggle('active', page === 'tech');
  document.getElementById('btn-music').classList.toggle('active', page === 'music');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// last.fm
const LASTFM_API_KEY = "06fb3434108e79af4737918e7795cab0";
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
