```javascript
// ================================
// ReelRecommend - app.js
// Developed by SHIVA PATEL
// ================================

const GROQ_API_KEY = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ================================
// SYSTEM PROMPT
// ================================

const SYSTEM_PROMPT = `
You are ReelRecommend.

You ONLY recommend:
- Movies
- Anime
- Web Series

If user asks anything outside entertainment recommendations,
respond with:

{
 "type":"out_of_scope",
 "message":"🎬 I can only help with movie, anime, and web series recommendations.",
 "recommendations":[]
}

Always return valid JSON.

Format:

{
 "type":"recommendations",
 "message":"short intro",
 "recommendations":[
   {
     "num":1,
     "title":"Title",
     "type":"Movie",
     "genre":"Genre",
     "year":"2024",
     "rating":"8.5/10",
     "why":"reason"
   }
 ]
}

Return 3-6 recommendations.
`;

// ================================
// STATE
// ================================

const history = [
  {
    role: "system",
    content: SYSTEM_PROMPT
  }
];

let chatHistory =
  JSON.parse(
    localStorage.getItem("reelrecommend_history")
  ) || [];

const chat =
  document.getElementById("chat");

// ================================
// SIDEBAR
// ================================

function toggleSidebar() {
  document
    .getElementById("sidebar")
    .classList
    .toggle("open");
}

document
  .getElementById("menuBtn")
  .addEventListener("click", toggleSidebar);

// ================================
// HELPERS
// ================================

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function scrollBottom() {
  setTimeout(() => {
    chat.scrollTop = chat.scrollHeight;
  }, 100);
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height =
    Math.min(el.scrollHeight, 120) + "px";
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function quickSend(text) {
  document.getElementById("msgInput").value = text;
  sendMessage();
}

// ================================
// CHAT UI
// ================================

function addMsg(role, content) {

  const div =
    document.createElement("div");

  div.className = `msg ${role}`;

  div.innerHTML = `
    <div class="bubble">
      ${content}
    </div>
  `;

  chat.appendChild(div);

  scrollBottom();
}

function showLoading() {

  const div =
    document.createElement("div");

  div.id = "loading";

  div.className = "msg bot";

  div.innerHTML = `
  <div class="bubble">
     🎬 Finding recommendations...
  </div>
  `;

  chat.appendChild(div);

  scrollBottom();
}

function removeLoading() {

  const loading =
    document.getElementById("loading");

  if (loading) loading.remove();
}

// ================================
// HISTORY
// ================================

function saveHistory() {

  localStorage.setItem(
    "reelrecommend_history",
    JSON.stringify(chatHistory)
  );
}

function renderHistory() {

  const historyList =
    document.getElementById("historyList");

  if (!historyList) return;

  historyList.innerHTML = "";

  chatHistory
    .slice()
    .reverse()
    .slice(0, 20)
    .forEach(item => {

      const div =
        document.createElement("div");

      div.style.padding = "8px";
      div.style.borderBottom =
        "1px solid #222";

      div.innerHTML = `
        <strong>${item.role}</strong><br>
        ${escHtml(item.text.slice(0, 60))}
      `;

      historyList.appendChild(div);
    });
}

// ================================
// RECOMMENDATION CARDS
// ================================

function renderCards(recs) {

  const grid =
    document.createElement("div");

  grid.className = "examples";

  recs.forEach(rec => {

    const card =
      document.createElement("div");

    card.className = "example-card";

    card.innerHTML = `
      <h3>${escHtml(rec.title)}</h3>

      <p><strong>Type:</strong>
      ${escHtml(rec.type)}</p>

      <p><strong>Genre:</strong>
      ${escHtml(rec.genre)}</p>

      <p><strong>Year:</strong>
      ${escHtml(rec.year)}</p>

      <p><strong>Rating:</strong>
      ⭐ ${escHtml(rec.rating)}</p>

      <p>${escHtml(rec.why)}</p>
    `;

    grid.appendChild(card);
  });

  chat.appendChild(grid);

  scrollBottom();
}

// ================================
// SEND MESSAGE
// ================================

async function sendMessage() {

  const input =
    document.getElementById("msgInput");

  const text =
    input.value.trim();

  if (!text) return;

  if (
    GROQ_API_KEY ===
    "YOUR_GROQ_API_KEY_HERE"
  ) {

    addMsg(
      "bot",
      "⚠️ Please add your Groq API Key in app.js"
    );

    return;
  }

  addMsg("user", escHtml(text));

  chatHistory.push({
    role: "User",
    text
  });

  saveHistory();
  renderHistory();

  history.push({
    role: "user",
    content: text
  });

  input.value = "";
  input.style.height = "auto";

  showLoading();

  try {

    const response =
      await fetch(GROQ_URL, {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${GROQ_API_KEY}`
      },

      body: JSON.stringify({

        model: GROQ_MODEL,

        messages: history,

        temperature: 0.7,

        max_tokens: 1024,

        response_format: {
          type: "json_object"
        }

      })
    });

    const result =
      await response.json();

    removeLoading();

    if (!response.ok) {

      addMsg(
        "bot",
        "⚠️ Recommendation service is temporarily unavailable. Please try again later."
      );

      return;
    }

    const content =
      result.choices?.[0]
      ?.message?.content || "";

    let data;

    try {

      data =
        JSON.parse(content);

    } catch {

      addMsg(
        "bot",
        "⚠️ Invalid response received."
      );

      return;
    }

    addMsg(
      "bot",
      escHtml(data.message)
    );

    chatHistory.push({
      role: "Bot",
      text: data.message
    });

    saveHistory();
    renderHistory();

    if (
      data.recommendations &&
      data.recommendations.length > 0
    ) {

      renderCards(
        data.recommendations
      );
    }

  } catch (error) {

    removeLoading();

    addMsg(
      "bot",
      "😔 Sorry, I couldn't reach the recommendation engine right now. Please try again shortly."
    );

    console.error(error);
  }
}

// ================================
// INIT
// ================================

addMsg(
  "bot",
  `
  👋 Welcome to <strong>ReelRecommend</strong>!

  Tell me:
  <br><br>

  • Your favorite genre<br>
  • Your mood<br>
  • A movie/anime you loved<br><br>

  and I'll suggest something great to watch.
  `
);

renderHistory();
```
