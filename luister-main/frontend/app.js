const DB = {
  users: [
    { id: 1, name: 'Demo User', email: 'demo@luister.fm', password: 'demo123', plan: 'pro', joined: '2024-01-15', avatar: 'D' }
  ],
  sessions: {},
  likedTracks: {},
  likedAlbums: {},
  followedArtists: {},
  playHistory: {},
  playlists: {},

  // ── CRUD methods ──
  createUser(name, email, password) {
    if (this.users.find(u => u.email === email)) return { error: 'Email already registered' };
    const user = { id: Date.now(), name, email, password, plan: 'free', joined: new Date().toISOString().split('T')[0], avatar: name[0].toUpperCase() };
    this.users.push(user);
    this.likedTracks[user.id] = [];
    this.playHistory[user.id] = [];
    this.followedArtists[user.id] = [];
    return { user };
  },
  authenticate(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    const token = 'tok_' + Math.random().toString(36).slice(2);
    this.sessions[token] = user.id;
    return { user, token };
  },
  getUser(token) {
    const uid = this.sessions[token];
    return uid ? this.users.find(u => u.id === uid) : null;
  },
  toggleLike(userId, trackId) {
    if (!this.likedTracks[userId]) this.likedTracks[userId] = [];
    const idx = this.likedTracks[userId].indexOf(trackId);
    if (idx === -1) { this.likedTracks[userId].push(trackId); return true; }
    else { this.likedTracks[userId].splice(idx, 1); return false; }
  },
  toggleFollow(userId, artistId) {
    if (!this.followedArtists[userId]) this.followedArtists[userId] = [];
    const idx = this.followedArtists[userId].indexOf(artistId);
    if (idx === -1) { this.followedArtists[userId].push(artistId); return true; }
    else { this.followedArtists[userId].splice(idx, 1); return false; }
  },
  addHistory(userId, track) {
    if (!this.playHistory[userId]) this.playHistory[userId] = [];
    this.playHistory[userId].unshift({ ...track, playedAt: new Date().toLocaleTimeString() });
    if (this.playHistory[userId].length > 50) this.playHistory[userId].pop();
  },
  search(query) {
    const q = query.toLowerCase();
    const results = [];
    TRACKS.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)) {
        results.push({ type: 'track', ...t });
      }
    });
    ARTISTS.forEach(a => {
      if (a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)) {
        results.push({ type: 'artist', ...a });
      }
    });
    ALBUMS.forEach(a => {
      if (a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)) {
        results.push({ type: 'album', ...a });
      }
    });
    return results.slice(0, 6);
  }
};

const API = {
  async request(endpoint, method = 'GET', body = null) {
  const BASE = 'http://localhost:8000';
  const token = localStorage.getItem('luister_token');

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
  },
};

const TRACKS = [
{ id: 1, name: 'Midnight Ambience', artist: 'Aura Collective', genre: 'Ambient', dur: '4:02', durSec: 242, src: 'songs/song1.mp3', wave: [14,8,18,5,12,20,9,16,7,22,11,15], color: '#c9a96e' },  { id: 2, name: 'Golden Hour Drift', artist: 'Luminara', genre: 'Electronic', dur: '3:47', durSec: 227, wave: [10,18,6,22,14,8,19,5,16,12,20,9], color: '#d4a96a' },
  { id: 3, name: 'Glass Cathedral', artist: 'Sable & Mist', genre: 'Neo-Classical', dur: '5:14', durSec: 314, wave: [20,9,15,7,18,12,5,22,10,16,8,14], color: '#b8956a' },
  { id: 4, name: 'Velvet Horizon', artist: 'Solène', genre: 'Dream Pop', dur: '3:55', durSec: 235, wave: [6,16,11,20,8,15,22,9,18,5,12,17], color: '#c09050' },
  { id: 5, name: 'Dissolve', artist: 'ÉTHR', genre: 'Ambient', dur: '6:08', durSec: 368, wave: [18,5,14,22,8,16,10,20,7,15,12,9], color: '#e8c98a' },
  { id: 6, name: 'Neon Rain', artist: 'Hollowcraft', genre: 'Synthwave', dur: '4:28', durSec: 268, wave: [12,20,7,14,22,9,17,5,16,11,19,8], color: '#d4b07a' },
  { id: 7, name: 'Salt Flats', artist: 'Aurore', genre: 'Minimal Techno', dur: '7:22', durSec: 442, wave: [8,14,20,6,18,10,22,7,15,12,9,16], color: '#c8a060' },
  { id: 8, name: 'Mercury Tide', artist: 'Miroir', genre: 'Ambient Jazz', dur: '5:50', durSec: 350, wave: [16,10,8,18,5,22,12,7,20,14,9,15], color: '#b89060' },
];

const ALBUMS = [
  { id: 1, name: 'Nocturne Vol. I', artist: 'Aura Collective', year: '2025', col1: 'rgba(201,169,110,0.32)', col2: 'rgba(120,90,50,0.22)', pos: '30% 40%' },
  { id: 2, name: 'Glass & Fog', artist: 'Luminara', year: '2024', col1: 'rgba(160,130,90,0.32)', col2: 'rgba(200,160,100,0.18)', pos: '70% 30%' },
  { id: 3, name: 'The Pale Shore', artist: 'Sable & Mist', year: '2025', col1: 'rgba(180,150,100,0.28)', col2: 'rgba(140,110,70,0.22)', pos: '50% 60%' },
  { id: 4, name: 'Liminal Spaces', artist: 'ÉTHR', year: '2024', col1: 'rgba(210,180,120,0.22)', col2: 'rgba(160,130,80,0.28)', pos: '25% 70%' },
  { id: 5, name: 'Velvet Midnight', artist: 'Solène', year: '2025', col1: 'rgba(190,160,100,0.32)', col2: 'rgba(150,120,70,0.22)', pos: '65% 50%' },
  { id: 6, name: 'Static Light', artist: 'Hollowcraft', year: '2023', col1: 'rgba(170,140,90,0.28)', col2: 'rgba(200,170,110,0.18)', pos: '40% 35%' },
];

const ARTISTS = [
  { id: 1, name: 'Aura Collective', genre: 'Ambient / Electronic', followers: '1.2M', init: 'A' },
  { id: 2, name: 'Luminara', genre: 'Electronic / Dream', followers: '845K', init: 'L' },
  { id: 3, name: 'Sable & Mist', genre: 'Neo-Classical', followers: '630K', init: 'S' },
  { id: 4, name: 'ÉTHR', genre: 'Dark Ambient', followers: '520K', init: 'E' },
  { id: 5, name: 'Solène', genre: 'Dream Pop', followers: '980K', init: 'S' },
  { id: 6, name: 'Hollowcraft', genre: 'Synthwave', followers: '715K', init: 'H' },
  { id: 7, name: 'Aurore', genre: 'Minimal Techno', followers: '440K', init: 'A' },
  { id: 8, name: 'Miroir', genre: 'Ambient Jazz', followers: '295K', init: 'M' },
];

const PLAYLISTS = [
  { name: 'Late Night Drive', desc: 'Dark highways and glowing city lights', count: '42 tracks', icon: 'music' },
  { name: 'Rainy Morning', desc: 'Soft piano and distant thunder', count: '28 tracks', icon: 'headphones' },
  { name: 'Deep Focus', desc: 'Minimal textures for sustained attention', count: '55 tracks', icon: 'plus-circle' },
  { name: 'Golden Hour', desc: 'Warm analog sounds at dusk', count: '36 tracks', icon: 'star' },
  { name: 'Dream Sequence', desc: 'Oceanic reverb and slow harmonics', count: '48 tracks', icon: 'moon' },
  { name: 'Ambient Sanctuary', desc: 'Silence given form and frequency', count: '31 tracks', icon: 'refresh' },
];

const VIBES = {
  calm: 'Soft ambient textures and slow harmonic progressions. A sanctuary of stillness and warmth.',
  focus: 'Minimal rhythmic loops and clean electronic tones to anchor your attention effortlessly.',
  dream: 'Reverb-drenched soundscapes that dissolve the line between waking and sleep.',
  night: 'Glittering synths and muted bass for long roads under a velvet sky.',
  deep: 'Sub-bass frequencies and meditative drones from the furthest reaches of sound.',
  raw: 'Unfiltered analog warmth. The tape hiss, the room, the breath. Music at its core.',
};

const PLANS = [
  { name: 'Free', price: 0, period: 'Forever', features: ['Ad-supported listening', '320kbps streaming', 'Basic EQ', 'Mobile access', '10 skips/hour'], cta: 'Get Started', style: 'outline', featured: false },
  { name: 'Pro', price: 9.99, period: '/month', features: ['Ad-free listening', 'Lossless FLAC audio', 'Full parametric EQ', 'Offline downloads', 'Unlimited skips', 'Spatial audio'], cta: 'Start Free Trial', style: 'filled', featured: true },
  { name: 'Studio', price: 19.99, period: '/month', features: ['Everything in Pro', '24-bit / 96kHz audio', 'DJ mixing tools', 'Artist analytics', 'API access', 'Priority support', 'Early access features'], cta: 'Contact Sales', style: 'outline', featured: false },
];

const EQ_FREQS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
const EQ_PRESETS = {
  flat:   [50,50,50,50,50,50,50,50,50,50],
  bass:   [80,75,65,55,50,45,45,45,45,45],
  vocal:  [45,45,48,55,68,70,68,60,50,45],
  treble: [45,45,45,45,48,55,62,70,76,80],
  lounge: [60,58,54,50,50,52,56,60,62,62],
  deep:   [85,78,68,58,50,45,42,40,40,40],
};

let audioCtx = null;
let gainNode = null, eqNodes = [], analyserNode = null, oscillatorNode = null, lfoNode = null;
let isAudioInit = false;
let visData = new Uint8Array(128);

function initAudio() {
  if (isAudioInit) return;
  isAudioInit = true;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 256;
  visData = new Uint8Array(analyserNode.frequencyBinCount);
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.8;

  // Build EQ chain
  const eqFreqs = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  eqFreqs.forEach((freq, i) => {
    const f = audioCtx.createBiquadFilter();
    f.type = i === 0 ? 'lowshelf' : i === eqFreqs.length - 1 ? 'highshelf' : 'peaking';
    f.frequency.value = freq;
    f.Q.value = 1;
    f.gain.value = 0;
    eqNodes.push(f);
  });

  // Connect: oscillator → eq chain → gain → analyser → dest
  let prev = null;
  eqNodes.forEach(n => {
    if (prev) prev.connect(n);
    prev = n;
  });
  eqNodes[eqNodes.length - 1].connect(gainNode);
  gainNode.connect(analyserNode);
  analyserNode.connect(audioCtx.destination);
}

function startOscillator(track) {
  stopOscillator();
  if (!isAudioInit) initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  oscillatorNode = audioCtx.createOscillator();
  oscillatorNode.type = 'sine';
  oscillatorNode.frequency.value = 80 + (track.id * 17);

  lfoNode = audioCtx.createOscillator();
  lfoNode.frequency.value = 0.08;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 12;
  lfoNode.connect(lfoGain);
  lfoGain.connect(oscillatorNode.frequency);

  const oscGain = audioCtx.createGain();
  oscGain.gain.value = 0.04;
  oscillatorNode.connect(oscGain);
  oscGain.connect(eqNodes[0]);

  oscillatorNode.start();
  lfoNode.start();
}

function stopOscillator() {
  try { oscillatorNode?.stop(); lfoNode?.stop(); } catch(e) {}
  oscillatorNode = null; lfoNode = null;
}

function setVolume(v) {
  if (gainNode) gainNode.gain.value = v / 100;
}

function applyEQBand(bandIndex, value) {
  if (!eqNodes.length) return;
  const db = (value - 50) * 0.28; // -14dB to +14dB
  eqNodes[bandIndex].gain.value = db;
}

let currentTrack = 0, isPlaying = false, progress = 0, isShuffle = false, repeatMode = 0;

const audio = new Audio();

let progTimer = null, vol = 80;
let currentUser = null;

function togglePlay() {
  if (!isAudioInit) initAudio();
  isPlaying = !isPlaying;
  document.getElementById('playBtn').classList.toggle('playing', isPlaying);
  const npbPlay = document.getElementById('npbPlayBtn');
  npbPlay.querySelector('.play-icon').style.display = isPlaying ? 'none' : 'block';
  npbPlay.querySelector('.pause-icon').style.display = isPlaying ? 'block' : 'none';

  if (isPlaying) {

  audio.src = TRACKS[currentTrack].src;
  audio.play();

    //startOscillator(TRACKS[currentTrack]);
    startProgress();
    updateMiniBarAnim(true);
  } else {

    audio.pause();

    stopOscillator();
    stopProgress();
    updateMiniBarAnim(false);
  }
}

function startProgress() {
  stopProgress();
  progTimer = setInterval(() => {
    const track = TRACKS[currentTrack];
    progress += (100 / (track.durSec * 20));
    if (progress >= 100) {
      progress = 0;
      if (repeatMode === 1) { renderProgress(); return; }
      nextTrack(); return;
    }
    renderProgress();
  }, 50);
}

function stopProgress() { clearInterval(progTimer); }

function renderProgress() {
  const pct = Math.min(progress, 100);
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('npbFill').style.width = pct + '%';
  const track = TRACKS[currentTrack];
  const sec = Math.floor(track.durSec * pct / 100);
  document.getElementById('timeNow').textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
}

async function playTrack(idx) {
  if (isShuffle) idx = Math.floor(Math.random() * TRACKS.length);
  currentTrack = idx;
  const track = TRACKS[idx];
  progress = 0;
  document.getElementById('trackName').textContent = track.name;
  document.getElementById('artistName').textContent = track.artist;
  document.getElementById('npbTrack').textContent = track.name;
  document.getElementById('npbArtist').textContent = track.artist;
  document.getElementById('timeTotal').textContent = track.dur;

  // Mark playing row
  document.querySelectorAll('.track-row').forEach((r, i) => r.classList.toggle('playing-now', i === idx));
  const bars = document.querySelectorAll('.mini-bars');
  bars.forEach((b, i) => b.classList.toggle('animating', i === idx && isPlaying));

  if (isPlaying) {
    //stopOscillator();
    //startOscillator(track);
  } else {
    if (!isPlaying) togglePlay();
  }

  // API call
  API.request('/player/play', 'POST', { track });
  updateArtworkCanvas(track);
  renderQueueList();
}

function nextTrack() {
  const next = isShuffle ? Math.floor(Math.random() * TRACKS.length) : (currentTrack + 1) % TRACKS.length;
  playTrack(next);
}
function prevTrack() {
  if (progress > 10) { progress = 0; renderProgress(); return; }
  const prev = (currentTrack - 1 + TRACKS.length) % TRACKS.length;
  playTrack(prev);
}

function toggleLike() {
  if (!currentUser) { openAuth('signin'); return; }
  const btn = document.getElementById('likeBtn');
  const track = TRACKS[currentTrack];
  API.request('/tracks/like', 'POST', { trackId: track.id }).then(r => {
    btn.classList.toggle('liked', r.liked);
    // sync track row like
    document.querySelectorAll('.t-like')[currentTrack]?.classList.toggle('liked', r.liked);
    showToast(r.liked ? `Liked "${track.name}"` : `Removed from library`);
  });
}

function toggleTrackLike(idx, btn) {
  if (!currentUser) { openAuth('signin'); return; }
  const track = TRACKS[idx];
  API.request('/tracks/like', 'POST', { trackId: track.id }).then(r => {
    btn.classList.toggle('liked', r.liked);
    showToast(r.liked ? `Liked "${track.name}"` : `Removed from library`);
  });
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
  showToast(isShuffle ? 'Shuffle on' : 'Shuffle off');
}

function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  const btn = document.getElementById('repeatBtn');
  btn.classList.toggle('active', repeatMode > 0);
  const labels = ['', 'Repeat track', 'Repeat all'];
  if (repeatMode > 0) showToast(labels[repeatMode]);
}

let queueOpen = false;
function toggleQueue() {
  queueOpen = !queueOpen;
  document.getElementById('queuePanel').classList.toggle('open', queueOpen);
  if (queueOpen) renderQueueList();
}

function renderQueueList() {
  const el = document.getElementById('queueList');
  el.innerHTML = TRACKS.map((t, i) => `
    <div class="queue-item ${i === currentTrack ? 'current' : ''}" onclick="playTrack(${i})">
      <div class="queue-num">${String(i+1).padStart(2,'0')}</div>
      <div class="queue-info"><h5>${t.name}</h5><p>${t.artist}</p></div>
      <div class="queue-dur">${t.dur}</div>
    </div>
  `).join('');
}

function updateMiniBarAnim(playing) {
  const bars = document.querySelectorAll('.mini-bars');
  bars.forEach((b, i) => b.classList.toggle('animating', i === currentTrack && playing));
}

document.getElementById('progTrack').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  progress = ((e.clientX - rect.left) / rect.width) * 100;
  renderProgress();
});

const artCanvas = document.getElementById('artworkCanvas');
const artCtx = artCanvas.getContext('2d');
let artT = 0, artAnimId;

function updateArtworkCanvas(track) {
  cancelAnimationFrame(artAnimId);
  function draw() {
    artT++;
    const W = artCanvas.width, H = artCanvas.height;
    artCtx.clearRect(0, 0, W, H);
    artCtx.fillStyle = '#0d0b06';
    artCtx.fillRect(0, 0, W, H);

    const [r,g,b] = hexToRgb(track.color || '#c9a96e');
    // Breathing orb
    const oR = Math.sin(artT * 0.018) * 20 + 80;
    const grd = artCtx.createRadialGradient(W*.35, H*.45, 0, W*.35, H*.45, oR + 60);
    grd.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
    grd.addColorStop(0.4, `rgba(${r},${g},${b},0.22)`);
    grd.addColorStop(1, 'transparent');
    artCtx.fillStyle = grd; artCtx.fillRect(0, 0, W, H);

    const grd2 = artCtx.createRadialGradient(W*.75, H*.6, 0, W*.75, H*.6, 100);
    grd2.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
    grd2.addColorStop(1, 'transparent');
    artCtx.fillStyle = grd2; artCtx.fillRect(0, 0, W, H);

    // Rings
    [60, 100, 145, 195].forEach((radius, i) => {
      const phase = artT * 0.015 + i * 0.8;
      const alpha = 0.08 + Math.sin(phase) * 0.05;
      artCtx.beginPath();
      artCtx.arc(W*.35, H*.45, radius + Math.sin(artT * 0.012 + i) * 6, 0, Math.PI * 2);
      artCtx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      artCtx.lineWidth = 1;
      artCtx.stroke();
    });

    // Waveform
    if (isAudioInit && analyserNode) {
      analyserNode.getByteFrequencyData(visData);
      artCtx.beginPath();
      artCtx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
      artCtx.lineWidth = 1.5;
      const sliceW = W / visData.length * 2;
      let x = 0;
      for (let i = 0; i < visData.length / 2; i++) {
        const y = H - (visData[i] / 255) * H * 0.5 - H * 0.08;
        i === 0 ? artCtx.moveTo(x, y) : artCtx.lineTo(x, y);
        x += sliceW;
      }
      artCtx.stroke();
    }
    artAnimId = requestAnimationFrame(draw);
  }
  const resizeArt = () => { artCanvas.width = artCanvas.offsetWidth; artCanvas.height = artCanvas.offsetHeight; };
  resizeArt(); window.removeEventListener('resize', resizeArt); window.addEventListener('resize', resizeArt);
  draw();
}


const bg = document.getElementById('bg');
const bgCtx = bg.getContext('2d');
let bgW, bgH, bgT = 0, mx = 0, my = 0;
const ORBS = [
  { x:.2, y:.3, r:.35, col:'#c9a96e', spd:.00008, amp:80, ph:0 },
  { x:.75,y:.55,r:.28, col:'#b8956a', spd:.00006, amp:60, ph:2 },
  { x:.5, y:.15,r:.22, col:'#e8c98a', spd:.0001,  amp:50, ph:4 },
  { x:.1, y:.75,r:.2,  col:'#d4a96a', spd:.00007, amp:70, ph:1.5 },
  { x:.85,y:.2, r:.18, col:'#c09050', spd:.00009, amp:55, ph:3 },
];
function hex2r(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }
function hexToRgb(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }

function resizeBg() { bgW = bg.width = window.innerWidth; bgH = bg.height = window.innerHeight; }
resizeBg(); window.addEventListener('resize', resizeBg);

function drawBg() {
  bgT++;
  bgCtx.clearRect(0, 0, bgW, bgH);
  bgCtx.fillStyle = '#0d0b08';
  bgCtx.fillRect(0, 0, bgW, bgH);
  ORBS.forEach(o => {
    const ox = o.x * bgW + Math.sin(bgT * o.spd + o.ph) * o.amp + (mx - bgW/2) * 0.022;
    const oy = o.y * bgH + Math.cos(bgT * o.spd * 0.8 + o.ph * 1.3) * (o.amp * 0.7) + (my - bgH/2) * 0.016;
    const rad = Math.min(bgW, bgH) * o.r;
    const [r,g,b] = hex2r(o.col);
    const grd = bgCtx.createRadialGradient(ox, oy, 0, ox, oy, rad);
    grd.addColorStop(0, `rgba(${r},${g},${b},0.13)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`);
    grd.addColorStop(1, 'transparent');
    bgCtx.fillStyle = grd; bgCtx.fillRect(0, 0, bgW, bgH);
  });
  requestAnimationFrame(drawBg);
}
drawBg();


function buildHeroVis() {
  const wrap = document.getElementById('heroVis');
  wrap.innerHTML = '';
  const N = Math.floor(window.innerWidth / 5);
  for (let i = 0; i < N; i++) {
    const b = document.createElement('div');
    b.className = 'vis-bar';
    b.style.height = (Math.sin(i * 0.15) * 18 + 20) + 'px';
    wrap.appendChild(b);
  }
  setInterval(() => {
    const bars = wrap.querySelectorAll('.vis-bar');
    bars.forEach((b, i) => {
      const h = Math.abs(Math.sin((Date.now() * 0.001) + i * 0.15)) * 40 + 5;
      b.style.height = h + 'px';
    });
  }, 80);
}


const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
  ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
  mx = e.clientX; my = e.clientY;
});
document.addEventListener('mousedown', () => ring.classList.add('cursor-click'));
document.addEventListener('mouseup', () => ring.classList.remove('cursor-click'));
document.querySelectorAll('a, button, .track-row, .album-card, .artist-card, .playlist-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('cursor-expand'));
  el.addEventListener('mouseleave', () => ring.classList.remove('cursor-expand'));
});


function openAuth(tab) {
  document.getElementById('authModal').classList.add('open');
  switchTab(tab || 'signin');
}
function closeAuth() { document.getElementById('authModal').classList.remove('open'); }
function switchTab(tab) {
  document.getElementById('tabSignin').classList.toggle('active', tab === 'signin');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('signinForm').style.display = tab === 'signin' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
}

async function handleSignIn() {
  const email = document.getElementById('siEmail').value;
  const pass = document.getElementById('siPassword').value;
  const err = document.getElementById('siError');
  err.classList.remove('show');
  const res = await API.request('/auth/login', 'POST', { email, password: pass });
  if (res.error) { err.classList.add('show'); return; }
  currentUser = res.user;
  onLogin(res.user);
  closeAuth();
}

async function handleSignUp() {
  const name = document.getElementById('suName').value;
  const email = document.getElementById('suEmail').value;
  const pass = document.getElementById('suPassword').value;
  const err = document.getElementById('suError');
  err.classList.remove('show');
  if (!name || !email || pass.length < 6) {
    err.textContent = 'Please fill all fields (password 6+ chars)';
    err.classList.add('show'); return;
  }
  const res = await API.request('/auth/register', 'POST', { name, email, password: pass });
  if (res.error) { err.textContent = res.error; err.classList.add('show'); return; }
  currentUser = res.user;
  onLogin(res.user);
  closeAuth();
}

function onLogin(user) {
  document.getElementById('navGuest').style.display = 'none';
  document.getElementById('navUser').style.display = 'flex';
  document.getElementById('navAvatar').textContent = user.avatar;
  document.getElementById('navName').textContent = user.name;
  showToast(`Welcome back, ${user.name} ✦`);
  DB.likedTracks[user.id] = DB.likedTracks[user.id] || [];
  DB.followedArtists[user.id] = DB.followedArtists[user.id] || [];
  DB.playHistory[user.id] = DB.playHistory[user.id] || [];
}

async function signOut() {
  await API.request('/auth/logout', 'POST');
  currentUser = null;
  document.getElementById('navGuest').style.display = 'flex';
  document.getElementById('navUser').style.display = 'none';
  showToast('Signed out');
}

// Auto-restore session
async function restoreSession() {
  const token = localStorage.getItem('luister_token');
  if (!token) return;
  const res = await API.request('/auth/me');
  if (res.user) { currentUser = res.user; onLogin(res.user); }
}


let libTab = 'liked';

function openLibrary() {
  if (!currentUser) { openAuth('signin'); return; }
  document.getElementById('librarySidebar').classList.add('open');
  renderLibTab(libTab);
}
function closeLibrary() { document.getElementById('librarySidebar').classList.remove('open'); }

function switchLibTab(tab) {
  libTab = tab;
  document.querySelectorAll('.lib-tab').forEach((t, i) => t.classList.toggle('active', ['liked','history','playlists'][i] === tab));
  renderLibTab(tab);
}

async function renderLibTab(tab) {
  const el = document.getElementById('libContent');
  el.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:0.8rem;">Loading…</div>';

  if (tab === 'liked') {
    const res = await API.request('/library/liked');
    if (!res.tracks.length) { el.innerHTML = '<div class="lib-empty">No liked tracks yet.<br>Tap ♥ on any track to save it.</div>'; return; }
    el.innerHTML = res.tracks.map(t => `
      <div class="lib-item" onclick="playTrack(${t.id - 1})">
        <div class="lib-item-art">♪</div>
        <div class="lib-item-info"><h5>${t.name}</h5><p>${t.artist} · ${t.dur}</p></div>
      </div>`).join('');
  }
  else if (tab === 'history') {
    const res = await API.request('/library/history');
    if (!res.history.length) { el.innerHTML = '<div class="lib-empty">Nothing played yet.<br>Start listening!</div>'; return; }
    el.innerHTML = res.history.slice(0, 20).map(t => `
      <div class="lib-item">
        <div class="lib-item-art">▶</div>
        <div class="lib-item-info"><h5>${t.name}</h5><p>${t.artist} · ${t.playedAt}</p></div>
      </div>`).join('');
  }
  else {
    el.innerHTML = '<div class="lib-empty">Create your first playlist to get started.</div>';
  }
}


let searchTimer;
document.getElementById('navSearch').addEventListener('input', e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  if (q.length < 2) { document.getElementById('searchDropdown').classList.remove('open'); return; }
  searchTimer = setTimeout(async () => {
    const res = await API.request('/search', 'POST', { query: q });
    renderSearchResults(res.results);
  }, 180);
});

function renderSearchResults(results) {
  const dd = document.getElementById('searchDropdown');
  if (!results.length) { dd.classList.remove('open'); return; }
  dd.innerHTML = results.map(r => `
    <div class="search-result" onclick="handleSearchSelect('${r.type}','${r.id || r.name}')">
      <div class="search-result-icon">${r.type === 'track' ? '♪' : r.type === 'artist' ? r.init || '✦' : '◉'}</div>
      <div class="search-result-info">
        <div class="search-result-name">${r.name}</div>
        <div class="search-result-sub">${r.artist || r.genre || ''}</div>
      </div>
      <div class="search-result-type">${r.type}</div>
    </div>`).join('');
  dd.classList.add('open');
}

function handleSearchSelect(type, id) {
  document.getElementById('searchDropdown').classList.remove('open');
  document.getElementById('navSearch').value = '';
  if (type === 'track') {
    const idx = TRACKS.findIndex(t => t.id == id);
    if (idx !== -1) playTrack(idx);
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-search-wrap')) document.getElementById('searchDropdown').classList.remove('open');
});

function setVibe(btn) {
  document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const desc = document.getElementById('vibeDesc');
  desc.style.opacity = 0;
  setTimeout(() => { desc.textContent = VIBES[btn.dataset.vibe]; desc.style.opacity = 1; }, 320);
}


function buildEQ() {
  const wrap = document.getElementById('eqBars');
  wrap.innerHTML = EQ_FREQS.map((freq, i) => `
    <div class="eq-bar-wrap">
      <input type="range" class="eq-slider" min="0" max="100" value="50" orient="vertical"
        oninput="applyEQBand(${i}, this.value)" id="eq${i}">
      <div class="eq-freq">${freq}</div>
    </div>`).join('');
}

function applyEQPreset(name, btn) {
  document.querySelectorAll('.eq-preset').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const preset = EQ_PRESETS[name];
  preset.forEach((val, i) => {
    const slider = document.getElementById('eq' + i);
    if (slider) slider.value = val;
    applyEQBand(i, val);
  });
  showToast(`EQ: ${btn.textContent}`);
}


function renderTracks() {
  const el = document.getElementById('trackList');
  el.innerHTML = TRACKS.map((t, i) => `
    <div class="track-row" onclick="playTrack(${i})">
      <div style="text-align:center;position:relative;">
        <div class="t-num">${String(i+1).padStart(2,'0')}</div>
        <div class="t-play-icon"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
      </div>
      <div class="t-art">
        <div class="mini-bars" id="minibars${i}">
          ${t.wave.slice(0,5).map(h => `<span style="height:${h}px"></span>`).join('')}
        </div>
      </div>
      <div class="t-info"><h4>${t.name}</h4><p>${t.artist}</p></div>
      <span class="t-genre">${t.genre}</span>
      <span class="t-dur">${t.dur}</span>
      <button class="t-like" onclick="event.stopPropagation();toggleTrackLike(${i},this)" id="tlike${i}">
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>`).join('');
}

function renderAlbums() {
  const el = document.getElementById('albumGrid');
  el.innerHTML = ALBUMS.map((a, i) => `
    <div class="album-card">
      <div class="album-art">
        <div class="album-orb" style="width:80%;height:80%;top:10%;left:10%;background:radial-gradient(circle at ${a.pos},${a.col1} 0%,transparent 65%)"></div>
        <div class="album-orb" style="width:60%;height:60%;bottom:5%;right:5%;background:radial-gradient(circle,${a.col2} 0%,transparent 70%)"></div>
        <div class="album-overlay">
          <button class="album-play-btn" onclick="playTrack(${i % TRACKS.length})">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
      </div>
      <div class="album-meta">
        <h4>${a.name}</h4>
        <p>${a.artist}</p>
        <span>${a.year}</span>
      </div>
    </div>`).join('');
}

function renderArtists() {
  const el = document.getElementById('artistsScroll');
  el.innerHTML = ARTISTS.map(a => `
    <div class="artist-card">
      <div class="artist-avatar">${a.init}</div>
      <div class="artist-name">${a.name}</div>
      <div class="artist-genre">${a.genre}</div>
      <div class="artist-followers">${a.followers} listeners</div>
      <button class="follow-btn" onclick="handleFollow(${a.id},this)">Follow</button>
    </div>`).join('');
}

function renderPlaylists() {
  const icons = ['M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z',
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v8M8 12h8',
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    'M2.5 2v6h6M21.5 22v-6h-6M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2'];
  const el = document.getElementById('playlistGrid');
  el.innerHTML = PLAYLISTS.map((p, i) => `
    <div class="playlist-card">
      <div class="playlist-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke="var(--gold)">
          <path d="${icons[i]}"/>
        </svg>
      </div>
      <div class="playlist-info">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <span>${p.count}</span>
      </div>
    </div>`).join('');
}

function renderPricing() {
  const el = document.getElementById('pricingGrid');
  el.innerHTML = PLANS.map(p => `
    <div class="plan-card ${p.featured ? 'featured' : ''}">
      ${p.featured ? '<div class="plan-badge">Most Popular</div>' : ''}
      <div class="plan-name">${p.name}</div>
      <div class="plan-price">${p.price === 0 ? 'Free' : `<sup>$</sup>${p.price}`}</div>
      <div class="plan-period">${p.period}</div>
      <ul class="plan-features">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="plan-cta ${p.style}" onclick="openAuth('signup')">${p.cta}</button>
    </div>`).join('');
}

async function handleFollow(artistId, btn) {
  if (!currentUser) { openAuth('signin'); return; }
  const res = await API.request('/artists/follow', 'POST', { artistId });
  btn.classList.toggle('following', res.following);
  btn.textContent = res.following ? 'Following' : 'Follow';
  showToast(res.following ? 'Artist followed' : 'Unfollowed');
}


window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
  document.getElementById('npb').classList.toggle('visible', scrollY > window.innerHeight * 0.5);
  document.querySelectorAll('.fade-in').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('visible');
  });
});

function scrollToPlayer() {
  document.getElementById('playerSection').scrollIntoView({ behavior: 'smooth' });
}


function showToast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-dot"></div>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 2800);
}


function animateCounter(el, target, suffix = '') {
  let start = 0; const dur = 1800; const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const val = Math.floor(p * target);
    el.textContent = (val >= 1000 ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'K' : val) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = (target >= 1000 ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K' : target) + suffix;
  };
  requestAnimationFrame(step);
}

const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(document.getElementById('statTracks'), 48200, '+');
      animateCounter(document.getElementById('statArtists'), 12400, '+');
      animateCounter(document.getElementById('statListeners'), 3200000, '');
      animateCounter(document.getElementById('statPlays'), 85000000, '');
      statsObs.disconnect();
    }
  });
}, { threshold: 0.3 });
statsObs.observe(document.querySelector('.stats-section'));


const LOADER_MSGS = ['Initializing database…', 'Loading audio engine…', 'Fetching catalog…', 'Calibrating EQ…', 'Ready to listen…'];
let msgIdx = 0;
const loaderInterval = setInterval(() => {
  msgIdx++;
  if (msgIdx < LOADER_MSGS.length) document.getElementById('loaderStatus').textContent = LOADER_MSGS[msgIdx];
}, 480);

window.addEventListener('load', () => {
  setTimeout(() => {
    clearInterval(loaderInterval);
    document.getElementById('loader').classList.add('hidden');

    // Render everything
    renderTracks();
    renderAlbums();
    renderArtists();
    renderPlaylists();
    renderPricing();
    buildEQ();
    buildHeroVis();
    renderQueueList();

    // Init artwork canvas with first track
    updateArtworkCanvas(TRACKS[0]);

    // Initial fade-in check
    document.querySelectorAll('.fade-in').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('visible');
    });

    // Restore session
    restoreSession();

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') nextTrack();
      if (e.code === 'ArrowLeft') prevTrack();
    });

  }, 2800);
});

// Close modal on backdrop click
document.getElementById('authModal').addEventListener('click', e => {
  if (e.target === document.getElementById('authModal')) closeAuth();
});