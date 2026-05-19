# easytounderstand — Design Spec

**Date:** 2026-05-19
**Status:** Approved

## Overview

「白話翻譯機」— 把複雜文章/教學/論文用香港繁體中文重新解釋成簡單白話。
v1: 貼文字版。PDF/URL 之後加。

## Product Model

- 一次買斷（跟 GentleReview AI 一樣模式）
- 用戶自備 AI API key（內建申請教學引導）
- 支援多個 AI 後端：DeepSeek（首發）、OpenAI、Claude、Gemini

## Tech Stack

- Node.js + Express (CommonJS)
- Single-page HTML frontend (glass-morphism, same style as GentleReview)
- DeepSeek V4 Pro API (first integration)

## Page Layout

Two-column layout:

**Left Column:**
- Text input area (paste text)
- 「從剪貼簿貼上」+ 「清除」buttons above input
- Character count + estimated API cost display (updates live based on selected AI provider)
- Auto paragraph detection and display
- Click to select a paragraph (orange highlight = selected)
- Difficulty selector: 小學生 / 中學生 / 上班族
- 「解讀」button (with debounce to prevent spam clicks)

**Right Column:**
- Loading animation while AI processes: "AI 正在用白話幫你翻譯緊..." with spinner
- Structured output:
  1. 📌 呢段主要講緊咩（一句話總結）
  2. 💬 逐點解釋（聊天式白話）
  3. 🧸 打個比喻（生活化例子）
  4. ✅ 總之一句（一句話收尾）
- Each section has a 「複製」button (top-right corner)
- Bottom: 「複製全部」+ 「重新生成」 buttons
- 👍👎 feedback buttons: "呢個解釋點樣？"

## Visual Style

- Minimalist black/white base
- Accent color: warm orange `#ff6b35`
- Glass-morphism cards (backdrop-filter blur, translucent surfaces)
- Dark/light mode support
- Responsive (mobile-friendly)
- Hong Kong Traditional Chinese UI

## Difficulty Levels

| Level | Word Choice | Sentence | English Terms | Focus |
|-------|------------|----------|:--:|-------|
| 🎒 小學生 | Simplest | Very short | None | Stories, metaphors |
| 🎓 中學生 | Normal plain | Medium | Few + explained | Understanding concepts |
| 💼 上班族 | Direct/practical | Longer | Mentioned, not deep | "What's in it for me" |

## API Settings Panel

An API selection interface in settings:
- Dropdown/picker for AI provider
- Each option shows: name, cost per million tokens, quality rating, best use case
- 「?」button per provider → inline tutorial with screenshots on how to get API key
- User's API key input field (stored in `data/api-config.json` + localStorage backup)
- 「測試連線」button — pings the selected API to verify key works
- Save confirmation: "已儲存 ✅" toast

## Error Handling

Friendly Hong Kong Cantonese-style error messages:
- Invalid API key: "Key 似乎有問題，檢查下啦～ 🔑"
- Quota exceeded: "今個月嘅用量爆咗啦！去平台入錢啦 💰"
- Network error: "連唔到去 AI 伺服器，檢查下網絡啦 🌐"
- Content too long: "呢篇嘢太長啦，試下逐段解讀～ 📏"
- Unknown error: "唔知發生咩事，再試一次啦 🥲"

## First-Run Experience

On first visit (no API key configured):
- Simple 3-step onboarding overlay:
  1. 設定 API Key（揀 AI + 入 key）
  2. 貼文字（貼你想理解嘅內容）
  3. 揀難度 → 解讀

## Server Architecture

- `server.js`: Express static file serving, API routes
- `generator.js`: Prompt template builder (3 difficulty levels), AI API call logic
- 3 system prompts per difficulty level, stored as templates for easy tuning
- Debounce on 「解讀」button (2-second cooldown)
- API key never leaves server — only used for backend-to-AI calls

API providers for v1:
- DeepSeek V4 (recommended, cheapest, Chinese interface)
- OpenAI GPT-4o (highest quality)
- Claude (best explanations)
- Google Gemini (free tier available)

## Project File Structure

```
easytounderstand/
├── server.js          (Express backend, API routes)
├── generator.js       (AI prompt builder, API call logic)
├── package.json
├── data/
│   └── api-config.json
├── public/
│   ├── index.html     (single-page frontend)
│   └── icon128.png
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-19-easytounderstand-design.md
└── CLAUDE.md
```

## Out of Scope for v1

- PDF upload and parsing
- URL fetching and text extraction
- License/activation system (add after validation)
- User accounts
- Usage tracking
- Multi-language UI (Hong Kong Chinese only)
