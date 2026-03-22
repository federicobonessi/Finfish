# FinFish 🐟
**Multi-Agent Financial Simulation Engine**

Simulate financial market scenarios through the eyes of 5 AI agents with distinct investment philosophies.

## Agents
- 🌐 **Macro Strategist** — Top-down: rates, inflation, geopolitics
- 📊 **Value Investor** — Graham & Dodd, intrinsic value, margin of safety
- 🤖 **Quant Analyst** — Factor models, statistical signals, volatility regimes
- 🏛️ **Private Banking PM** — UHNW wealth preservation, decades-long horizon
- 🐻 **Contrarian Bear** — Short thesis, accounting red flags, crowded trades

After all agents respond, generate a **CIO Synthesis** that reconciles all views into a final verdict and trade idea.

---

## Deploy to Vercel (5 minutes)

### 1. Prerequisites
- [Node.js](https://nodejs.org) v18+
- [Git](https://git-scm.com)
- A free [Vercel account](https://vercel.com)
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install dependencies locally
```bash
npm install
```

### 3. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/finfish.git
git push -u origin main
```

### 4. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Leave all build settings as default (Vercel auto-detects Vite)
4. Before clicking **Deploy**, go to **Environment Variables** and add:
   ```
   Name:  ANTHROPIC_API_KEY
   Value: sk-ant-xxxxxxxxxxxxxxxxxx
   ```
5. Click **Deploy** → your app is live at `finfish.vercel.app`

### 5. (Optional) Custom domain
In Vercel → Project Settings → Domains, add `finfish.themeridianplaybook.com` and follow the DNS instructions.

---

## Local Development
```bash
npm run dev
```
The app runs at `http://localhost:5173`.

For local API calls to work, create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
```

---

## Project Structure
```
finfish/
├── api/
│   └── simulate.js      ← Serverless function (API key lives here, secure)
├── src/
│   ├── App.jsx          ← Main React app
│   └── main.jsx         ← Entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json          ← Routing config
```

## Security
The Anthropic API key **never** reaches the browser. All AI calls go through `/api/simulate`, a serverless function that runs server-side on Vercel. The key is stored as a Vercel Environment Variable, invisible to users.
