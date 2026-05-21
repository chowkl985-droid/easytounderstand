<div align="center">

# 講人話 · MakeItEasy

**咩文都好，用人話講返你聽。**

*Any language, explained in yours.*

---

</div>

## ✨ 功能

- **📄 貼文字 + 上載 PDF** — 任何格式，貼上就解得
- **🎒🎓💼 三種難度** — 小學、中學、上班族，揀你睇得明嘅程度
- **🌍 跨語言解釋** — 英文原文用廣東話解、中文文件用英文解，你鍾意點都得
- **🤖 7 大 AI 引擎** — DeepSeek / GPT-4o / Claude / Gemini / Grok / Qwen / 自訂 API
- **🖥 Desktop App** — 雙擊 `MakeItEasy.exe`，browser 自動打開，乜都唔使裝
- **💰 一次買斷** — $39 USD，唔係月費，唔係訂閱，買一次用一世

---

## 🚀 安裝同使用

### 方法一：下載 Desktop App（推薦）

1. 下載 `MakeItEasy-v1.0.0-windows-x64.zip`
2. 解壓去任何 folder
3. 雙擊 `MakeItEasy.exe`
4. Browser 會自動打開 `http://localhost:8080`
5. Set 好你嘅 API key → 開始用

### 方法二：自己跑（開發者）

```bash
git clone https://github.com/chowkl985-droid/easytounderstand.git
cd easytounderstand
npm install
node server.js
# 打開 http://localhost:8080
```

> **注意：** `prompts/` 資料夾冇 commit 上 GitHub。開發者需要自己準備 prompt template 檔案。

---

## ⚙️ 設定

### API Key

開 app → 撳右上角 ⚙️ → 揀 AI 引擎 → 貼 API key → 儲存。

支援嘅 AI 引擎：

| 引擎 | 特色 | 需要 Key |
|------|------|----------|
| DeepSeek V4 | 最平、粵語自然 | [DeepSeek API](https://platform.deepseek.com) |
| OpenAI GPT-4o | 品質最高 | [OpenAI API](https://platform.openai.com) |
| Claude (Anthropic) | 解釋力最強 | [Anthropic Console](https://console.anthropic.com) |
| Gemini (Google) | 免費入門 | [Google AI Studio](https://aistudio.google.com) |
| Grok (xAI) | 推理強 | [xAI Console](https://console.x.ai) |
| Qwen (通義千問) | 中文最強 | [阿里雲 DashScope](https://dashscope.aliyun.com) |
| 自訂 API | 自己 endpoint | 任何 OpenAI 兼容 |

### Prompt Template

`prompts/` 資料夾入面放咗三語提示詞模板（`.txt`），有需要可以自己改。

---

## ❓ FAQ

<details>
<summary><strong>API key 會唔會上傳？</strong></summary>

唔會。API key 淨係儲喺你 browser localStorage 同埋 local `data/api-config.json`，永遠唔會上傳去任何第三方伺服器。
</details>

<details>
<summary><strong>免費版有咩限制？</strong></summary>

每日 10 次文字解讀 + 3 次 PDF 解讀。升級 Pro（$39 一次買斷）就無限使用。
</details>

<details>
<summary><strong>Pro 係月費定一次過？</strong></summary>

一次買斷。$39 USD，永久使用，唔使再俾錢。
</details>

<details>
<summary><strong>我用緊邊個 AI 模型？</strong></summary>

你自己決定。你喺設定頁面揀邊個 AI 引擎 + 用你自己嘅 API key。我哋唔會幫你揀，亦唔會收任何額外費用。
</details>

---

## 📄 License

Proprietary. All rights reserved.
