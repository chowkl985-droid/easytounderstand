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
  const { provider, apiKey, customEndpoint, customModel } = req.body;
  if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey required' });
  if (!PROVIDERS[provider]) return res.status(400).json({ error: 'unknown provider' });
  if (provider === 'custom' && !customEndpoint) return res.status(400).json({ error: 'customEndpoint required for custom provider' });
  saveConfig({ provider, apiKey, customEndpoint: customEndpoint || '', customModel: customModel || '' });
  res.json({ ok: true, provider });
});

app.delete('/api/config', (req, res) => {
  try { fs.unlinkSync(CONFIG_FILE); } catch {}
  res.json({ ok: true });
});

// === Test Connection ===
app.post('/api/test-connection', async (req, res) => {
  const { provider, apiKey, customEndpoint, customModel } = req.body;
  if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey required' });
  if (provider === 'custom' && !customEndpoint) return res.status(400).json({ error: 'customEndpoint required' });
  try {
    await callAI(provider, apiKey, 'Hello, respond with just "OK".', 'secondary', 'en', customEndpoint, customModel);
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
    desc: p.desc,
    descCn: p.descCn,
    descEn: p.descEn
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
  const { text, difficulty, provider, apiKey, language, customEndpoint, customModel } = req.body;
  if (!text || !difficulty || !provider || !apiKey) {
    return res.status(400).json({ error: 'text, difficulty, provider, and apiKey required' });
  }
  if (text.length > 10000) return res.status(400).json({ error: 'content_too_long' });

  try {
    const result = await callAI(provider, apiKey, text, difficulty, language || 'zh', customEndpoint, customModel);
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
