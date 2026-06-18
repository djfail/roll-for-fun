const CONFIG = {
  OMDB_API_KEY: 'b8fff5fe',
  RAWG_API_KEY: '',
  DISCORD_WEBHOOK_URL: '',
  USERS: ['Charlotte', 'Jackson', 'Joshua'],
  STORAGE_KEY: 'family-night-bookings-v1'
};

const FALLBACK_MOVIES = {
  "tt0274166": {
    Title: "A Cinderella Story",
    imdbID: "tt0274166",
    Poster: "https://via.placeholder.com/300x450?text=A+Cinderella+Story",
    imdbRating: "6.1",
    Runtime: "97 min",
    Plot: "A modern Cinderella tale with a high school twist.",
    Genre: "Comedy, Family, Romance",
    Rated: "PG"
  },
  "tt35672862": {
    Title: "Spider-Man: No Way Home",
    imdbID: "tt35672862",
    Poster: "https://via.placeholder.com/300x450?text=Spider-Man+No+Way+Home",
    imdbRating: "8.3",
    Runtime: "148 min",
    Plot: "Spider-Man learns what it means to be a hero when the multiverse breaks open.",
    Genre: "Action, Adventure, Sci-Fi",
    Rated: "PG-13"
  },
  "tt11378946": {
    Title: "Barbie",
    imdbID: "tt11378946",
    Poster: "https://via.placeholder.com/300x450?text=Barbie",
    imdbRating: "7.4",
    Runtime: "114 min",
    Plot: "Barbie embarks on a journey of self-discovery beyond Barbieland.",
    Genre: "Adventure, Comedy, Fantasy",
    Rated: "PG-13"
  },
  "tt0121765": {
    Title: "Crouching Tiger, Hidden Dragon",
    imdbID: "tt0121765",
    Poster: "https://via.placeholder.com/300x450?text=Crouching+Tiger",
    imdbRating: "7.8",
    Runtime: "120 min",
    Plot: "A stolen sword and a legendary warrior bring adventure to Qing Dynasty China.",
    Genre: "Action, Adventure, Fantasy",
    Rated: "PG-13"
  },
  "tt27564844": {
    Title: "The Super Mario Bros. Movie",
    imdbID: "tt27564844",
    Poster: "https://via.placeholder.com/300x450?text=Super+Mario+Movie",
    imdbRating: "6.2",
    Runtime: "92 min",
    Plot: "Mario and Luigi race through the Mushroom Kingdom to save Princess Peach.",
    Genre: "Animation, Adventure, Comedy",
    Rated: "PG"
  },
  "tt34685692": {
    Title: "Spider-Man: Across the Spider-Verse",
    imdbID: "tt34685692",
    Poster: "https://via.placeholder.com/300x450?text=Across+the+Spider-Verse",
    imdbRating: "8.8",
    Runtime: "140 min",
    Plot: "Miles Morales returns to the multiverse and faces a new challenge.",
    Genre: "Animation, Action, Adventure",
    Rated: "PG-13"
  },
  "tt31728330": {
    Title: "Oppenheimer",
    imdbID: "tt31728330",
    Poster: "https://via.placeholder.com/300x450?text=Oppenheimer",
    imdbRating: "8.5",
    Runtime: "181 min",
    Plot: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.",
    Genre: "Biography, Drama, History",
    Rated: "PG-13"
  }
};

const FALLBACK_GAMES = {
  minecraft: {
    name: "Minecraft",
    slug: "minecraft",
    rating: 4.5,
    background_image: "https://via.placeholder.com/300x180?text=Minecraft",
    description_raw: "Creative sandbox about building with blocks.",
    platforms: [{platform:{name:"PC"}},{platform:{name:"Xbox"}},{platform:{name:"Switch"}}]
  },
  "portal-2": {
    name: "Portal 2",
    slug: "portal-2",
    rating: 4.7,
    background_image: "https://via.placeholder.com/300x180?text=Portal+2",
    description_raw: "Puzzle-platformer with portals and dark humor.",
    platforms: [{platform:{name:"PC"}},{platform:{name:"PS4"}},{platform:{name:"Xbox One"}}]
  },
  "stardew-valley": {
    name: "Stardew Valley",
    slug: "stardew-valley",
    rating: 4.8,
    background_image: "https://via.placeholder.com/300x180?text=Stardew+Valley",
    description_raw: "Farming life sim with exploration and community.",
    platforms: [{platform:{name:"PC"}},{platform:{name:"Switch"}},{platform:{name:"Mobile"}}]
  },
  "among-us": {
    name: "Among Us",
    slug: "among-us",
    rating: 4.2,
    background_image: "https://via.placeholder.com/300x180?text=Among+Us",
    description_raw: "Social deduction game in space.",
    platforms: [{platform:{name:"PC"}},{platform:{name:"Mobile"}},{platform:{name:"Switch"}}]
  },
  "the-witcher-3-wild-hunt": {
    name: "The Witcher 3",
    slug: "the-witcher-3-wild-hunt",
    rating: 4.9,
    background_image: "https://via.placeholder.com/300x180?text=The+Witcher+3",
    description_raw: "Open-world RPG where monster hunting meets story.",
    platforms: [{platform:{name:"PC"}},{platform:{name:"PS4"}},{platform:{name:"Xbox One"}}]
  }
};

const FALLBACK_FOOD = [
  { name: 'Pizza', requiredRoll: 15 },
  { name: 'Popcorn', requiredRoll: 5 },
  { name: 'Ice Cream', requiredRoll: 10 },
  { name: 'Takeaway', requiredRoll: 20 }
];

const $ = id => document.getElementById(id);
const q = (sel, root = document) => root.querySelector(sel);
const qs = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));
const nowISO = () => new Date().toISOString().slice(0, 10);
const uid = () => 'bk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

const moviesGrid = $('movies-grid');
const gamesGrid = $('games-grid');
const foodListEl = $('food-list');
const bookingsListEl = $('bookings-list');
const modal = $('modal');
const modalBody = $('modal-body');
const modalClose = $('modal-close');
const adminToggleBtn = $('admin-toggle');
let adminMode = false;
let moviesData = [];
let gamesData = [];
let foodItems = [];
let bookings = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    console.log('🎬 Initializing app...');
    const [mJSON, gJSON, fJSON] = await Promise.all([
      fetch('movies.json').then(r => r.json()).catch(e => { console.warn('❌ movies.json fetch failed:', e); return null; }),
      fetch('games.json').then(r => r.json()).catch(e => { console.warn('❌ games.json fetch failed:', e); return null; }),
      fetch('food.json').then(r => r.json()).catch(e => { console.warn('❌ food.json fetch failed:', e); return null; })
    ]);

    console.log('📋 Loaded data:', { mJSON, gJSON, fJSON });

    foodItems = Array.isArray(fJSON) ? fJSON : FALLBACK_FOOD;
    console.log('🍿 Food items:', foodItems);

    const movieList = Array.isArray(mJSON)
      ? mJSON
      : Object.keys(FALLBACK_MOVIES).map(imdbId => ({ imdbId }));
    console.log('🎬 Movie list to fetch:', movieList);

    const gameList = Array.isArray(gJSON)
      ? gJSON
      : Object.keys(FALLBACK_GAMES).map(slug => ({ slug }));

    moviesData = await Promise.all(movieList.map(item => fetchMovieDetails(item.imdbId)));
    console.log('🎬 Movies data fetched:', moviesData);
    moviesData = moviesData.filter(Boolean);
    console.log('🎬 Movies after filter:', moviesData);
    renderMovies(moviesData);

    gamesData = await Promise.all(gameList.map(item => fetchGameDetails(item.slug)));
    gamesData = gamesData.filter(Boolean);
    renderGames(gamesData);

    bookings = loadBookings();
    renderFoodList();
    renderBookings();
    wireUI();
  } catch (error) {
    console.error('❌ Init failed', error);
    bookings = loadBookings();
    renderFoodList();
    renderBookings();
    wireUI();
  }
}

async function fetchMovieDetails(imdbId) {
  if (!imdbId) {
    console.warn('⚠️ No imdbId provided');
    return null;
  }
  console.log(`📽️ Fetching movie details for: ${imdbId}`);
  if (CONFIG.OMDB_API_KEY) {
    try {
      const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${CONFIG.OMDB_API_KEY}`;
      console.log(`📡 Calling OMDb API: ${url}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log(`✅ OMDb response for ${imdbId}:`, data);
      if (data && data.Response === 'True') return data;
    } catch (err) {
      console.warn(`⚠️ OMDb fetch failed for ${imdbId}:`, err);
    }
  }
  const fallbackMovie = FALLBACK_MOVIES[imdbId];
  console.log(`🎨 Using fallback for ${imdbId}:`, fallbackMovie);
  return fallbackMovie || {
    Title: imdbId,
    imdbID: imdbId,
    Poster: 'https://via.placeholder.com/300x450?text=Movie+Unavailable',
    imdbRating: 'N/A',
    Runtime: 'N/A',
    Plot: 'Movie details are unavailable.',
    Genre: 'N/A',
    Rated: 'N/A'
  };
}

async function fetchGameDetails(slug) {
  if (!slug) return null;
  if (CONFIG.RAWG_API_KEY) {
    try {
      const res = await fetch(`https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${CONFIG.RAWG_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.name || slug,
          slug,
          rating: data.rating || 'N/A',
          background_image: data.background_image || '',
          description_raw: data.description_raw || data.description || '',
          platforms: (data.platforms || []).map(p => (p.platform && p.platform.name) || p.name || '')
        };
      }
    } catch (err) {
      console.warn('RAWG fetch failed', err);
    }
  }

  const fallback = FALLBACK_GAMES[slug];
  if (fallback) return fallback;
  return {
    name: slug,
    slug,
    rating: 'N/A',
    background_image: 'https://via.placeholder.com/300x180?text=Game+Unavailable',
    description_raw: 'Game details are unavailable.',
    platforms: []
  };
}

function renderMovies(list) {
  moviesGrid.innerHTML = '';
  if (!list.length) {
    moviesGrid.innerHTML = '<p class="muted">No movies available.</p>';
    return;
  }
  list.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="poster movie-poster" src="${escapeAttr(m.Poster || m.poster || '')}" alt="${escapeAttr(m.Title || '')}" data-id="${escapeAttr(m.imdbID || '')}" />
      <div class="meta">
        <h3 class="title">${escapeHtml(m.Title || 'Untitled')}</h3>
        <p class="small">${escapeHtml(m.Genre || '')} · ${escapeHtml(m.Runtime || '')}</p>
        <p class="small muted">${escapeHtml((m.imdbRating || 'N/A') + ' ⭐')}</p>
        <p class="muted small" style="margin-top:8px">${escapeHtml(truncate(m.Plot || '', 120))}</p>
        <div class="row" style="margin-top:10px">
          <button class="btn book-btn" data-type="movie" data-id="${escapeAttr(m.imdbID || '')}" data-title="${escapeAttr(m.Title || '')}">Book Movie Night</button>
          <button class="btn ghost details-btn" data-id="${escapeAttr(m.imdbID || '')}">Details</button>
          <span class="badge">${escapeHtml(m.Rated || '')}</span>
        </div>
      </div>`;
    moviesGrid.appendChild(card);
  });
}

function renderGames(list) {
  gamesGrid.innerHTML = '';
  if (!list.length) {
    gamesGrid.innerHTML = '<p class="muted">No games available.</p>';
    return;
  }
  list.forEach(g => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="poster" src="${escapeAttr(g.background_image || '')}" alt="${escapeAttr(g.name || '')}" style="height:180px" />
      <div class="meta">
        <h3 class="title">${escapeHtml(g.name || 'Untitled')}</h3>
        <p class="small">${escapeHtml((g.platforms || []).slice(0, 3).join(', '))}</p>
        <p class="small muted">${escapeHtml((g.rating || 'N/A') + ' ⭐')}</p>
        <p class="muted small" style="margin-top:8px">${escapeHtml(truncate(g.description_raw || '', 120))}</p>
        <div class="row" style="margin-top:10px">
          <button class="btn book-btn" data-type="game" data-id="${escapeAttr(g.slug || '')}" data-title="${escapeAttr(g.name || '')}">Book Game Night</button>
          <span class="badge" style="background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#081018">PLAY</span>
        </div>
      </div>`;
    gamesGrid.appendChild(card);
  });
}

function renderFoodList() {
  foodListEl.innerHTML = '';
  if (!Array.isArray(foodItems) || foodItems.length === 0) {
    foodListEl.innerHTML = '<p class="muted">No food items defined in food.json</p>';
    return;
  }
  foodItems.forEach(f => {
    const el = document.createElement('div');
    el.className = 'booking';
    el.innerHTML = `
      <div class="left">
        <div class="info">
          <div class="title">${escapeHtml(f.name)}</div>
          <div class="muted small">Requires roll ${escapeHtml(String(f.requiredRoll))}+</div>
        </div>
      </div>
      <div class="controls">
        <button class="btn ghost" data-name="${escapeAttr(f.name)}">View</button>
      </div>`;
    foodListEl.appendChild(el);
  });
}

function renderBookings() {
  bookings = loadBookings();
  bookingsListEl.innerHTML = '';
  if (!bookings.length) {
    bookingsListEl.innerHTML = '<p class="muted">No upcoming bookings — browse movies or games to add one.</p>';
    return;
  }

  bookings.sort((a, b) => ((a.date || '') > (b.date || '') ? 1 : -1));
  bookings.forEach(bk => {
    const el = document.createElement('div');
    el.className = 'booking';
    const poster = bk.poster || 'https://via.placeholder.com/64x94?text=No';
    const foodText = bk.food ? `${bk.food.name} (${bk.food.rollResult} → ${bk.food.success ? '🎉' : '❌'})` : 'None';
    el.innerHTML = `
      <div class="left">
        <img class="thumb" src="${escapeAttr(poster)}" alt="${escapeAttr(bk.title || '')}" />
        <div class="info">
          <div style="display:flex;gap:8px;align-items:center">
            <div style="font-weight:700">${escapeHtml(bk.title)}</div>
            <div class="muted small">by ${escapeHtml(bk.requestedBy)}</div>
          </div>
          <div class="muted small">${escapeHtml(bk.date)} · ${escapeHtml((bk.type || '').toUpperCase())}</div>
          <div class="muted small">Food: ${escapeHtml(foodText)}</div>
          <div style="margin-top:6px"><span class="badge" style="background:${statusColor(bk.status)}">${escapeHtml(capitalize(bk.status || 'pending'))}</span></div>
        </div>
      </div>
      <div class="controls">
        ${adminMode ? `
          <button class="btn small" data-action="approve" data-id="${bk.id}">Approve</button>
          <button class="btn small" data-action="reject" data-id="${bk.id}">Reject</button>
          <button class="btn ghost small" data-action="remove" data-id="${bk.id}">Remove</button>
        ` : `
          <button class="btn ghost small" data-action="food" data-id="${bk.id}">${bk.food ? 'View Food' : 'Add Food'}</button>
          <button class="btn small" data-action="details" data-id="${bk.id}">Details</button>
        `}
      </div>`;
    bookingsListEl.appendChild(el);
  });
}

function wireUI() {
  qs('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qs('.nav-btn').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      qs('.section').forEach(section => section.classList.remove('active'));
      const targetEl = $(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  moviesGrid.addEventListener('click', onMovieGridClick);
  gamesGrid.addEventListener('click', onBookBtnClick);

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  adminToggleBtn.addEventListener('click', () => {
    adminMode = !adminMode;
    adminToggleBtn.textContent = adminMode ? 'Disable Admin Mode' : 'Enable Admin Mode';
    renderBookings();
  });

  bookingsListEl.addEventListener('click', e => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if (!action) return;
    if (action === 'approve') updateBookingStatus(id, 'approved');
    if (action === 'reject') updateBookingStatus(id, 'rejected');
    if (action === 'remove') {
      if (confirm('Remove booking?')) removeBooking(id);
    }
    if (action === 'food') openFoodModalForBooking(id);
    if (action === 'details') {
      const booking = bookings.find(x => x.id === id);
      if (booking) openDetailsModal(booking);
    }
  });

  $('clear-past').addEventListener('click', () => {
    const today = nowISO();
    bookings = bookings.filter(b => !b.date || b.date >= today);
    saveBookings(bookings);
    renderBookings();
  });

  foodListEl.addEventListener('click', e => {
    if (!e.target.dataset.name) return;
    const food = foodItems.find(x => x.name === e.target.dataset.name);
    if (food) showFoodInfo(food);
  });

  $('movies-search').addEventListener('input', debounce(() => applyMovieFilters(), 200));
  $('games-search').addEventListener('input', debounce(() => applyGameFilters(), 200));

  qs('#movies-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { btn.classList.toggle('active'); applyMovieFilters(); });
  });
  qs('#games-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { btn.classList.toggle('active'); applyGameFilters(); });
  });
}

function onMovieGridClick(event) {
  const movieId = event.target.closest('.movie-poster')?.dataset.id || event.target.closest('.details-btn')?.dataset.id;
  if (movieId) {
    const movie = moviesData.find(x => (x.imdbID || x.imdbId || '') === movieId);
    if (movie) {
      openMovieDetailsModal(movie);
      return;
    }
  }

  const btn = event.target.closest('.book-btn');
  if (!btn) return;
  const type = btn.dataset.type;
  const id = btn.dataset.id;
  const title = btn.dataset.title;
  let poster = '';
  let rating = '';
  if (type === 'movie') {
    const movie = moviesData.find(x => (x.imdbID || x.imdbId || '') === id);
    poster = movie ? (movie.Poster || '') : '';
    rating = movie ? (movie.Rated || '') : '';
  } else {
    const game = gamesData.find(x => x.slug === id);
    poster = game ? (game.background_image || '') : '';
    rating = '';
  }
  openBookingModal({ type, id, title, poster, rating });
}

function getMovieImageGallery(movie) {
  const title = (movie.Title || movie.title || 'Movie').replace(/\s+/g, '+');
  const posterUrl = movie.Poster || movie.poster || '';
  const gallery = posterUrl ? [posterUrl] : [];
  while (gallery.length < 5) {
    gallery.push(`https://via.placeholder.com/360x200?text=${encodeURIComponent(title)}+${gallery.length + 1}`);
  }
  return gallery;
}

function openMovieDetailsModal(movie) {
  const gallery = getMovieImageGallery(movie);
  modalBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="text-align:center">
        <img id="gallery-main-image" class="poster" src="${escapeAttr(gallery[0])}" alt="${escapeAttr(movie.Title || '')}" style="width:100%;max-width:500px;border-radius:16px;object-fit:cover;max-height:320px" />
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:10px">
        ${gallery.map((src, index) => `
          <button type="button" class="gallery-thumb" data-src="${escapeAttr(src)}" style="border:1px solid rgba(255,255,255,0.12);border-radius:12px;overflow:hidden;padding:0;background:transparent;cursor:pointer">
            <img src="${escapeAttr(src)}" alt="${escapeAttr(movie.Title || '')} image ${index + 1}" style="width:100%;height:100%;object-fit:cover;display:block" />
          </button>`).join('')}
      </div>
      <div>
        <h3>${escapeHtml(movie.Title || 'Movie Details')}</h3>
        <p class="muted">${escapeHtml(movie.Genre || '')} · ${escapeHtml(movie.Runtime || '')} · ${escapeHtml(movie.Rated || '')}</p>
        <p class="muted" style="margin-top:8px">${escapeHtml(movie.Plot || '')}</p>
        <p class="muted small" style="margin-top:8px">IMDb Rating: ${escapeHtml(movie.imdbRating || 'N/A')}</p>
        ${movie.Director ? `<p class="muted small">Director: ${escapeHtml(movie.Director)}</p>` : ''}
        ${movie.Actors ? `<p class="muted small">Cast: ${escapeHtml(movie.Actors)}</p>` : ''}
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:8px">
        <button id="close-movie-details" class="btn ghost">Close</button>
      </div>
    </div>`;
  openModal();
  $('#close-movie-details').addEventListener('click', closeModal);
  document.querySelectorAll('.gallery-thumb').forEach(button => {
    button.addEventListener('click', () => {
      const src = button.dataset.src;
      const mainImage = $('#gallery-main-image');
      if (mainImage) mainImage.src = src;
    });
  });
}

function openBookingModal(item) {
  const today = nowISO();
  modalBody.innerHTML = `
    <h3>Book ${escapeHtml(item.title)}</h3>
    <form id="booking-form">
      <label class="muted small">Who?</label>
      <select id="requestedBy" required>
        ${CONFIG.USERS.map(u => `<option value="${escapeAttr(u)}">${escapeHtml(u)}</option>`).join('')}
      </select>
      <label class="muted small" style="margin-top:8px">Date</label>
      <input id="booking-date" type="date" value="${today}" min="${today}" required />
    </form>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
      <button type="button" class="btn ghost" id="cancel-book">Cancel</button>
      <button type="button" class="btn" id="submit-book">Continue</button>
    </div>`;
  openModal();

  $('#cancel-book').addEventListener('click', closeModal);
  $('#submit-book').addEventListener('click', () => {
    const requester = $('#requestedBy').value;
    const date = $('#booking-date').value;
    if (!date) { alert('Pick a date'); return; }
    confirmBooking(item, requester, date, item.rating || '');
  });
}
}

function isRatedForAdults(ratingStr) {
  if (!ratingStr) return false;
  const adultRatings = ['PG-13', 'R', 'NC-17', '15', '16', '18'];
  return adultRatings.some(r => ratingStr.includes(r));
}

function confirmBooking(item, requester, date, rating) {
  const needsPermission = (requester === 'Jackson' || requester === 'Joshua') && isRatedForAdults(rating);
  
  if (needsPermission) {
    modalBody.innerHTML = `
      <div style="text-align:center">
        <h3 style="color:var(--warning,#ff9800);margin-bottom:12px">⚠️ Permission Required</h3>
        <p class="muted" style="font-size:16px;margin-bottom:16px">${escapeHtml(requester)}, this title is rated <strong>${escapeHtml(rating)}</strong>.</p>
        <p class="muted" style="margin-bottom:20px">Please ask <strong>Harry or Mom</strong> for permission before booking.</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button id="permission-granted" class="btn">I have permission!</button>
          <button id="permission-cancel" class="btn ghost">Cancel</button>
        </div>
      </div>`;
    
    $('#permission-granted').addEventListener('click', () => {
      proceedWithBooking(item, requester, date);
    });
    $('#permission-cancel').addEventListener('click', closeModal);
  } else {
    proceedWithBooking(item, requester, date);
  }
}

function proceedWithBooking(item, requester, date) {
  modalBody.innerHTML = `
    <h3>Confirm Booking</h3>
    <p class="muted">Type: ${escapeHtml(item.type)}</p>
    <p class="muted">Title: <strong>${escapeHtml(item.title)}</strong></p>
    <p class="muted">Requested by: <strong>${escapeHtml(requester)}</strong></p>
    <p class="muted">Date: <strong>${escapeHtml(date)}</strong></p>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
      <button type="button" class="btn ghost" id="back-book">Back</button>
      <button type="button" class="btn" id="confirm-book">Confirm</button>
    </div>`;

  $('#back-book').addEventListener('click', () => openBookingModal(item));
  $('#confirm-book').addEventListener('click', async () => {
    const booking = {
      id: uid(),
      type: item.type,
      title: item.title,
      requestedBy: requester,
      date,
      status: 'pending',
      food: null,
      poster: item.poster || ''
    };
    bookings.push(booking);
    saveBookings(bookings);
    renderBookings();
    closeModal();
    alert('Booking saved!');
  });
}

function openFoodModalForBooking(bookingId) {
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;
  modalBody.innerHTML = `
    <h3>Food for ${escapeHtml(booking.title)}</h3>
    <div id="food-options" style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
      ${foodItems.map(f => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-radius:8px;background:rgba(255,255,255,0.02)">
          <div>
            <div style="font-weight:700">${escapeHtml(f.name)}</div>
            <div class="muted small">Requires roll ${escapeHtml(String(f.requiredRoll))}+</div>
          </div>
          <div>
            <button class="btn small" data-food="${escapeAttr(f.name)}">Select</button>
          </div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">
      <button id="cancel-food" class="btn ghost">Close</button>
    </div>`;
  openModal();

  $('#cancel-food').addEventListener('click', closeModal);
  modalBody.querySelectorAll('button[data-food]').forEach(button => {
    button.addEventListener('click', () => {
      const foodName = button.dataset.food;
      const food = foodItems.find(x => x.name === foodName);
      if (food) doFoodRoll(booking, food);
    });
  });
}

function showFoodInfo(food) {
  modalBody.innerHTML = `
    <h3>${escapeHtml(food.name)}</h3>
    <p class="muted">Required roll: ${escapeHtml(String(food.requiredRoll))}+</p>
    <p class="muted">Try a d20 roll to win this snack.</p>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
      <button id="close-food" class="btn ghost">Close</button>
    </div>`;
  openModal();
  $('#close-food').addEventListener('click', closeModal);
}

function doFoodRoll(booking, food) {
  modalBody.innerHTML = `
    <h3>Rolling for ${escapeHtml(food.name)}</h3>
    <p class="muted">Required: ${escapeHtml(String(food.requiredRoll))}+</p>
    <div style="text-align:center;margin:18px 0">
      <button id="roll-d20" class="btn" style="font-size:18px;padding:12px 20px">Roll D20 🎲</button>
      <div id="roll-result" style="margin-top:12px"></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px">
      <button id="close-roll" class="btn ghost">Close</button>
    </div>`;
  openModal();

  $('#close-roll').addEventListener('click', closeModal);
  $('#roll-d20').addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= food.requiredRoll;
    booking.food = {
      name: food.name,
      requiredRoll: food.requiredRoll,
      rollResult: roll,
      success,
      locked: !success
    };
    saveBookings(bookings);
    renderBookings();
    const resultEl = $('#roll-result');
    if (success) {
      resultEl.innerHTML = `<div style="font-weight:800;color:var(--success)">${roll} — Success! ${escapeHtml(food.name)} awarded 🎉</div>`;
    } else {
      const suggestions = foodItems
        .filter(item => item.requiredRoll <= roll)
        .sort((a, b) => b.requiredRoll - a.requiredRoll);
      resultEl.innerHTML = `<div style="font-weight:800;color:var(--danger)">${roll} — Failed. Suggest lower tier:</div>
        <div class="muted small" style="margin-top:8px">${suggestions.length ? suggestions.map(s => escapeHtml(s.name + ` (${s.requiredRoll}+)`)).join(' · ') : 'No items available at this roll'}</div>`;
    }
  });
}

function openDetailsModal(booking) {
  modalBody.innerHTML = `
    <h3>${escapeHtml(booking.title)}</h3>
    <p class="muted">Type: ${escapeHtml(booking.type)}</p>
    <p class="muted">Requested by: ${escapeHtml(booking.requestedBy)}</p>
    <p class="muted">Date: ${escapeHtml(booking.date)}</p>
    <p class="muted">Status: ${escapeHtml(booking.status)}</p>
    <p class="muted">Food: ${booking.food ? escapeHtml(JSON.stringify(booking.food)) : 'None'}</p>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px">
      <button id="close-details" class="btn ghost">Close</button>
    </div>`;
  openModal();
  $('#close-details').addEventListener('click', closeModal);
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
  } catch (err) {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(list));
}

function removeBooking(id) {
  bookings = bookings.filter(b => b.id !== id);
  saveBookings(bookings);
  renderBookings();
}

function updateBookingStatus(id, status) {
  const booking = bookings.find(b => b.id === id);
  if (!booking) return;
  booking.status = status;
  saveBookings(bookings);
  renderBookings();
}

function applyMovieFilters() {
  const query = $('movies-search').value.trim().toLowerCase();
  const active = qs('#movies-filters .filter-btn.active').map(btn => (btn.dataset.filter || '').toLowerCase());
  const filtered = moviesData.filter(movie => {
    const title = (movie.Title || '').toLowerCase();
    const genre = (movie.Genre || '').toLowerCase();
    const plot = (movie.Plot || '').toLowerCase();
    const matchesQuery = !query || title.includes(query) || genre.includes(query) || plot.includes(query);
    const matchesFilters = active.length === 0 || active.some(filter => title.includes(filter) || genre.includes(filter) || plot.includes(filter));
    return matchesQuery && matchesFilters;
  });
  renderMovies(filtered);
}

function applyGameFilters() {
  const query = $('games-search').value.trim().toLowerCase();
  const active = qs('#games-filters .filter-btn.active').map(btn => (btn.dataset.filter || '').toLowerCase());
  const filtered = gamesData.filter(game => {
    const name = (game.name || '').toLowerCase();
    const platforms = (game.platforms || []).join(' ').toLowerCase();
    const desc = (game.description_raw || '').toLowerCase();
    const matchesQuery = !query || name.includes(query) || platforms.includes(query) || desc.includes(query);
    const matchesFilters = active.length === 0 || active.some(filter => name.includes(filter) || platforms.includes(filter) || desc.includes(filter));
    return matchesQuery && matchesFilters;
  });
  renderGames(filtered);
}

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function escapeAttr(value) {
  if (value == null) return '';
  return String(value).replace(/"/g, '&quot;');
}

function truncate(value, maxLength) {
  if (!value) return '';
  return value.length > maxLength ? value.slice(0, maxLength - 1) + '…' : value;
}

function capitalize(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusColor(status) {
  if (status === 'approved') return 'linear-gradient(90deg,#7ed957,#4da12a)';
  if (status === 'rejected') return 'linear-gradient(90deg,#ff7b7b,#ff4d4d)';
  return 'linear-gradient(90deg,var(--accent-2),var(--accent))';
}
