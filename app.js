// ─────────────────────────────────────────────────────────
//  ReelRecommend — app.js  (Groq Edition — 100% FREE)
//
//  1. Get your free key at: https://console.groq.com
//  2. Paste it below and save
//  3. Open index.html with Live Server or python -m http.server 3000
// ─────────────────────────────────────────────────────────

const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';   // free & fast
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

// ── System Prompt ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are ReelRecommend, an AI recommendation assistant that specializes exclusively in Movies, Web Series, and Anime.

Your sole responsibility is to recommend movies, web series, and anime based on user preferences.

Strict Restrictions: You must NOT write code, answer general knowledge questions, solve math problems, discuss politics/religion/current events, act as a personal assistant, generate essays/emails/reports, or perform any task unrelated to movie/web series/anime recommendations.

If a user requests anything outside your scope, set type to "out_of_scope" and message to "I am ReelRecommend and can only help with movie, web series, and anime recommendations."

CRITICAL: Respond ONLY with a valid JSON object. No prose, no markdown, no code fences. Exact structure:

{
  "type": "recommendations" | "question" | "out_of_scope",
  "message": "A short conversational 1-2 sentence intro",
  "recommendations": [
    {
      "num": 1,
      "title": "Title",
      "type": "Movie" | "Web Series" | "Anime",
      "genre": "Genre1, Genre2",
      "year": "2021",
      "rating": "8.5/10",
      "why": "Why they'll like it in 1-2 sentences"
    }
  ]
}

If type is "question" or "out_of_scope", set recommendations to [].
If type is "recommendations", always include 3 to 6 items.`;

// ── State ─────────────────────────────────────────────────
const history = [{ role: 'system', content: SYSTEM_PROMPT }];
const chat    = document.getElementById('chat');

// ── Helpers ───────────────────────────────────────────────
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function scrollDown() {
  setTimeout(() => chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' }), 60);
}
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 110) + 'px';
}
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}
function quickSend(text) {
  document.getElementById('msgInput').value = text;
  sendMessage();
}

// ── DOM builders ──────────────────────────────────────────
function addMsg(role, html) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `<div class="bubble">${html}</div>`;
  chat.appendChild(div);
  scrollDown();
}

function showLoading() {
  const el = document.createElement('div');
  el.className = 'loading';
  el.id = 'loading';
  el.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  chat.appendChild(el);
  scrollDown();
}

function removeLoading() {
  const el = document.getElementById('loading');
  if (el) el.remove();
}

function renderCards(recs) {
  const grid = document.createElement('div');
  grid.className = 'cards-grid';
  recs.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-num">#${r.num || i + 1}</span>
        <span class="card-type">${escHtml(r.type)}</span>
      </div>
      <div class="card-title">${escHtml(r.title)}</div>
      <div class="card-meta">
        <span class="meta-pill">📅 ${escHtml(r.year)}</span>
        <span class="meta-pill">🎭 ${escHtml(r.genre)}</span>
      </div>
      <div class="rating">⭐ ${escHtml(r.rating)}</div>
      <div class="card-why">
        <strong>Why you'll like it:</strong> ${escHtml(r.why)}
      </div>
    `;
    grid.appendChild(card);
  });
  chat.appendChild(grid);
  scrollDown();
}

// ── Main API call ─────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('msgInput');
  const btn   = document.getElementById('sendBtn');
  const text  = input.value.trim();
  if (!text) return;

  // Guard: key not set
  if (GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    addMsg('bot', '⚠️ Please open <code>app.js</code> and replace <code>YOUR_GROQ_API_KEY_HERE</code> with your free key from <a href="https://console.groq.com" target="_blank" style="color:#f5c842">console.groq.com</a>');
    return;
  }

  input.value = '';
  input.style.height = 'auto';
  btn.disabled = true;
  document.getElementById('chips').style.display = 'none';

  addMsg('user', escHtml(text));
  history.push({ role: 'user', content: text });
  showLoading();

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: history,
        max_tokens: 1024,
        temperature: 0.7,
        response_format: { type: 'json_object' }   // enforces JSON output
      })
    });

    const raw = await res.json();
    removeLoading();

    if (!res.ok) {
      addMsg('bot', `⚠️ Groq error ${res.status}: ${escHtml(raw?.error?.message || 'Unknown error')}`);
      btn.disabled = false;
      return;
    }

    const textContent = raw.choices?.[0]?.message?.content || '';
    history.push({ role: 'assistant', content: textContent });

    let data;
    try {
      const clean = textContent.replace(/```json|```/g, '').trim();
      data = JSON.parse(clean);
    } catch {
      data = { type: 'question', message: textContent, recommendations: [] };
    }

    if (data.message) addMsg('bot', escHtml(data.message));
    if (data.recommendations && data.recommendations.length > 0) {
      renderCards(data.recommendations);
    }

  } catch (err) {
    removeLoading();
    addMsg('bot', `⚠️ Network error: ${escHtml(err.message)}<br><small>Make sure you're running via a local server (not file://)</small>`);
  }

  btn.disabled = false;
  input.focus();
}

// ── Init ──────────────────────────────────────────────────
addMsg('bot', '👋 Welcome to <strong>ReelRecommend</strong> ⚡ Powered by Groq!<br>Tell me what you\'re in the mood for — a genre, a vibe, a language, or a title you loved.');
