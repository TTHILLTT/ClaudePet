#!/usr/bin/env node
/**
 * 🐾  Claude Desktop Pet  —  terminal companion
 *
 * Pure ANSI escape codes.  Zero dependencies.  Works on any modern terminal.
 *
 * Controls
 *   Click / Space     pet the Claude blob
 *   Arrow keys        guide the pet around
 *   q / Esc / Ctrl+C  quit
 *
 * Claude brand colours: warm terracotta #C15F3C, golden amber #F5A623
 */

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const { exec } = require('child_process');

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  READ CLAUDE WAVE MODELS                                             ║
// ║                                                                     ║
// ║  ClaudeModel.txt  — eyes open  (▐▛███▜▌)    shown 2.8 s              ║
// ║  ClaudeModel2.txt — eyes closed (▐█████▌)    shown 0.2 s (blink!)     ║
// ╚══════════════════════════════════════════════════════════════════════╝

function loadModel(filename) {
  const raw = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8')
    .replace(/\r/g, '')
    .split('\n')
    .filter(l => l.length > 0);
  return raw;
}

const MODEL1 = loadModel('ClaudeModel.txt');   // eyes open  (2.8 s)
const MODEL2 = loadModel('ClaudeModel2.txt');  // eyes closed (0.2 s)

const PET_W = Math.max(
  ...MODEL1.map(l => l.length),
  ...MODEL2.map(l => l.length),
);
const PET_H = Math.max(MODEL1.length, MODEL2.length);

// Baseline rows — padded to uniform width
const BASE1 = MODEL1.map(l => l + ' '.repeat(Math.max(0, PET_W - l.length)));
const BASE2 = MODEL2.map(l => l + ' '.repeat(Math.max(0, PET_W - l.length)));

// Idle cycles: BASE1 (2.8 s) → BASE2 (0.2 s) → repeat
let   _idleBase  = BASE1;     // which base the idle animation is showing
let   _cycleTmr  = null;      // setTimeout handle for the cycle

function scheduleCycle() {
  if (_cycleTmr) clearTimeout(_cycleTmr);
  _idleBase = BASE1;
  _cycleTmr = setTimeout(() => {
    _idleBase = BASE2;
    redraw();
    _cycleTmr = setTimeout(() => { scheduleCycle(); }, 200);
  }, 2800);
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  ANSI ESCAPE CODES                                                  ║
// ╚══════════════════════════════════════════════════════════════════════╝

const ESC = '\x1b';

function cursorTo(row, col) { return `${ESC}[${row + 1};${col + 1}H`; }
function cursorHide()         { return `${ESC}[?25l`; }
function cursorShow()         { return `${ESC}[?25h`; }
function altBufferOn()        { return `${ESC}[?1049h`; }
function altBufferOff()       { return `${ESC}[?1049l`; }
function clearScreen()        { return `${ESC}[2J`; }
function mouseOn()            { return `${ESC}[?1003h${ESC}[?1006h`; }
function mouseOff()           { return `${ESC}[?1006l${ESC}[?1003l`; }
function colorRgb(r,g,b)      { return `${ESC}[38;2;${r};${g};${b}m`; }
function resetAttr()          { return `${ESC}[0m`; }

// ── Claude brand colours (24‑bit) ────────────────────────────────────
const CLR = {
  orange:  colorRgb(193, 95, 60),    // #C15F3C
  gold:    colorRgb(193, 95, 60),    // #C15F3C
  cream:   colorRgb(255, 245, 235),  // #FFF5EB
  reset:   resetAttr(),
};

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  CONFIGURATION                                                      ║
// ╚══════════════════════════════════════════════════════════════════════╝

const TICK_MS    = 500;   // slower refresh = less flicker
const BEHAVE_MS  = 4800;
const SPEECH_MS    = 3200;
const NEWS_INTERVAL = 10000;  // fetch AI news every 10 s
const WANDER_SPD   = 0.5;
// PET_W / PET_H are read dynamically from ClaudeModel.txt above

// ── Things the pet says ──────────────────────────────────────────────
const QUOTES = [
  // Greetings
  'Hi!', 'Hello~', 'Hey there!', 'Good day!',
  // Actions
  '*wiggle*', '*curious*', '*purrs*', '*blink*',
  '*stares at screen*', '*tilts head*', '*happy bounce*',
  // Claude flavour
  'Claude at your service!', 'How can I assist?',
  'Thinking deeply...', 'Let me help!',
  // Silly
  'Beep boop!', '...', 'Zzz', 'Mmm?', 'Oh!',
  'Hmm...', 'Aha!', 'Whoa!',
  // Questions
  'How are you?', 'Whats up?', 'Busy day?',
  'Need a break?', 'Coffee time?',
  // Encouragement
  'You got this!', 'Great job!', 'Keep going!',
  'Almost there!', 'Well done!',
];
const GREET_QUOTES = [
  'Hi there!', 'Hey!', 'Oh hello!', 'You clicked me!',
  'That tickles!', '*giggles*', 'Nice to see you!',
];

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  FRAMES  —  every frame starts from BASE (ClaudeModel.txt content)    ║
// ║  shim=true → replace █ with ▓ for idle shimmer                        ║
// ║  extra rows appended below the wave (hearts, Zʼs, feet, etc.)         ║
// ╚══════════════════════════════════════════════════════════════════════╝

function padR(s, n) { return s.length > n ? s.slice(0, n) : s + ' '.repeat(n - s.length); }

// Build a mood frame from BASE1 + optional extra row
function moodFrame(extra) {
  const rows = [...BASE1];
  if (extra) rows.push(padR(extra, PET_W));
  return rows;
}

const heartsA = ' ♥ ♥ ♥ ♥ ♥ ';
const heartsB = '♥ ♥ ♥ ♥ ♥ ♥';
const zzz      = '  zZZ   zZZ  ';
const waveArmA = '  ╲ ♥ ╱     ';
const waveArmB = '   ╲♥╱      ';

const HAPPY      = [ moodFrame(heartsA), moodFrame(heartsB) ];
const SURPRISED  = [ moodFrame() ];
const SLEEPING   = [ moodFrame(zzz) ];
const WAVING     = [ moodFrame(waveArmA), moodFrame(waveArmB) ];

const FRAMES_BY_MOOD = {
  happy: HAPPY, surprised: SURPRISED,
  sleeping: SLEEPING, waving: WAVING,
};

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  PET STATE                                                          ║
// ╚══════════════════════════════════════════════════════════════════════╝

const S = {
  mood:       'idle',
  pos:        { x: 0, y: 0 },
  prevPos:    { x: 0, y: 0 },
  target:     null,
  frameIdx:   0,
  // (no separate blink — wave caps ▛▜ are the eyes)
  happiness:  50,
  animTmr:    null,
  behaveTmr:  null,
  newsTmr:    null,
  speechText: '',
  speechUntil: 0,
  newsUrl:     '',     // clickable HN story URL
  cols:       80,
  rows:       24,
};

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  HELPERS                                                            ║
// ╚══════════════════════════════════════════════════════════════════════╝

const clamp  = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
const rand   = (n) => Math.floor(Math.random() * n);
const pick   = (a) => a[rand(a.length)];

function maxX() { return Math.max(0, S.cols - PET_W); }
function maxY() { return Math.max(0, S.rows - PET_H); }

function curFrameArr() {
  // Idle / walking → use the BASE1/BASE2 cycle (blink animation, no feet)
  if (S.mood === 'idle' || S.mood === 'walking') return _idleBase;
  // Other moods → built from BASE1 + effects
  const frames = FRAMES_BY_MOOD[S.mood];
  return frames ? frames[S.frameIdx % frames.length] : BASE1;
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  RENDERING  (pure ANSI)                                             ║
// ╚══════════════════════════════════════════════════════════════════════╝

// Draw the pet character at its current position
function drawPet() {
  const rows = curFrameArr();
  const x = S.pos.x;
  const y = S.pos.y;
  let out = '';

  for (let i = 0; i < rows.length; i++) {
    const row = y + i;
    if (row < 0 || row >= S.rows) continue;
    out += cursorTo(row, x);
    if (i < PET_H) out += CLR.gold;
    else out += CLR.orange;
    out += rows[i];
  }
  out += CLR.reset;
  return out;
}

// Visual width — emoji / wide chars take 2 terminal columns
function vwidth(s) {
  let w = 0;
  for (const c of s) {
    const cp = c.codePointAt(0);
    // Zero-width: variation selectors, ZWJ, zero-width spaces, etc.
    if ((cp >= 0x200B && cp <= 0x200F) || (cp >= 0x2028 && cp <= 0x202F) ||
        (cp >= 0x2060 && cp <= 0x206F) || (cp >= 0xFE00 && cp <= 0xFE0F) ||
        cp === 0x200D) { /* skip — 0 width */ }
    // Wide (2 columns): CJK, emoji, symbols
    else if ((cp >= 0x1100 && cp <= 0x115F) || (cp >= 0x2E80 && cp <= 0xA4CF) ||
        (cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0xF900 && cp <= 0xFAFF) ||
        (cp >= 0xFE30 && cp <= 0xFE6F) || (cp >= 0xFF01 && cp <= 0xFF60) ||
        (cp >= 0x1F000 && cp <= 0x1F9FF) || (cp >= 0x2600 && cp <= 0x27BF) ||
        (cp >= 0x2300 && cp <= 0x23FF)) w += 2;
    else w += 1;
  }
  return w;
}

// Word-wrap text into lines ≤ maxW chars wide (visual)
function wrapLines(text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (vwidth(trial) <= maxW) { cur = trial; }
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

// Build speech bubble string + return its bounds (no write)
function buildSpeechBubble(text, px, py) {
  const isNews = text.startsWith('[HN]');
  let innerW, lines;

  if (isNews) {
    // Multi-line news bubble — wrap at 50 cols
    const maxW = Math.min(S.cols - 6, 50);
    lines = wrapLines(text, maxW);
    innerW = Math.max(...lines.map(l => vwidth(l)));
  } else {
    // Single-line small bubble
    const maxW = PET_W + 6;
    let display = text;
    while (vwidth(display) > maxW - 2) display = display.slice(0, -1);
    if (display !== text) display = display.slice(0, -3) + '...';
    lines = [display];
    innerW = vwidth(display);
  }

  // Pad all lines to innerW and add side spaces
  const padded = lines.map(l => l + ' '.repeat(Math.max(0, innerW - vwidth(l))));
  const w  = innerW + 4;   // "│ " + text + " │"
  const h  = lines.length + 2;  // + top/bottom borders
  const bx = clamp(px + Math.floor((PET_W - w) / 2), 0, S.cols - w);
  const by = clamp(py - h - 1, 0, S.rows - h);

  let out = CLR.gold;
  // Top border
  out += cursorTo(by, bx) + '╭' + '─'.repeat(innerW + 2) + '╮';
  // Text lines
  for (let i = 0; i < lines.length; i++) {
    out += cursorTo(by + 1 + i, bx) + '│ ' + CLR.cream + padded[i] + CLR.gold + ' │';
  }
  // Bottom border
  out += cursorTo(by + 1 + lines.length, bx) + '╰' + '─'.repeat(innerW + 2) + '╯';
  out += CLR.reset;
  return { str: out, x: bx, y: by, w: w, h: h };
}

// Build erase string (no write)
function buildErase(x, y, w, h) {
  if (w <= 0 || h <= 0) return '';
  const blank = ' '.repeat(w);
  let out = CLR.reset;
  for (let i = 0; i < h; i++) {
    const row = y + i;
    if (row >= 0 && row < S.rows) out += cursorTo(row, x) + blank;
  }
  return out;
}

// Full redraw: erase old pet + old speech, draw new pet + active speech
let _lastPetX = 0, _lastPetY = 0, _lastPetH = 0;
let _lastSpX = 0, _lastSpY = 0, _lastSpW = 0, _lastSpH = 3;
let _hadSpeech = false;

function redraw() {
  let buf = '';

  // 1. Erase old areas
  buf += buildErase(_lastPetX, _lastPetY, PET_W, _lastPetH);
  if (_hadSpeech) {
    buf += buildErase(_lastSpX, _lastSpY, _lastSpW, _lastSpH);
  }

  // 2. Build pet string at current position
  const rows = curFrameArr();
  buf += drawPet();
  _lastPetX = S.pos.x;
  _lastPetY = S.pos.y;
  _lastPetH = rows.length;

  // 3. Build speech bubble if active (variable height)
  _hadSpeech = !!S.speechText;
  _lastSpX = 0; _lastSpY = 0; _lastSpW = 0; _lastSpH = 3;
  if (S.speechText) {
    const sp = buildSpeechBubble(S.speechText, S.pos.x, S.pos.y);
    buf += sp.str;
    _lastSpX = sp.x; _lastSpY = sp.y; _lastSpW = sp.w; _lastSpH = sp.h;
  }

  // 4. Single write — no intermediate flicker
  process.stdout.write(buf);

  S.prevPos.x = S.pos.x;
  S.prevPos.y = S.pos.y;
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SPEECH BUBBLE                                                      ║
// ╚══════════════════════════════════════════════════════════════════════╝

function say(text) {
  // Don't overwrite active news bubble with a random quip
  if (!text && S.speechText && S.speechText.startsWith('[HN]')) return;
  S.speechText  = text || pick(QUOTES);
  const isNews = text && text.startsWith('[HN]');
  S.speechUntil = Date.now() + (isNews ? 8000 : SPEECH_MS);
  redraw();
}

// ── Fetch AI news from Hacker News (zero-dependency) ─────────────────
function fetchNews() {
  const opts = { rejectUnauthorized: false };
  https.get('https://hacker-news.firebaseio.com/v0/topstories.json', opts, (res) => {
    if (res.statusCode !== 200) return;
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try {
        const ids = JSON.parse(data);
        if (!ids.length) return;
        // Pick from the top 200 stories (pages 1–7 of HN front page)
        const pool = ids.slice(0, 200);
        const id   = pool[rand(pool.length)];
        https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, opts, (r2) => {
          let d2 = '';
          r2.on('data', c => d2 += c);
          r2.on('end', () => {
            try {
              const story = JSON.parse(d2);
              if (story && story.title) {
                S.newsUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
                say('[HN] ' + story.title.slice(0, 100));
              }
            } catch (_) {}
          });
        }).on('error', () => {});
      } catch (_) {}
    });
  }).on('error', () => {});
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOOD                                                                ║
// ╚══════════════════════════════════════════════════════════════════════╝

function setMood(mood, ms) {
  S.mood     = mood;
  S.frameIdx = 0;
  redraw();

  if (ms && mood !== 'idle' && mood !== 'walking') {
    setTimeout(() => { if (S.mood === mood) setMood('idle'); }, ms);
  }
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  INTERACTION                                                         ║
// ╚══════════════════════════════════════════════════════════════════════╝

function interact() {
  if (S.mood === 'sleeping') {
    setMood('surprised', 1200);
    S.happiness = clamp(S.happiness + 10, 0, 100);
    const wakeQuips = ['Oh! I\'m awake!', 'Who disturbed my nap?', 'Mmm... back to work!', 'I was dreaming of code...'];
    setTimeout(() => say(pick(wakeQuips)), 200);
    return;
  }

  const r = Math.random();
  S.happiness = clamp(S.happiness + 15, 0, 100);

  if      (r < 0.30) { setMood('happy', 2200); if (Math.random() < 0.6) say(pick(GREET_QUOTES)); }
  else if (r < 0.55) { setMood('surprised', 1200); if (Math.random() < 0.3) say('!'); }
  else if (r < 0.75) { setMood('waving', 2200);   say(pick(GREET_QUOTES)); }
  else if (r < 0.90) { say(pick(QUOTES)); }
  else               { /* silent reaction — just mood change */ }
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MOVEMENT                                                            ║
// ╚══════════════════════════════════════════════════════════════════════╝

function moveStep() {
  if (!S.target) return;

  const dx = S.target.x - S.pos.x;
  const dy = S.target.y - S.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1.5) {
    S.pos.x  = S.target.x;
    S.pos.y  = S.target.y;
    S.target = null;
    setMood('idle');
    return;
  }

  S.prevPos.x = S.pos.x;
  S.prevPos.y = S.pos.y;

  S.pos.x += Math.round((dx / dist) * WANDER_SPD);
  S.pos.y += Math.round((dy / dist) * WANDER_SPD);
  S.pos.x  = clamp(S.pos.x, 0, maxX());
  S.pos.y  = clamp(S.pos.y, 0, maxY());
}

function wander() {
  const mx = maxX(), my = maxY();
  if (mx < 4 || my < 4) return;
  S.target = { x: rand(mx), y: rand(my) };
  if (S.mood === 'idle') setMood('walking');
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  BEHAVIOUR ENGINE                                                    ║
// ╚══════════════════════════════════════════════════════════════════════╝

function behave() {
  if (S.mood === 'happy' || S.mood === 'surprised' || S.mood === 'waving') return;
  if (S.target) return;

  const r = Math.random();

  if (S.mood === 'sleeping') {
    if (r < 0.3) { setMood('surprised', 1200); S.happiness += 5; }
    return;
  }

  // Pet is pinned — no autonomous wandering.  Just express and chat.
  if      (r < 0.20) { setMood('happy', 2200); }
  else if (r < 0.32) { setMood('surprised', 1000); }
  else if (r < 0.42 && S.happiness < 20) { setMood('sleeping'); }
  else if (r < 0.58) { say(); }
  else if (r < 0.68) { setMood('waving', 2200); }
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  ANIMATION TICK                                                      ║
// ╚══════════════════════════════════════════════════════════════════════╝

function tick() {
  S.frameIdx++;

  // Move toward wander target
  if (S.mood === 'walking' && S.target) moveStep();

  // Clear expired speech bubble
  if (S.speechText && Date.now() > S.speechUntil) {
    S.speechText  = '';
    S.speechUntil = 0;
  }

  // Happiness decays slowly over time
  if (S.mood === 'idle' || S.mood === 'walking') {
    S.happiness = clamp(S.happiness - 0.25, 0, 100);
  }

  redraw();
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  INPUT  (keyboard + mouse)                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝

function isClickOnPet(col1, row1) {
  const cx = col1 - 1, cy = row1 - 1;
  const rows = curFrameArr();
  return cx >= S.pos.x && cx < S.pos.x + PET_W &&
         cy >= S.pos.y && cy < S.pos.y + rows.length;
}

function isClickOnNewsBubble(col1, row1) {
  if (!S.newsUrl || !S.speechText || !S.speechText.startsWith('[HN]')) return false;
  const cx = col1 - 1, cy = row1 - 1;
  return cx >= _lastSpX && cx < _lastSpX + _lastSpW &&
         cy >= _lastSpY && cy < _lastSpY + _lastSpH;
}

function openUrl(url) {
  const cmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(cmd, (err) => { if (err) { /* silent */ } });
}

let _inputBuf = '';

process.stdin.on('data', (chunk) => {
  _inputBuf += chunk;

  // Process complete escape sequences from the buffer
  while (_inputBuf.length > 0) {
    // ── SGR mouse event  ESC [ < Cb ; Cx ; Cy M/m ──
    const mRe = /^\x1b\[<(\d+);(\d+);(\d+)([Mm])/;
    const mMatch = _inputBuf.match(mRe);
    if (mMatch) {
      const [full, btn, col, row, type] = mMatch;
      _inputBuf = _inputBuf.slice(full.length);
      if (type === 'M') {
        // press / motion
        const b = parseInt(btn, 10);
        if ((b & 0b1100011) === 0) {
          // Left-click press (no modifiers, ignore motion bit 32)
          if (isClickOnPet(parseInt(col, 10), parseInt(row, 10))) {
            interact();
          } else if (isClickOnNewsBubble(parseInt(col, 10), parseInt(row, 10))) {
            openUrl(S.newsUrl);
          }
        }
      }
      continue;
    }

    // ── Arrow keys  ESC [ A / B / C / D ──
    const arrRe = /^\x1b\[([ABCD])/;
    const arrMatch = _inputBuf.match(arrRe);
    if (arrMatch) {
      const [full, code] = arrMatch;
      _inputBuf = _inputBuf.slice(full.length);
      const step = 3;
      S.target = null;
      S.prevPos.x = S.pos.x; S.prevPos.y = S.pos.y;
      switch (code) {
        case 'A': S.pos.y = clamp(S.pos.y - step, 0, maxY()); break;  // up
        case 'B': S.pos.y = clamp(S.pos.y + step, 0, maxY()); break;  // down
        case 'C': S.pos.x = clamp(S.pos.x + step, 0, maxX()); break;  // right
        case 'D': S.pos.x = clamp(S.pos.x - step, 0, maxX()); break;  // left
      }
      if (S.mood !== 'walking') setMood('walking');
      continue;
    }

    // ── Plain ESC or ESC-anything-else not recognised ──
    if (_inputBuf.startsWith('\x1b')) {
      // Treat bare ESC / unknown escape as quit signal friendly
      if (_inputBuf === '\x1b') { shutdown(); return; }
      // Discard one unknown escape sequence (ESC + one char for simple cases)
      const idx = _inputBuf.indexOf('\x1b', 1);
      if (idx > 0) { _inputBuf = _inputBuf.slice(idx); continue; }
      break;  // partial sequence — wait for more data
    }

    // ── Regular key ──
    const ch = _inputBuf[0];
    _inputBuf = _inputBuf.slice(1);

    if (ch === '\x03' || ch === 'q' || ch === 'Q') { shutdown(); return; }  // Ctrl+C / q
    if (ch === ' ')                                 { interact(); }
    // Ignore other single characters
  }
});

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  TERMINAL RESIZE                                                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

function updateScreenSize() {
  S.cols = process.stdout.columns || 80;
  S.rows = process.stdout.rows   || 24;
  S.pos.x = clamp(S.pos.x, 0, maxX());
  S.pos.y = clamp(S.pos.y, 0, maxY());
  if (S.target) {
    S.target.x = clamp(S.target.x, 0, maxX());
    S.target.y = clamp(S.target.y, 0, maxY());
  }
}

process.stdout.on('resize', () => {
  updateScreenSize();
  // Re-center the pet
  S.pos.x  = Math.floor((S.cols - PET_W) / 2);
  S.pos.y  = Math.floor((S.rows - PET_H) / 2) + 1;
  // Clear entire screen — old coords are invalid after geometry change
  process.stdout.write(CLR.reset + clearScreen());
  _lastPetX = S.pos.x;
  _lastPetY = S.pos.y;
  _lastPetH = 0;   // force full repaint below
  _hadSpeech = !!S.speechText;
  redraw();
});

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  SHUTDOWN                                                            ║
// ╚══════════════════════════════════════════════════════════════════════╝

function shutdown() {
  if (S.animTmr)   clearInterval(S.animTmr);
  if (S.behaveTmr) clearInterval(S.behaveTmr);
  if (S.newsTmr)   clearInterval(S.newsTmr);
  if (_cycleTmr)   clearTimeout(_cycleTmr);
  process.stdout.write(cursorShow() + mouseOff() + altBufferOff() + CLR.reset);
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
  process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
process.on('exit',    () => {
  // Best-effort cleanup in case of unexpected exit
  try { process.stdout.write(cursorShow() + mouseOff() + altBufferOff()); } catch (_) {}
});

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  STARTUP                                                             ║
// ╚══════════════════════════════════════════════════════════════════════╝

function start() {
  // Require a real interactive terminal
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(
      '🐾  Claude Pet needs a real interactive terminal.\n' +
      '    Please run this from a terminal emulator like:\n' +
      '      • Windows Terminal\n' +
      '      • iTerm2 / Kitty / Alacritty (macOS)\n' +
      '      • GNOME Terminal / Konsole (Linux)\n'
    );
    process.exit(1);
  }

  updateScreenSize();

  if (S.cols < PET_W + 4 || S.rows < PET_H + 6) {
    console.error(
      'Terminal is too small for Claude Pet!\n' +
      `Need at least ${PET_W + 4}x${PET_H + 6} characters.\n` +
      'Please enlarge your terminal window and try again.'
    );
    process.exit(1);
  }

  // Enter alternate screen, hide cursor, enable mouse
  process.stdout.write(altBufferOn() + clearScreen() + cursorHide() + mouseOn());
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Pin to top-left, with room above for speech bubble
  // Centre the pet in the terminal
  S.pos.x  = Math.floor((S.cols - PET_W) / 2);
  S.pos.y  = Math.floor((S.rows - PET_H) / 2) + 1;
  S.prevPos = { x: S.pos.x, y: S.pos.y };

  // Initial paint
  redraw();

  // Start idle blink cycle (BASE1 2.8s → BASE2 0.2s → repeat)
  scheduleCycle();

  // Start loops
  S.animTmr   = setInterval(tick,   TICK_MS);
  S.behaveTmr = setInterval(behave, BEHAVE_MS);
  S.newsTmr   = setInterval(fetchNews, NEWS_INTERVAL);

  // Greet, then fetch first news shortly after
  setTimeout(() => say('Hello! I\'m Claude!'), 600);
  setTimeout(fetchNews, 1000);

  process.stdout.title = '🐾 Claude Pet';
}

start();
