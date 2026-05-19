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
    descEn: 'Cheapest · Natural Cantonese · Chinese UI',
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
    descEn: 'Highest quality · Best comprehension',
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
    descEn: 'Best explanations · Most educational',
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
    descEn: 'Free tier · Good for daily use',
    header: (key) => ({ 'Content-Type': 'application/json' }),
    body: (model, messages) => {
      const fullText = messages.map(m => m.content).join('\n\n');
      return JSON.stringify({ contents: [{ parts: [{ text: fullText }] }] });
    }
  }
};

function loadPromptTemplate(difficulty, language) {
  const lang = language || 'zh';
  const fileMap = { elementary: 'elementary.txt', secondary: 'secondary.txt', 'working-adult': 'working-adult.txt' };
  const file = fileMap[difficulty] || 'secondary.txt';
  return fs.readFileSync(path.join(PROMPTS_DIR, lang, file), 'utf-8');
}

function buildPrompt(text, difficulty, language) {
  const template = loadPromptTemplate(difficulty, language);
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

async function callAI(providerId, apiKey, text, difficulty, language) {
  const p = PROVIDERS[providerId];
  if (!p) throw new Error('Unknown provider: ' + providerId);

  const prompt = buildPrompt(text, difficulty, language);
  const sysMsg = (language === 'en')
    ? 'You are a helpful explanation tool. Follow the format exactly.'
    : '你係一個翻譯同解釋工具。跟住格式輸出。';
  const messages = [
    { role: 'system', content: sysMsg },
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
