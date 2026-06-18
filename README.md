# 🎬 ReelRecommend — Groq Edition (FREE)

An AI-powered movie, web series & anime recommendation chatbot.  
Uses **Groq's free API** with LLaMA 3.3 70B — no credit card needed!

---

## 📁 Files

```
ReelRecommend-Groq/
├── index.html   ← App layout
├── style.css    ← Dark cinema theme
├── app.js       ← Groq API logic
└── README.md    ← This file
```

---

## 🚀 Setup (3 steps)

### Step 1 — Get Free Groq API Key
1. Go to 👉 **[console.groq.com](https://console.groq.com)**
2. Sign up (free, no credit card)
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

### Step 2 — Add Your Key
Open `app.js` and replace line 8:
```js
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
```
With your key:
```js
const GROQ_API_KEY = 'gsk_xxxxxxxxxxxxxxxxxxxx';
```

### Step 3 — Run Locally
Use any of these:

**VS Code (easiest):**
- Install "Live Server" extension
- Right-click `index.html` → Open with Live Server

**Python:**
```bash
python -m http.server 3000
```
Then open: http://localhost:3000

**Node.js:**
```bash
npx serve .
```
Then open: http://localhost:3000

> ⚠️ Must use a local server — opening index.html directly (file://) will cause CORS errors.

---

## ✨ Features
- ⚡ Ultra-fast responses via Groq LPU
- 🤖 LLaMA 3.3 70B model (free tier)
- 🎬 Movies, Web Series & Anime recommendations
- 💬 Multi-turn conversation memory
- 🃏 Beautiful recommendation cards
- 📱 Mobile responsive

---

## 🔒 Free Tier Limits (Groq)
- ~14,400 requests/day on free tier
- More than enough for personal use!
