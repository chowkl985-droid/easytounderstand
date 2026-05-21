<div align="center">

# MakeItEasy

**Any language, explained in yours.**

---

</div>

## ✨ Features

- **📄 Paste text + upload PDF** — just paste or drop, it auto-detects paragraphs
- **🎒🎓💼 Three difficulty levels** — Kid (stories), Teen (casual), Working Adult (key points)
- **🌍 Cross-language** — Read an English paper, get the explanation in Cantonese. Read a Chinese document, get it in plain English
- **🤖 7 AI engines** — DeepSeek / GPT-4o / Claude / Gemini / Grok / Qwen / Custom API — bring your own key
- **🖥 Desktop App** — Double-click `MakeItEasy.exe`, browser opens automatically. No setup required
- **💰 One-time purchase** — $39 USD. Not a subscription. Buy once, use forever.

---

## 🚀 Getting Started

### Download (recommended)

1. Download `MakeItEasy-v1.0.0-windows-x64.zip` from [Releases](https://github.com/chowkl985-droid/easytounderstand/releases) or [Gumroad](https://chowkl.gumroad.com/l/MakeItSimple)
2. Unzip to any folder
3. Double-click `MakeItEasy.exe`
4. Browser opens automatically at `http://localhost:8080`
5. Set your API key → start using

### Run from source (developers)

```bash
git clone https://github.com/chowkl985-droid/easytounderstand.git
cd easytounderstand
npm install
node server.js
# Open http://localhost:8080
```

> **Note:** `prompts/` is not committed to GitHub. Developers need to provide their own prompt template files.

---

## ⚙️ Configuration

### API Key

Open the app → click ⚙️ (top right) → choose AI engine → paste your API key → save.

Supported AI engines:

| Engine | Best for | Get Key |
|------|------|----------|
| DeepSeek V4 | Cheapest, natural Cantonese | [DeepSeek API](https://platform.deepseek.com) |
| OpenAI GPT-4o | Highest quality | [OpenAI API](https://platform.openai.com) |
| Claude (Anthropic) | Best explanations | [Anthropic Console](https://console.anthropic.com) |
| Gemini (Google) | Free tier | [Google AI Studio](https://aistudio.google.com) |
| Grok (xAI) | Strong reasoning | [xAI Console](https://console.x.ai) |
| Qwen | Strong Chinese | [DashScope](https://dashscope.aliyun.com) |
| Custom API | Your own endpoint | Any OpenAI-compatible |

### Prompt Templates

`prompts/` folder contains the trilingual prompt templates (`.txt`). Edit them to customize the explanation style.

---

## ❓ FAQ

<details>
<summary><strong>Is my API key sent anywhere?</strong></summary>

No. Your API key is stored only in your browser's localStorage and a local `data/api-config.json` file. It never leaves your computer.
</details>

<details>
<summary><strong>What are the free tier limits?</strong></summary>

10 text explanations + 3 PDF explanations per day. Upgrade to Pro ($39 one-time) for unlimited use.
</details>

<details>
<summary><strong>Is Pro a subscription?</strong></summary>

No. $39 USD one-time purchase. Use it forever. No monthly fees.
</details>

<details>
<summary><strong>Which AI model am I using?</strong></summary>

You decide. Pick any supported AI engine and use your own API key. We don't choose for you, and we don't charge any markup.
</details>

---

## 📄 License

Proprietary. All rights reserved.
