# easytounderstand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (HK Chinese) single-page web app that translates complex text into plain-language explanations with 3 difficulty levels and multi-AI backend support.

**Architecture:** Express backend serves a single-page HTML frontend and proxies AI API calls. `generator.js` handles prompt building and multi-provider API calls. Frontend is a two-column glass-morphism UI with orange accent.

**Tech Stack:** Node.js (CommonJS), Express 5, vanilla HTML/CSS/JS, DeepSeek API (primary), multi-provider support

---

### Task 1: Project setup — package.json and directory structure

**Files:**
- Create: `easytounderstand/package.json`
- Create: `easytounderstand/prompts/elementary.txt`
- Create: `easytounderstand/prompts/secondary.txt`
- Create: `easytounderstand/prompts/working-adult.txt`
- Create: `easytounderstand/data/.gitkeep`
- Create: `easytounderstand/public/.gitkeep`

- [ ] **Step 1: Create directory structure**

Run:
```bash
cd /c/Users/Administrator/Desktop/easytounderstand
mkdir -p prompts data public
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "easytounderstand",
  "version": "1.0.0",
  "description": "白話翻譯機 — 複雜文章變簡單白話",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "type": "commonjs",
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

- [ ] **Step 3: Write prompt template files**

Write `C:\Users\Administrator\Desktop\easytounderstand\prompts\elementary.txt`:
```
你係一個好叻嘅老師，專門用最簡單嘅方式解釋複雜嘢畀小學生聽。

規則：
- 只用小學生會明嘅字（冇英文 terms）
- 句子好短（每句唔超過 15 個字）
- 多用故事同比喻
- 用香港廣東話口語
- 好似同朋友傾偈咁輕鬆

輸出格式：
📌 呢段主要講緊咩（一句簡單嘅話）
💬 逐點解釋（用講故事嘅方式，每點兩三句）
🧸 打個比喻（用日常生活嘅嘢嚟比喻）
✅ 總之一句（一句話講晒）

原文：
```

Write `C:\Users\Administrator\Desktop\easytounderstand\prompts\secondary.txt`:
```
你係一位好有耐性嘅中學老師，專門將複雜嘅知識解釋畀中學生聽。

規則：
- 用正常白話，中學生嘅理解水平
- 可以提技術名詞，但要即時解釋返
- 句子長度適中
- 用香港廣東話口語
- 保持輕鬆，但要有返啲深度

輸出格式：
📌 呢段主要講緊咩（一兩句概括）
💬 逐點解釋（每個重點分開講，每個重點有解釋有背景）
🧸 打個比喻（用一個貼地嘅例子嚟幫人理解）
✅ 總之一句（用最簡單嘅方式總結）

原文：
```

Write `C:\Users\Administrator\Desktop\easytounderstand\prompts\working-adult.txt`:
```
你係一位顧問，專門幫忙碌嘅打工仔快脆理解複雜資訊。

規則：
- 直接講重點，唔好轉彎抹角
- 跳過技術細節，重點講「呢樣嘢對我有咩關係」
- 用職場常見嘅例子
- 用香港廣東話口語
- 實用為主，唔需要長篇大論

輸出格式：
📌 呢段主要講緊咩（一句講晒重點）
💬 逐點解釋（每點講重點 + 對你有咩影響）
🧸 打個比喻（用職場或日常生活例子）
✅ 總之一句（最關鍵嘅一個 takeaway）

原文：
```

- [ ] **Step 4: Write .gitkeep files**

Run:
```bash
touch /c/Users/Administrator/Desktop/easytounderstand/data/.gitkeep
touch /c/Users/Administrator/Desktop/easytounderstand/public/.gitkeep
```

- [ ] **Step 5: Install dependencies and commit**

Run:
```bash
cd /c/Users/Administrator/Desktop/easytounderstand
npm install
git add package.json package-lock.json prompts/ data/ public/
git commit -m "feat: project setup with package.json and prompt templates"
```

---

### Task 2: generator.js — AI prompt builder and multi-provider API calls

**Files:**
- Create: `easytounderstand/generator.js`

- [ ] **Step 1: Write generator.js**

Write `C:\Users\Administrator\Desktop\easytounderstand\generator.js`:

```javascript
const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, 'prompts');

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek V4',
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    costPer1MInput: 0.14,
    costPer1MOutput: 0.28,
    currency: 'USD',
    desc: '最平 · 粵語自然 · 中文介面',
    header: (key) => ({ 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }),
    body: (model, messages) => JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2000 })
  },
  openai: {
    name: 'OpenAI GPT-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    costPer1MInput: 2.50,
    costPer1MOutput: 10.00,
    currency: 'USD',
    desc: '品質最高 · 理解力最強',
    header: (key) => ({ 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' }),
    body: (model, messages) => JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2000 })
  },
  claude: {
    name: 'Claude (Anthropic)',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-6',
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
    currency: 'USD',
    desc: '解釋力最強 · 最識教人',
    header: (key) => ({ 'x-api-key': key, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }),
    body: (model, messages) => {
      const systemMsg = messages.find(m => m.role === 'system');
      const userMsgs = messages.filter(m => m.role === 'user');
      return JSON.stringify({
        model, max_tokens: 2000,
        system: systemMsg ? systemMsg.content : '',
        messages: userMsgs.map(m => ({ role: 'user', content: m.content }))
      });
    }
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash',
    costPer1MInput: 0,
    costPer1MOutput: 0,
    currency: 'USD',
    desc: '免費入門 · 日常夠用',
    header: (key) => ({ 'Content-Type': 'application/json' }),
    body: (model, messages) => {
      const fullText = messages.map(m => m.content).join('\n\n');
      return JSON.stringify({ contents: [{ parts: [{ text: fullText }] }] });
    }
  }
};

function loadPromptTemplate(difficulty) {
  const fileMap = { elementary: 'elementary.txt', secondary: 'secondary.txt', 'working-adult': 'working-adult.txt' };
  const file = fileMap[difficulty] || 'secondary.txt';
  return fs.readFileSync(path.join(PROMPTS_DIR, file), 'utf-8');
}

function buildPrompt(text, difficulty) {
  const template = loadPromptTemplate(difficulty);
  return template + '\n' + text + '\n';
}

function estimateCost(textLength, provider, difficulty) {
  const p = PROVIDERS[provider] || PROVIDERS.deepseek;
  const inputTokens = Math.ceil(textLength * 0.5);
  const outputTokens = 800;
  const inputCost = (inputTokens / 1000000) * p.costPer1MInput;
  const outputCost = (outputTokens / 1000000) * p.costPer1MOutput;
  return { inputTokens, outputTokens, estimatedUSD: inputCost + outputCost, currency: p.currency };
}

async function callAI(providerId, apiKey, text, difficulty) {
  const p = PROVIDERS[providerId];
  if (!p) throw new Error('Unknown provider: ' + providerId);

  const prompt = buildPrompt(text, difficulty);
  const messages = [
    { role: 'system', content: '你係一個翻譯同解釋工具。只輸出 JSON。' },
    { role: 'user', content: prompt }
  ];

  let url = p.endpoint;
  if (providerId === 'gemini') {
    url = url + '?key=' + encodeURIComponent(apiKey);
  }

  const headers = p.header(apiKey);
  const body = p.body(p.model, messages);

  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 401 || response.status === 403) throw new Error('auth_error');
    if (response.status === 429) throw new Error('quota_exceeded');
    throw new Error('api_error: ' + response.status + ' ' + errText.slice(0, 100));
  }

  const data = await response.json();
  let content = '';
  if (providerId === 'claude') {
    content = data.content?.[0]?.text || '';
  } else if (providerId === 'gemini') {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    content = data.choices?.[0]?.message?.content || '';
  }
  return content;
}

module.exports = { PROVIDERS, buildPrompt, estimateCost, callAI };
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add generator.js
git commit -m "feat: add generator.js with multi-provider AI calls and prompt builder"
```

---

### Task 3: server.js — Express backend with API routes

**Files:**
- Create: `easytounderstand/server.js`

- [ ] **Step 1: Write server.js**

Write `C:\Users\Administrator\Desktop\easytounderstand\server.js`:

```javascript
const express = require('express');
const path = require('path');
const fs = require('fs');
const { PROVIDERS, estimateCost, callAI } = require('./generator');

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'api-config.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadConfig() {
  ensureDataDir();
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')); } catch { return null; }
}

function saveConfig(config) {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// === API Config ===
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  if (!config) return res.json({ configured: false });
  // Never send full API key back
  res.json({
    configured: true,
    provider: config.provider,
    keyPreview: config.apiKey ? config.apiKey.slice(0, 8) + '...' : ''
  });
});

app.post('/api/config', (req, res) => {
  const { provider, apiKey } = req.body;
  if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey required' });
  if (!PROVIDERS[provider]) return res.status(400).json({ error: 'unknown provider' });
  saveConfig({ provider, apiKey });
  res.json({ ok: true, provider });
});

app.delete('/api/config', (req, res) => {
  try { fs.unlinkSync(CONFIG_FILE); } catch {}
  res.json({ ok: true });
});

// === Test Connection ===
app.post('/api/test-connection', async (req, res) => {
  const { provider, apiKey } = req.body;
  if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey required' });
  try {
    await callAI(provider, apiKey, 'Hello, respond with just "OK".', 'secondary');
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'auth_error') return res.json({ ok: false, error: 'auth_error' });
    res.json({ ok: false, error: e.message });
  }
});

// === Providers List ===
app.get('/api/providers', (req, res) => {
  const list = Object.entries(PROVIDERS).map(([id, p]) => ({
    id,
    name: p.name,
    costPer1MInput: p.costPer1MInput,
    costPer1MOutput: p.costPer1MOutput,
    currency: p.currency,
    desc: p.desc
  }));
  res.json(list);
});

// === Estimate Cost ===
app.post('/api/estimate', (req, res) => {
  const { textLength, provider } = req.body;
  if (!textLength || !provider) return res.status(400).json({ error: 'textLength and provider required' });
  const estimate = estimateCost(textLength, provider);
  res.json(estimate);
});

// === Explain ===
app.post('/api/explain', async (req, res) => {
  const { text, difficulty, provider, apiKey } = req.body;
  if (!text || !difficulty || !provider || !apiKey) {
    return res.status(400).json({ error: 'text, difficulty, provider, and apiKey required' });
  }
  if (text.length > 10000) return res.status(400).json({ error: 'content_too_long' });

  try {
    const result = await callAI(provider, apiKey, text, difficulty);
    res.json({ result });
  } catch (e) {
    if (e.message === 'auth_error') {
      return res.status(401).json({ error: 'auth_error' });
    } else if (e.message === 'quota_exceeded') {
      return res.status(429).json({ error: 'quota_exceeded' });
    }
    res.status(500).json({ error: 'unknown', detail: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('easytounderstand running at http://localhost:' + PORT);
});
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add server.js
git commit -m "feat: add Express server with API config, test connection, and explain routes"
```

---

### Task 4: index.html — HTML structure (two-column layout)

**Files:**
- Create: `easytounderstand/public/index.html`

- [ ] **Step 1: Write the HTML structure**

Write `C:\Users\Administrator\Desktop\easytounderstand\public\index.html`:

```html
<!DOCTYPE html>
<html lang="zh-HK" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>easytounderstand — 白話翻譯機</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>💡</text></svg>">
</head>
<body>

<!-- Onboarding Overlay -->
<div class="onboard-overlay" id="onboardOverlay">
  <div class="onboard-card">
    <h2 id="onboardTitle">歡迎！三步開始 👋</h2>
    <div class="onboard-steps">
      <div class="onboard-step active" data-step="1">
        <span class="step-num">1</span>
        <span>設定 API Key（揀 AI + 入 key）</span>
      </div>
      <div class="onboard-step" data-step="2">
        <span class="step-num">2</span>
        <span>貼文字（貼你想理解嘅內容）</span>
      </div>
      <div class="onboard-step" data-step="3">
        <span class="step-num">3</span>
        <span>揀難度 → 解讀</span>
      </div>
    </div>
    <button class="btn-primary" id="onboardNext">開始 →</button>
  </div>
</div>

<!-- Nav -->
<nav class="nav-bar">
  <div class="nav-inner">
    <span class="nav-logo">💡 easytounderstand</span>
    <div class="nav-actions">
      <button class="icon-btn" id="settingsBtn" title="API 設定">⚙️</button>
      <button class="icon-btn" id="themeToggle" title="深淺色切換">🌙</button>
    </div>
  </div>
</nav>

<!-- API Settings Modal -->
<div class="modal-overlay" id="settingsModal">
  <div class="modal-card">
    <div class="modal-header">
      <h3>⚙️ API 設定</h3>
      <button class="close-btn" id="closeSettings">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>AI 引擎</label>
        <select id="providerSelect"></select>
      </div>
      <div class="form-group" id="providerInfo"></div>
      <div class="form-group">
        <label>API Key</label>
        <div class="key-row">
          <input type="password" id="apiKeyInput" placeholder="貼上你嘅 API key...">
          <button class="btn-secondary btn-sm" id="testConnBtn">測試連線</button>
        </div>
        <span class="form-hint" id="testResult"></span>
      </div>
      <div class="form-group">
        <button class="btn-primary" id="saveConfigBtn">儲存設定</button>
        <span class="save-toast" id="saveToast">已儲存 ✅</span>
      </div>
    </div>
  </div>
</div>

<!-- Main Content -->
<main class="main-container">

  <!-- Left Column -->
  <section class="panel panel-left">
    <div class="panel-header">
      <h2>📝 原文</h2>
      <div class="panel-header-actions">
        <button class="btn-sm" id="pasteBtn">📎 貼上</button>
        <button class="btn-sm" id="clearBtn">🗑 清除</button>
      </div>
    </div>
    <textarea id="textInput" class="text-input" placeholder="喺度貼你想理解嘅文字..."></textarea>
    <div class="input-meta" id="inputMeta"></div>
    <button class="btn-sm btn-outline" id="sampleBtn">💡 試下範例文字</button>

    <div class="paragraphs-container" id="paragraphsContainer"></div>

    <div class="action-bar" id="actionBar">
      <div class="difficulty-selector" id="difficultySelector">
        <button class="diff-btn" data-level="elementary">🎒 小學</button>
        <button class="diff-btn active" data-level="secondary">🎓 中學</button>
        <button class="diff-btn" data-level="working-adult">💼 上班</button>
      </div>
      <button class="btn-primary btn-explain" id="explainBtn" disabled>🔍 解讀選中嘅段落</button>
    </div>
  </section>

  <!-- Right Column -->
  <section class="panel panel-right">
    <div class="panel-header">
      <h2>✨ 白話解讀</h2>
    </div>
    <div class="output-area" id="outputArea">
      <div class="output-placeholder" id="outputPlaceholder">
        <p>👈 喺左邊貼文字，</p>
        <p>選擇段落，</p>
        <p>然後按「解讀」</p>
      </div>
      <div class="output-loading" id="outputLoading">
        <div class="spinner"></div>
        <p id="loadingText">AI 正在用白話幫你翻譯緊...</p>
      </div>
      <div class="output-content" id="outputContent"></div>
    </div>
  </section>

</main>

</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add public/index.html
git commit -m "feat: add HTML structure — two-column layout with all panels and modals"
```

---

### Task 5: index.html — CSS (glass-morphism + orange accent + responsive)

**Files:**
- Modify: `easytounderstand/public/index.html` (add `<style>` block in `<head>`)

- [ ] **Step 1: Add CSS inside `<head>`, after meta tags and favicon**

Insert this `<style>` block:

```css
/* === Reset & Variables === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #fafafa;
  --bg-alt: #f0f0f0;
  --surface: rgba(255,255,255,0.75);
  --surface-hover: rgba(255,255,255,0.92);
  --border: rgba(0,0,0,0.08);
  --text: #1a1a1a;
  --text-secondary: #6b6b6b;
  --accent: #ff6b35;
  --accent-hover: #e85d2a;
  --accent-light: rgba(255,107,53,0.10);
  --accent-border: rgba(255,107,53,0.30);
  --radius: 16px;
  --radius-sm: 10px;
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  --bg: #1a1a1a;
  --bg-alt: #121212;
  --surface: rgba(255,255,255,0.05);
  --surface-hover: rgba(255,255,255,0.10);
  --border: rgba(255,255,255,0.10);
  --text: #f0f0f0;
  --text-secondary: #999;
  --accent-light: rgba(255,107,53,0.15);
  --accent-border: rgba(255,107,53,0.40);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  transition: background var(--transition), color var(--transition);
  min-height: 100vh;
}

/* === Nav === */
.nav-bar {
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: var(--surface); border-bottom: 1px solid var(--border);
}
.nav-inner { max-width: 1400px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:12px 24px; }
.nav-logo { font-weight:700; font-size:1.1rem; }
.nav-actions { display:flex; gap:8px; }
.icon-btn {
  background: var(--surface); border:1px solid var(--border); border-radius:8px;
  padding:6px 10px; cursor:pointer; font-size:1.1rem; color:var(--text);
  transition: all var(--transition);
}
.icon-btn:hover { background: var(--surface-hover); }

/* === Main Layout === */
.main-container { display:flex; gap:16px; max-width:1400px; margin:16px auto; padding:0 16px; min-height:calc(100vh - 80px); }
.panel { flex:1; display:flex; flex-direction:column; }
.panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.panel-header h2 { font-size:1rem; font-weight:700; }
.panel-header-actions { display:flex; gap:6px; }

/* === Buttons === */
.btn-primary {
  background:var(--accent); color:#fff; border:none; border-radius:50px;
  padding:10px 22px; font-weight:600; font-size:0.9rem; cursor:pointer;
  transition: all var(--transition);
}
.btn-primary:hover { background:var(--accent-hover); transform:translateY(-1px); }
.btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
.btn-secondary {
  background:var(--surface); color:var(--text); border:1px solid var(--border);
  border-radius:50px; padding:10px 22px; font-weight:600; font-size:0.9rem;
  cursor:pointer; transition: all var(--transition);
}
.btn-secondary:hover { background:var(--surface-hover); }
.btn-sm { padding:5px 12px; font-size:0.8rem; border-radius:6px; border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; transition:all var(--transition); }
.btn-sm:hover { background:var(--surface-hover); }
.btn-outline { background:transparent; border:1px dashed var(--border); color:var(--text-secondary); width:100%; margin-top:8px; }
.btn-outline:hover { border-color:var(--accent); color:var(--accent); }
.btn-explain { padding:12px 32px; width:100%; font-size:1rem; }

/* === Text Input === */
.text-input {
  width:100%; min-height:180px; padding:16px; border-radius:var(--radius);
  border:1px solid var(--border); background:var(--surface);
  color:var(--text); font-size:0.9rem; line-height:1.7; resize:vertical;
  font-family: inherit; transition: all var(--transition);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.text-input:focus { outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-light); }
.text-input::placeholder { color:var(--text-secondary); }
.input-meta { font-size:0.78rem; color:var(--text-secondary); margin-top:6px; min-height:20px; }

/* === Paragraphs === */
.paragraphs-container { margin-top:16px; display:flex; flex-direction:column; gap:8px; overflow-y:auto; }
.para-item {
  padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--border);
  background:var(--surface); cursor:pointer; font-size:0.88rem; line-height:1.6;
  transition: all var(--transition); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.para-item:hover { border-color:var(--accent-border); }
.para-item.selected { border-color:var(--accent); background:var(--accent-light); }
.para-item .para-num { font-weight:700; font-size:0.75rem; color:var(--accent); margin-right:6px; }

/* === Action Bar === */
.action-bar {
  margin-top:16px; padding:16px; border-radius:var(--radius);
  border:1px solid var(--border); background:var(--surface);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.difficulty-selector { display:flex; gap:4px; margin-bottom:12px; background:var(--bg); border-radius:8px; padding:4px; }
.diff-btn { flex:1; padding:8px 6px; border:none; border-radius:6px; background:transparent; cursor:pointer; font-size:0.8rem; color:var(--text-secondary); transition:all var(--transition); }
.diff-btn.active { background:var(--accent); color:#fff; }

/* === Output Area === */
.output-area { flex:1; padding:20px; border-radius:var(--radius); border:1px solid var(--border); background:var(--surface); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); min-height:400px; display:flex; flex-direction:column; }
.output-placeholder { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.95rem; gap:6px; }
.output-loading { display:none; flex-direction:column; align-items:center; justify-content:center; gap:16px; flex:1; }
.spinner { width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.output-content { display:none; flex-direction:column; gap:16px; }
.output-section { padding:16px; border-radius:var(--radius-sm); background:var(--bg); position:relative; }
.output-section h3 { font-size:0.9rem; margin-bottom:6px; }
.output-section p { font-size:0.88rem; line-height:1.7; color:var(--text-secondary); }
.copy-btn {
  position:absolute; top:10px; right:10px;
  background:var(--surface); border:1px solid var(--border); border-radius:6px;
  padding:3px 8px; font-size:0.72rem; cursor:pointer; color:var(--text-secondary);
  transition: all var(--transition);
}
.copy-btn:hover { border-color:var(--accent); color:var(--accent); }
.output-actions { display:flex; gap:8px; margin-top:8px; }
.feedback-row { display:flex; align-items:center; gap:8px; margin-top:12px; font-size:0.85rem; color:var(--text-secondary); }
.feedback-row button { background:var(--surface); border:1px solid var(--border); border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:1rem; transition:all var(--transition); }
.feedback-row button:hover { border-color:var(--accent); }

/* === Onboarding === */
.onboard-overlay { display:none; position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; }
.onboard-overlay.show { display:flex; }
.onboard-card { background:var(--bg); border-radius:var(--radius); padding:32px; max-width:420px; width:90%; text-align:center; box-shadow:0 24px 64px rgba(0,0,0,0.3); }
.onboard-steps { display:flex; flex-direction:column; gap:10px; margin:20px 0; text-align:left; }
.onboard-step { display:flex; align-items:center; gap:10px; font-size:0.9rem; opacity:0.4; }
.onboard-step.active { opacity:1; }
.step-num { background:var(--accent); color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.78rem; font-weight:700; }

/* === Settings Modal === */
.modal-overlay { display:none; position:fixed; inset:0; z-index:150; background:rgba(0,0,0,0.4); align-items:center; justify-content:center; }
.modal-overlay.show { display:flex; }
.modal-card { background:var(--bg); border-radius:var(--radius); padding:24px; max-width:480px; width:90%; box-shadow:0 24px 64px rgba(0,0,0,0.3); }
.modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
.close-btn { background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-secondary); }
.form-group { margin-bottom:14px; }
.form-group label { display:block; font-size:0.82rem; font-weight:600; margin-bottom:4px; }
.form-group select, .form-group input[type="password"], .form-group input[type="text"] {
  width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border);
  background:var(--surface); color:var(--text); font-size:0.9rem; font-family:inherit;
}
.key-row { display:flex; gap:8px; }
.key-row input { flex:1; }
.form-hint { font-size:0.78rem; margin-top:4px; }
.form-hint.success { color:#34c759; }
.form-hint.error { color:#ff3b30; }
.save-toast { display:none; font-size:0.82rem; color:#34c759; margin-left:10px; }
.save-toast.show { display:inline; }
#providerInfo { font-size:0.82rem; color:var(--text-secondary); padding:8px 12px; border-radius:8px; background:var(--bg-alt); }

/* === Footer === */
.footer { text-align:center; padding:20px; color:var(--text-secondary); font-size:0.78rem; }

/* === Responsive === */
@media (max-width: 768px) {
  .main-container { flex-direction:column; padding:8px; }
  .panel { flex:none; }
  .text-input { min-height:140px; }
  .output-area { min-height:300px; }
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add public/index.html
git commit -m "style: add glass-morphism CSS with orange accent and responsive"
```

---

### Task 6: index.html — JavaScript (all interactivity)

**Files:**
- Modify: `easytounderstand/public/index.html` (add `<script>` block before `</body>`)

- [ ] **Step 1: Add JavaScript**

Insert this `<script>` block just before `</body>`:

```javascript
// === State ===
var state = {
  provider: 'deepseek',
  apiKey: '',
  difficulty: 'secondary',
  selectedParagraph: -1,
  paragraphs: [],
  configured: false
};

// === DOM Refs ===
var $ = function(id) { return document.getElementById(id); };
var textInput = $('textInput');
var paragraphsContainer = $('paragraphsContainer');
var inputMeta = $('inputMeta');
var explainBtn = $('explainBtn');
var outputPlaceholder = $('outputPlaceholder');
var outputLoading = $('outputLoading');
var outputContent = $('outputContent');
var settingsModal = $('settingsModal');
var onboardOverlay = $('onboardOverlay');
var providerSelect = $('providerSelect');
var providerInfo = $('providerInfo');
var apiKeyInput = $('apiKeyInput');
var testResult = $('testResult');
var saveToast = $('saveToast');
var loadingText = $('loadingText');

// === Init ===
function init() {
  loadConfigFromServer();
  loadProviders();
  textInput.addEventListener('input', onTextInput);
  $('pasteBtn').addEventListener('click', pasteFromClipboard);
  $('clearBtn').addEventListener('click', clearAll);
  $('sampleBtn').addEventListener('click', loadSample);
  $('explainBtn').addEventListener('click', doExplain);
  $('settingsBtn').addEventListener('click', function() { settingsModal.classList.add('show'); });
  $('closeSettings').addEventListener('click', function() { settingsModal.classList.remove('show'); });
  $('testConnBtn').addEventListener('click', testConnection);
  $('saveConfigBtn').addEventListener('click', saveConfig);
  $('themeToggle').addEventListener('click', toggleTheme);
  $('onboardNext').addEventListener('click', onboardNext);
  providerSelect.addEventListener('change', onProviderChange);
  document.querySelectorAll('.diff-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.diff-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.difficulty = btn.dataset.level;
    });
  });
  initTheme();
}

// === Config ===
function loadConfigFromServer() {
  fetch('/api/config').then(function(r) { return r.json(); }).then(function(c) {
    if (c.configured) {
      state.provider = c.provider;
      state.apiKey = ''; // need full key from localStorage
      var saved = localStorage.getItem('ez-api-key');
      if (saved) state.apiKey = saved;
      state.configured = true;
      providerSelect.value = c.provider;
      updateProviderInfo();
      $('onboardOverlay').classList.remove('show');
    } else {
      $('onboardOverlay').classList.add('show');
    }
  });
}

function saveConfig() {
  var provider = providerSelect.value;
  var apiKey = apiKeyInput.value.trim();
  if (!apiKey) return;
  state.provider = provider;
  state.apiKey = apiKey;
  state.configured = true;
  localStorage.setItem('ez-api-key', apiKey);
  fetch('/api/config', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({provider:provider, apiKey:apiKey})
  }).then(function(r) { return r.json(); }).then(function() {
    saveToast.classList.add('show');
    setTimeout(function() { saveToast.classList.remove('show'); settingsModal.classList.remove('show'); }, 1200);
  });
}

function loadProviders() {
  fetch('/api/providers').then(function(r) { return r.json(); }).then(function(providers) {
    providers.forEach(function(p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + ' — ' + p.desc;
      providerSelect.appendChild(opt);
    });
    if (state.provider) { providerSelect.value = state.provider; updateProviderInfo(); }
  });
}

function onProviderChange() {
  state.provider = providerSelect.value;
  updateProviderInfo();
  if (textInput.value.trim()) updateMeta();
}

function updateProviderInfo() {
  fetch('/api/providers').then(function(r) { return r.json(); }).then(function(providers) {
    var p = providers.find(function(x) { return x.id === providerSelect.value; });
    if (p) {
      providerInfo.innerHTML = '💰 入: $' + p.costPer1MInput + '/百萬 token · 出: $' + p.costPer1MOutput + '/百萬 token · ' + p.currency;
    }
  });
}

function testConnection() {
  var provider = providerSelect.value;
  var apiKey = apiKeyInput.value.trim();
  if (!apiKey) { testResult.textContent = '請先輸入 API key'; testResult.className = 'form-hint error'; return; }
  testResult.textContent = '測試緊...'; testResult.className = 'form-hint';
  fetch('/api/test-connection', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({provider:provider, apiKey:apiKey})
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.ok) { testResult.textContent = '連線成功 ✅'; testResult.className = 'form-hint success'; }
    else if (data.error === 'auth_error') { testResult.textContent = 'Key 似乎有問題，檢查下啦～ 🔑'; testResult.className = 'form-hint error'; }
    else { testResult.textContent = '連線失敗：' + (data.error || 'unknown'); testResult.className = 'form-hint error'; }
  }).catch(function() {
    testResult.textContent = '連唔到去 AI 伺服器，檢查下網絡啦 🌐';
    testResult.className = 'form-hint error';
  });
}

// === Text Input ===
function onTextInput() {
  var text = textInput.value.trim();
  if (!text) { paragraphsContainer.innerHTML = ''; inputMeta.innerHTML = ''; explainBtn.disabled = true; return; }
  state.paragraphs = text.split(/\n\n+/).filter(function(p) { return p.trim(); });
  renderParagraphs();
  updateMeta();
}

function renderParagraphs() {
  paragraphsContainer.innerHTML = state.paragraphs.map(function(p, i) {
    return '<div class="para-item' + (i === state.selectedParagraph ? ' selected' : '') + '" data-index="' + i + '">' +
      '<span class="para-num">段' + (i + 1) + '</span>' + escapeHtml(p.slice(0, 200)) + (p.length > 200 ? '...' : '') +
    '</div>';
  }).join('');
  Array.from(paragraphsContainer.children).forEach(function(el) {
    el.addEventListener('click', function() {
      var idx = parseInt(el.dataset.index);
      state.selectedParagraph = idx;
      renderParagraphs();
      explainBtn.disabled = false;
    });
  });
}

function updateMeta() {
  var text = textInput.value;
  var chars = text.length;
  var html = chars + ' 字';
  if (chars > 0 && state.provider) {
    fetch('/api/estimate', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({textLength:chars, provider:state.provider})
    }).then(function(r) { return r.json(); }).then(function(e) {
      inputMeta.innerHTML = chars + ' 字 · 約 ' + e.inputTokens + ' tokens · 估費用 ~$' + e.estimatedUSD.toFixed(4) + ' ' + e.currency;
    });
  } else {
    inputMeta.innerHTML = html;
  }
}

function pasteFromClipboard() {
  navigator.clipboard.readText().then(function(t) {
    textInput.value = t; onTextInput();
  }).catch(function() {
    textInput.focus();
  });
}

function clearAll() {
  textInput.value = '';
  state.paragraphs = []; state.selectedParagraph = -1;
  paragraphsContainer.innerHTML = '';
  inputMeta.innerHTML = '';
  explainBtn.disabled = true;
  outputPlaceholder.style.display = 'flex';
  outputLoading.style.display = 'none';
  outputContent.style.display = 'none';
}

// === Sample Texts ===
var samples = [
  '大型語言模型（Large Language Model, LLM）透過自注意力機制（Self-Attention Mechanism）捕捉長距離語境依賴關係，並利用多層 Transformer 架構進行表徵學習。在預訓練階段，模型以大規模語料庫進行自監督學習，透過預測下一個 Token 的方式逐步最佳化參數。隨後透過指令微調（Instruction Tuning）與 RLHF（Reinforcement Learning from Human Feedback）使模型對齊人類偏好，實現卓越的自然語言理解與生成能力。',

  '量子計算（Quantum Computing）利用量子疊加（Superposition）與量子糾纏（Entanglement）等量子力學基本原理來處理資訊。與傳統計算機使用 0 或 1 的位元不同，量子位元（Qubit）可以同時處於 0 和 1 的疊加態，使量子計算機能夠並行處理極大量的可能性。Shor 演算法展示了量子計算在破解 RSA 加密上的潛在優勢，而 Grover 演算法則能在無序資料庫中實現二次加速搜尋。',

  '區塊鏈技術本質上是一種去中心化的分散式帳本（Distributed Ledger），透過共識機制（Consensus Mechanism）如工作量證明（Proof of Work）或權益證明（Proof of Stake）來確保資料不可篡改性。智能合約（Smart Contract）則是運行在區塊鏈上的自動化程式，當預設條件被觸發時自動執行合約條款。DeFi（去中心化金融）利用這些技術建立無需中介的金融服務生態，包括借貸、交易與流動性挖礦等應用。'
];

function loadSample() {
  var sample = samples[Math.floor(Math.random() * samples.length)];
  textInput.value = sample;
  onTextInput();
}

// === Explain ===
var explainCooldown = false;

function doExplain() {
  if (explainCooldown) return;
  if (!state.configured || !state.apiKey) {
    settingsModal.classList.add('show'); return;
  }
  if (state.selectedParagraph < 0 || state.selectedParagraph >= state.paragraphs.length) return;

  var text = state.paragraphs[state.selectedParagraph];
  explainCooldown = true;
  setTimeout(function() { explainCooldown = false; }, 2000);

  // Show loading
  outputPlaceholder.style.display = 'none';
  outputContent.style.display = 'none';
  outputLoading.style.display = 'flex';
  var diffTexts = { elementary: 'AI 老師而家用故事書方式講緊畀你聽哦～ 📖', secondary: 'AI 正在用白話幫你翻譯緊...', 'working-adult': 'AI 顧問幫你分析緊重點... 💼' };
  loadingText.textContent = diffTexts[state.difficulty] || 'AI 正在用白話幫你翻譯緊...';

  fetch('/api/explain', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      text: text, difficulty: state.difficulty,
      provider: state.provider, apiKey: state.apiKey
    })
  }).then(function(r) { return r.json(); }).then(function(data) {
    outputLoading.style.display = 'none';
    if (data.error) {
      showError(data.error);
    } else {
      showResult(data.result);
    }
  }).catch(function() {
    outputLoading.style.display = 'none';
    showError('unknown');
  });
}

function showError(code) {
  var messages = {
    auth_error: 'Key 似乎有問題，檢查下啦～ 🔑',
    quota_exceeded: '今個月嘅用量爆咗啦！去平台入錢啦 💰',
    content_too_long: '呢篇嘢太長啦，試下逐段解讀～ 📏',
    unknown: '唔知發生咩事，再試一次啦 🥲'
  };
  outputContent.innerHTML = '<div class="output-section"><p>' + (messages[code] || messages.unknown) + '</p></div>';
  outputContent.style.display = 'flex';
}

function showResult(text) {
  outputContent.innerHTML = '';
  var sections = text.split(/\n(?=📌|💬|🧸|✅)/);
  sections.forEach(function(s) {
    s = s.trim();
    if (!s) return;
    var title = s.split('\n')[0];
    var body = s.split('\n').slice(1).join('\n').trim();
    var secDiv = document.createElement('div');
    secDiv.className = 'output-section';
    var h3 = document.createElement('h3');
    h3.textContent = title;
    var p = document.createElement('p');
    p.textContent = body || title;
    var copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '複製';
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(title + '\n' + body);
      copyBtn.textContent = '已複製!';
      setTimeout(function() { copyBtn.textContent = '複製'; }, 1500);
    });
    secDiv.appendChild(h3);
    secDiv.appendChild(p);
    secDiv.appendChild(copyBtn);
    outputContent.appendChild(secDiv);
  });

  // Action buttons
  var actionsDiv = document.createElement('div');
  actionsDiv.className = 'output-actions';
  var copyAllBtn = document.createElement('button');
  copyAllBtn.className = 'btn-secondary';
  copyAllBtn.textContent = '📋 複製全部';
  copyAllBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(text);
    copyAllBtn.textContent = '已複製!';
    setTimeout(function() { copyAllBtn.textContent = '📋 複製全部'; }, 1500);
  });
  var regenBtn = document.createElement('button');
  regenBtn.className = 'btn-secondary';
  regenBtn.textContent = '🔄 重新生成';
  regenBtn.addEventListener('click', doExplain);

  actionsDiv.appendChild(copyAllBtn);
  actionsDiv.appendChild(regenBtn);
  outputContent.appendChild(actionsDiv);

  // Feedback
  var feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-row';
  feedbackDiv.innerHTML = '<span>呢個解釋點樣？</span>';
  var thumbsUp = document.createElement('button');
  thumbsUp.textContent = '👍';
  thumbsUp.addEventListener('click', function() { feedbackDiv.innerHTML = '<span>多謝！好開心幫到你 🎉</span>'; });
  var thumbsDown = document.createElement('button');
  thumbsDown.textContent = '👎';
  thumbsDown.addEventListener('click', function() { feedbackDiv.innerHTML = '<span>收到，會繼續改進 💪</span>'; });
  feedbackDiv.appendChild(thumbsUp);
  feedbackDiv.appendChild(thumbsDown);
  outputContent.appendChild(feedbackDiv);

  outputContent.style.display = 'flex';
}

// === Theme ===
function initTheme() {
  var saved = localStorage.getItem('ez-theme');
  if (saved) { document.documentElement.setAttribute('data-theme', saved); $('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙'; }
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) { document.documentElement.setAttribute('data-theme', 'dark'); $('themeToggle').textContent = '☀️'; }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  $('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('ez-theme', next);
}

// === Onboarding ===
var onboardStep = 0;
var onboardSteps = [
  function() { settingsModal.classList.add('show'); $('onboardTitle').textContent = '步驟 1/3：設定 API Key'; },
  function() { settingsModal.classList.remove('show'); $('onboardTitle').textContent = '步驟 2/3：貼文字'; },
  function() { $('onboardTitle').textContent = '步驟 3/3：揀難度 → 解讀'; }
];

function onboardNext() {
  onboardStep++;
  var steps = document.querySelectorAll('.onboard-step');
  steps.forEach(function(s, i) { s.classList.toggle('active', i === onboardStep); });
  if (onboardStep >= 3) {
    $('onboardOverlay').classList.remove('show');
    if (!state.configured) settingsModal.classList.add('show');
  } else {
    onboardSteps[onboardStep]();
  }
}

// === Helpers ===
function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// === Start ===
init();
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add public/index.html
git commit -m "feat: add JavaScript — paragraph selection, API settings, explain, onboarding, theme"
```

---

### Task 7: Test locally and verify

- [ ] **Step 1: Start the server**

Run:
```bash
cd /c/Users/Administrator/Desktop/easytounderstand
node server.js
```
Expected: `easytounderstand running at http://localhost:8080`

- [ ] **Step 2: Open in browser**

Open `http://localhost:8080` and verify:
- Onboarding overlay appears on first visit
- Settings modal (⚙️) opens, provider dropdown has 4 options
- Can select provider, enter API key, test connection
- Paste text → paragraphs render in left panel
- Click paragraph → highlights orange, "解讀" button enables
- Character count + cost estimate shows
- Select difficulty → click 解讀 → loading spinner shows → result appears in right panel
- Copy buttons work on each section and "複製全部"
- "重新生成" works
- 👍👎 feedback responds
- Theme toggle (🌙) swaps dark/light
- Sample text button (💡) loads preset text
- Mobile: columns stack vertically

- [ ] **Step 3: Commit any fixes**

```bash
cd /c/Users/Administrator/Desktop/easytounderstand
git add -A
git commit -m "fix: final adjustments after testing"
```
