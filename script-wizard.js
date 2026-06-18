const CONFIG = {
  OMDB_API_KEY: 'b8fff5fe',
  RAWG_API_KEY: '',
  DISCORD_WEBHOOK_URL: '',
  USERS: ['Charlotte', 'Jackson', 'Joshua'],
  STORAGE_KEY: 'family-night-bookings-v1'
};

const FALLBACK_MOVIES = {
  "tt0274166": { Title: "A Cinderella Story", imdbID: "tt0274166", Poster: "https://via.placeholder.com/300x450?text=A+Cinderella+Story", imdbRating: "6.1", Runtime: "97 min", Plot: "A modern Cinderella tale with a high school twist.", Genre: "Comedy, Family, Romance", Rated: "PG" },
  "tt35672862": { Title: "Spider-Man: No Way Home", imdbID: "tt35672862", Poster: "https://via.placeholder.com/300x450?text=Spider-Man+No+Way+Home", imdbRating: "8.3", Runtime: "148 min", Plot: "Spider-Man learns what it means to be a hero when the multiverse breaks open.", Genre: "Action, Adventure, Sci-Fi", Rated: "PG-13" },
  "tt11378946": { Title: "Barbie", imdbID: "tt11378946", Poster: "https://via.placeholder.com/300x450?text=Barbie", imdbRating: "7.4", Runtime: "114 min", Plot: "Barbie embarks on a journey of self-discovery beyond Barbieland.", Genre: "Adventure, Comedy, Fantasy", Rated: "PG-13" },
  "tt0121765": { Title: "Crouching Tiger, Hidden Dragon", imdbID: "tt0121765", Poster: "https://via.placeholder.com/300x450?text=Crouching+Tiger", imdbRating: "7.8", Runtime: "120 min", Plot: "A stolen sword and a legendary warrior bring adventure to Qing Dynasty China.", Genre: "Action, Adventure, Fantasy", Rated: "PG-13" },
  "tt27564844": { Title: "The Super Mario Bros. Movie", imdbID: "tt27564844", Poster: "https://via.placeholder.com/300x450?text=Super+Mario+Movie", imdbRating: "6.2", Runtime: "92 min", Plot: "Mario and Luigi race through the Mushroom Kingdom to save Princess Peach.", Genre: "Animation, Adventure, Comedy", Rated: "PG" },
  "tt34685692": { Title: "Spider-Man: Across the Spider-Verse", imdbID: "tt34685692", Poster: "https://via.placeholder.com/300x450?text=Across+the+Spider-Verse", imdbRating: "8.8", Runtime: "140 min", Plot: "Miles Morales returns to the multiverse and faces a new challenge.", Genre: "Animation, Action, Adventure", Rated: "PG-13" },
  "tt31728330": { Title: "Oppenheimer", imdbID: "tt31728330", Poster: "https://via.placeholder.com/300x450?text=Oppenheimer", imdbRating: "8.5", Runtime: "181 min", Plot: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.", Genre: "Biography, Drama, History", Rated: "PG-13" }
};

const FALLBACK_GAMES = {
  minecraft: { name: "Minecraft", slug: "minecraft", rating: 4.5, background_image: "https://via.placeholder.com/300x180?text=Minecraft", description_raw: "Creative sandbox about building with blocks.", platforms: [{platform:{name:"PC"}},{platform:{name:"Xbox"}},{platform:{name:"Switch"}}] },
  "portal-2": { name: "Portal 2", slug: "portal-2", rating: 4.7, background_image: "https://via.placeholder.com/300x180?text=Portal+2", description_raw: "Puzzle-platformer with portals and dark humor.", platforms: [{platform:{name:"PC"}},{platform:{name:"PS4"}},{platform:{name:"Xbox One"}}] },
  "stardew-valley": { name: "Stardew Valley", slug: "stardew-valley", rating: 4.8, background_image: "https://via.placeholder.com/300x180?text=Stardew+Valley", description_raw: "Farming life sim with exploration and community.", platforms: [{platform:{name:"PC"}},{platform:{name:"Switch"}},{platform:{name:"Mobile"}}] },
  "among-us": { name: "Among Us", slug: "among-us", rating: 4.2, background_image: "https://via.placeholder.com/300x180?text=Among+Us", description_raw: "Social deduction game in space.", platforms: [{platform:{name:"PC"}},{platform:{name:"Mobile"}},{platform:{name:"Switch"}}] },
  "the-witcher-3-wild-hunt": { name: "The Witcher 3", slug: "the-witcher-3-wild-hunt", rating: 4.9, background_image: "https://via.placeholder.com/300x180?text=The+Witcher+3", description_raw: "Open-world RPG where monster hunting meets story.", platforms: [{platform:{name:"PC"}},{platform:{name:"PS4"}},{platform:{name:"Xbox One"}}] }
};

const FALLBACK_FOOD = [
  { name: 'Pizza', number: 1 },
  { name: 'Popcorn', number: 2 },
  { name: 'Ice Cream', number: 3 },
  { name: 'Takeaway', number: 4 }
];

const DAYS = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];

const $ = id => document.getElementById(id);
const q = (sel, root = document) => root.querySelector(sel);
const qs = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));
const uid = () => 'bk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

let bookingWizard = {
  name: null,
  type: null,
  title: null,
  id: null,
  poster: null,
  rated: null,
  genre: null,
  runtime: null,
  plot: null,
  dayOfWeek: null,
  date: null,
  food: null
};

let moviesData = [];
let gamesData = [];
let foodItems = [];
let bookings = [];

const modalBody = $('modal-body');
const modal = $('modal');
const modalClose = $('modal-close');
const bookingsListEl = $('bookings-list');

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const [mJSON, gJSON, fJSON] = await Promise.all([
      fetch('movies.json').then(r => r.json()).catch(() => null),
      fetch('games.json').then(r => r.json()).catch(() => null),
      fetch('food.json').then(r => r.json()).catch(() => null)
    ]);

    foodItems = Array.isArray(fJSON) ? fJSON : FALLBACK_FOOD;

    const movieList = Array.isArray(mJSON)
      ? mJSON
      : Object.keys(FALLBACK_MOVIES).map(imdbId => ({ imdbId }));

    const gameList = Array.isArray(gJSON)
      ? gJSON
      : Object.keys(FALLBACK_GAMES).map(slug => ({ slug }));

    moviesData = await Promise.all(movieList.map(item => fetchMovieDetails(item.imdbId)));
    moviesData = moviesData.filter(Boolean);

    gamesData = await Promise.all(gameList.map(item => fetchGameDetails(item.slug)));
    gamesData = gamesData.filter(Boolean);

    bookings = loadBookings();
    renderBookings();
    wireUI();
    startWizard();
  } catch (error) {
    console.error('Init failed', error);
    bookings = loadBookings();
    renderBookings();
    wireUI();
    startWizard();
  }
}

async function fetchMovieDetails(imdbId) {
  if (!imdbId) return null;
  if (CONFIG.OMDB_API_KEY) {
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${CONFIG.OMDB_API_KEY}`);
      const data = await res.json();
      if (data && data.Response === 'True') return data;
    } catch (err) {
      console.warn('OMDb fetch failed', err);
    }
  }
  return FALLBACK_MOVIES[imdbId] || null;
}

async function fetchGameDetails(slug) {
  if (!slug) return null;
  if (CONFIG.RAWG_API_KEY) {
    try {
      const res = await fetch(`https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${CONFIG.RAWG_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        return { name: data.name || slug, slug, rating: data.rating || 'N/A', background_image: data.background_image || '', description_raw: data.description_raw || '', platforms: (data.platforms || []).map(p => (p.platform && p.platform.name) || p.name || '') };
      }
    } catch (err) {
      console.warn('RAWG fetch failed', err);
    }
  }
  return FALLBACK_GAMES[slug] || null;
}

function startWizard() {
  bookingWizard = { name: null, type: null, title: null, id: null, poster: null, rated: null, genre: null, runtime: null, plot: null, dayOfWeek: null, date: null, food: null };
  stepName();
}

function stepName() {
  modalBody.innerHTML = `
    <div style="text-align:center">
      <h2>👋 Who's booking?</h2>
      <div style="display:grid;gap:10px;margin-top:20px">
        ${CONFIG.USERS.map(user => `
          <button type="button" class="btn" data-action="select-user" data-name="${escapeAttr(user)}" style="padding:16px;font-size:16px;font-weight:700">${escapeHtml(user)}</button>
        `).join('')}
      </div>
    </div>`;
  openModal();
}

function checkPermissionForAdultContent() {
  stepType();
}

function stepType() {
  modalBody.innerHTML = `
    <div style="text-align:center">
      <h2>🎬 What's the plan?</h2>
      <div style="display:grid;gap:10px;margin-top:20px">
        <button type="button" class="btn" data-action="select-type" data-type="movie" style="padding:16px;font-size:16px;font-weight:700">🍿 Movie Night</button>
        <button type="button" class="btn" data-action="select-type" data-type="game" style="padding:16px;font-size:16px;font-weight:700">🎮 Game Night</button>
      </div>
    </div>`;
}

function stepTitle() {
  const list = bookingWizard.type === 'movie' ? moviesData : gamesData;
  const titleKey = bookingWizard.type === 'movie' ? 'Title' : 'name';
  const posterKey = bookingWizard.type === 'movie' ? 'Poster' : 'background_image';
  const idKey = bookingWizard.type === 'movie' ? 'imdbID' : 'slug';
  
  if (bookingWizard.type === 'movie') {
    modalBody.innerHTML = `
      <h2>🎬 Movies</h2>
      <div style="display:grid;gap:12px;margin-top:12px;max-height:60vh;overflow-y:auto;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))">
        ${list.map(item => `
          <button type="button" class="title-btn" data-id="${escapeAttr(item[idKey])}" data-title="${escapeAttr(item[titleKey])}" data-poster="${escapeAttr(item[posterKey] || '')}" data-rated="${escapeAttr(item.Rated || '')}" data-genre="${escapeAttr(item.Genre || '')}" data-runtime="${escapeAttr(item.Runtime || '')}" data-plot="${escapeAttr(item.Plot || '')}" style="display:flex;flex-direction:column;gap:8px;padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:inherit;cursor:pointer;text-align:center;align-items:center">
            <img src="${escapeAttr(item[posterKey] || 'https://via.placeholder.com/80x120?text=No+Image')}" alt="${escapeAttr(item[titleKey])}" style="width:80px;height:120px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,0.1);" />
            <div style="font-weight:700;font-size:13px;line-height:1.3">${escapeHtml(item[titleKey])}</div>
          </button>
        `).join('')}
      </div>`;
  } else {
    modalBody.innerHTML = `
      <h2>🎮 Games</h2>
      <div style="display:grid;gap:10px;margin-top:12px;max-height:60vh;overflow-y:auto">
        ${list.map(item => `
          <button type="button" class="title-btn" data-id="${escapeAttr(item[idKey])}" data-title="${escapeAttr(item[titleKey])}" data-poster="${escapeAttr(item[posterKey] || '')}" data-rated="${escapeAttr(item.Rated || '')}" style="text-align:left;padding:10px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:inherit;cursor:pointer">
            <div style="font-weight:700">${escapeHtml(item[titleKey])}</div>
            <div class="muted small">${escapeHtml((item.platforms || []).slice(0, 2).join(', '))}</div>
          </button>
        `).join('')}
      </div>`;
  }
  
  modalBody.querySelectorAll('.title-btn').forEach(btn => btn.setAttribute('data-action', bookingWizard.type === 'movie' ? 'show-movie-detail' : 'select-title'));
}

function isRatedForAdults(ratingStr) {
  if (!ratingStr) return false;
  const adultRatings = ['PG-13', 'R', 'NC-17', '15', '16', '18'];
  return adultRatings.some(r => ratingStr.includes(r));
}

function showPermissionReminder() {
  modalBody.innerHTML = `
    <div style="text-align:center">
      <h3 style="color:var(--warning,#ff9800);margin-bottom:12px">⚠️ Permission Required</h3>
      <p class="muted" style="font-size:16px;margin-bottom:16px">${escapeHtml(bookingWizard.name)}, this title is rated <strong>${escapeHtml(bookingWizard.rated)}</strong>.</p>
      <p class="muted" style="margin-bottom:20px">Please ask <strong>Charlotte (Mom)</strong> for permission before booking.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn" id="perm-yes" data-action="permission-yes">I have permission!</button>
        <button type="button" class="btn ghost" id="perm-no" data-action="permission-no">Go back</button>
      </div>
    </div>`;

  const permYes = $('#perm-yes');
  const permNo = $('#perm-no');
  if (permYes) permYes.addEventListener('click', stepDay);
  if (permNo) permNo.addEventListener('click', stepTitle);
}

function showMovieDetails() {
  const title = bookingWizard.title;
  const poster = bookingWizard.poster;
  const rated = bookingWizard.rated;
  const genre = bookingWizard.genre || '';
  const runtime = bookingWizard.runtime || '';
  const plot = bookingWizard.plot || '';

  const galleryImages = [poster, poster, poster, poster, poster].filter(Boolean).slice(0, 5);

  modalBody.innerHTML = `
    <div style="text-align:center">
      <button type="button" class="btn ghost small" id="detail-back" data-action="detail-back" style="align-self:flex-start">← Back</button>
      <img src="${escapeAttr(poster)}" alt="${escapeAttr(title)}" style="width:100%;max-width:300px;border-radius:8px;margin:12px 0;" />
      <h2>${escapeHtml(title)}</h2>
      <div style="text-align:left;margin:16px 0;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:rgba(255,255,255,0.02)">
        <p class="muted"><strong>Rated:</strong> ${escapeHtml(rated)}</p>
        <p class="muted"><strong>Genre:</strong> ${escapeHtml(genre)}</p>
        <p class="muted"><strong>Runtime:</strong> ${escapeHtml(runtime)}</p>
        <p class="muted" style="margin-top:12px"><strong>Plot:</strong><br />${escapeHtml(plot)}</p>
      </div>
      ${galleryImages.length > 0 ? `
        <div style="margin:16px 0">
          <h3 style="margin-bottom:12px">Gallery</h3>
          <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));max-height:150px;overflow-y:auto">
            ${galleryImages.map((img, idx) => `
              <img src="${escapeAttr(img)}" alt="Gallery ${idx + 1}" style="width:100%;height:100px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid rgba(255,255,255,0.1)" class="gallery-img" data-src="${escapeAttr(img)}" />
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
        <button type="button" class="btn ghost" data-action="detail-back">Back</button>
        <button type="button" class="btn" id="detail-confirm" data-action="confirm-movie-selection">Select This Movie</button>
      </div>
    </div>`;
}

function stepDay() {
  const today = new Date();
  const dayOptions = DAYS.map((day, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + (index - today.getDay() + 7) % 7);
    if (index === today.getDay()) date.setDate(date.getDate() + 7);
    return { day, date };
  });
  
  modalBody.innerHTML = `
    <h2>📅 Which day?</h2>
    <div style="display:grid;gap:10px;margin-top:12px">
      ${dayOptions.map(({day, date}) => `
        <button type="button" class="day-btn" data-day="${day}" data-date="${date.toISOString().split('T')[0]}" style="text-align:left;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:inherit;cursor:pointer;font-weight:700">
          ${day}
        </button>
      `).join('')}
    </div>`;
  
  modalBody.querySelectorAll('.day-btn').forEach(btn => btn.setAttribute('data-action', 'select-day'));
}

function stepFood() {
  bookingWizard.food = null;
  const hasExistingFoodOnDay = bookings.some(b => b.date === bookingWizard.date && b.food);

  if (hasExistingFoodOnDay) {
    modalBody.innerHTML = `
      <div style="text-align:center">
        <h2>🍿 Food</h2>
        <p class="muted" style="margin-top:12px">Food has already been ordered for a booking on ${escapeHtml(bookingWizard.date)}.</p>
        <p class="muted" style="margin-top:8px;margin-bottom:20px">You can't add another food order for the same day.</p>
        <div style="display:flex;gap:8px;justify-content:center">
          <button type="button" class="btn" id="no-food" data-action="skip-food">Continue without food</button>
        </div>
      </div>`;
  } else {
    modalBody.innerHTML = `
      <h2>🍿 Add Food? (Optional)</h2>
      <div style="display:grid;gap:10px;margin-top:12px">
        <button type="button" class="btn ghost" id="skip-food" data-action="skip-food" style="padding:12px">Skip</button>
        ${foodItems.map(food => `
          <button type="button" class="food-btn" data-action="select-food" data-name="${escapeAttr(food.name)}" data-number="${food.number}" style="text-align:left;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:transparent;color:inherit;cursor:pointer">
            <div style="font-weight:700">${escapeHtml(food.name)}</div>
            <div class="muted small">Number: ${food.number}</div>
          </button>
        `).join('')}
      </div>`;

    const foodButtons = Array.from(modalBody.querySelectorAll('.food-btn'));
    if (foodButtons.length === 0) {
      modalBody.innerHTML += `
        <p class="muted" style="margin-top:12px">No food options are available right now.</p>`;
    }
  }
}

function stepReview() {
  const typeLabel = bookingWizard.type === 'movie' ? '🎬 Movie' : '🎮 Game';
  const foodText = bookingWizard.food ? `${escapeHtml(bookingWizard.food.name)} (${bookingWizard.food.number})` : 'None';
  
  modalBody.innerHTML = `
    <h2>✅ Review Booking</h2>
    <div style="margin-top:16px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:8px;background:rgba(255,255,255,0.02)">
      <p class="muted"><strong>Name:</strong> ${escapeHtml(bookingWizard.name)}</p>
      <p class="muted"><strong>Type:</strong> ${escapeHtml(typeLabel)}</p>
      <p class="muted"><strong>Title:</strong> ${escapeHtml(bookingWizard.title)}</p>
      <p class="muted"><strong>Day:</strong> ${escapeHtml(bookingWizard.dayOfWeek)} (${escapeHtml(bookingWizard.date)})</p>
      <p class="muted"><strong>Food:</strong> ${escapeHtml(foodText)}</p>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
      <button type="button" class="btn ghost" id="review-back" data-action="review-back">Back</button>
      <button type="button" class="btn" id="review-submit" data-action="review-submit">Submit Booking</button>
    </div>`;
}

function submitBooking() {
  const booking = {
    id: uid(),
    name: bookingWizard.name,
    type: bookingWizard.type,
    title: bookingWizard.title,
    date: bookingWizard.date,
    dayOfWeek: bookingWizard.dayOfWeek,
    food: bookingWizard.food,
    poster: bookingWizard.poster,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  saveBookings(bookings);
  renderBookings();
  closeModal();
  
  setTimeout(() => {
    alert(`Booking saved for ${bookingWizard.name}!`);
    startWizard();
  }, 300);
}

function renderBookings() {
  bookings = loadBookings();
  bookingsListEl.innerHTML = '';
  if (!bookings.length) {
    bookingsListEl.innerHTML = '<p class="muted">No bookings yet.</p>';
    return;
  }

  bookings.sort((a, b) => a.date > b.date ? 1 : -1);
  bookings.forEach(bk => {
    const el = document.createElement('div');
    el.className = 'booking';
    const poster = bk.poster || 'https://via.placeholder.com/64x94?text=No';
    const foodText = bk.food ? `${bk.food.name} (#${bk.food.number})` : 'None';
    
    el.innerHTML = `
      <div class="left">
        <img class="thumb" src="${escapeAttr(poster)}" alt="${escapeAttr(bk.title || '')}" />
        <div class="info">
          <div style="font-weight:700">${escapeHtml(bk.title)}</div>
          <div class="muted small">by ${escapeHtml(bk.name)}</div>
          <div class="muted small">${escapeHtml(bk.dayOfWeek)} (${escapeHtml(bk.date)}) · ${escapeHtml((bk.type || '').toUpperCase())}</div>
          <div class="muted small">Food: ${escapeHtml(foodText)}</div>
        </div>
      </div>
      <div class="controls">
        <button type="button" class="btn ghost small delete-btn" data-id="${bk.id}">Delete</button>
      </div>`;
    bookingsListEl.appendChild(el);
  });
}

function wireUI() {
  const navBtn = $('nav-bookings');
  if (navBtn) {
    navBtn.addEventListener('click', () => {
      qs('section').forEach(s => s.classList.remove('active'));
      $('bookings-section').classList.add('active');
      qs('.nav-btn').forEach(b => b.classList.remove('active'));
      navBtn.classList.add('active');
    });
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modalBody.addEventListener('click', onModalAction);

  bookingsListEl.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('Delete this booking?')) {
        bookings = bookings.filter(b => b.id !== id);
        saveBookings(bookings);
        renderBookings();
      }
    }
  });

  const newBookingBtn = $('new-booking');
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', startWizard);
  }
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

function openModal() {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalBody.innerHTML = '';
}

function onModalAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  switch (action) {
    case 'select-user':
      bookingWizard.name = button.dataset.name;
      checkPermissionForAdultContent();
      break;

    case 'select-type':
      bookingWizard.type = button.dataset.type;
      stepTitle();
      break;

    case 'show-movie-detail':
      bookingWizard.id = button.dataset.id;
      bookingWizard.title = button.dataset.title;
      bookingWizard.poster = button.dataset.poster;
      bookingWizard.rated = button.dataset.rated;
      bookingWizard.genre = button.dataset.genre;
      bookingWizard.runtime = button.dataset.runtime;
      bookingWizard.plot = button.dataset.plot;
      showMovieDetails();
      break;

    case 'detail-back':
      stepTitle();
      break;

    case 'confirm-movie-selection':
      if (bookingWizard.type === 'movie' && (bookingWizard.name === 'Jackson' || bookingWizard.name === 'Joshua') && isRatedForAdults(bookingWizard.rated)) {
        showPermissionReminder();
      } else {
        stepDay();
      }
      break;

    case 'select-title':
      bookingWizard.id = button.dataset.id;
      bookingWizard.title = button.dataset.title;
      bookingWizard.poster = button.dataset.poster;
      bookingWizard.rated = button.dataset.rated;

      if (bookingWizard.type === 'movie' && (bookingWizard.name === 'Jackson' || bookingWizard.name === 'Joshua') && isRatedForAdults(bookingWizard.rated)) {
        showPermissionReminder();
      } else {
        stepDay();
      }
      break;

    case 'permission-yes':
      stepDay();
      break;

    case 'permission-no':
      stepTitle();
      break;

    case 'select-day':
      bookingWizard.dayOfWeek = button.dataset.day;
      bookingWizard.date = button.dataset.date;
      stepFood();
      break;

    case 'skip-food':
      bookingWizard.food = null;
      stepReview();
      break;

    case 'select-food':
      bookingWizard.food = { name: button.dataset.name, number: parseInt(button.dataset.number, 10) || 0 };
      stepReview();
      break;

    case 'review-back':
      stepFood();
      break;

    case 'review-submit':
      submitBooking();
      break;

    default:
      break;
  }
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
