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
- Auto paragraph detection and display
- Click to select a paragraph (blue highlight = selected)
- Difficulty selector: 小學生 / 中學生 / 上班族
- 「解讀」button

**Right Column:**
- Structured output:
  1. 📌 呢段主要講緊咩（一句話總結）
  2. 💬 逐點解釋（聊天式白話）
  3. 🧸 打個比喻（生活化例子）
  4. ✅ 總之一句（一句話收尾）

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
- User's API key input field (stored locally in `data/api-config.json`)

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
