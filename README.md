<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="Oumi Audio" />

# Oumi Audio

**Create audio that brains remember.**

_Neural-powered creative intelligence for high-conversion audio content._

[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TRIBE v2](https://img.shields.io/badge/TRIBE_v2-Neural_Engine-cc97ff)](https://huggingface.co/spaces/Reino0ne/tribev2)
[![Gemini](https://img.shields.io/badge/Gemini-3.0_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## What is Oumi Audio?

Oumi Audio is a **creative intelligence platform** that helps you produce high-performing audio ads, promos, and sonic branding — backed by real neural data.

1. **Ingest** your creative inputs (briefs, scripts, references) into a semantic memory engine (Turbopuffer)
2. **Generate** premium audio variants with AI (Gemini + ElevenLabs TTS)
3. **Analyze** each variant with [TRIBE v2](https://huggingface.co/spaces/Reino0ne/tribev2) neural prediction — measuring engagement, emotion, recall, attention, and cognitive load
4. **Optimize** with structured, actionable insights interpreted by the Intelligence Engine

## Key Features

| Feature | Description |
|---|---|
| 🧠 **Neural Analysis** | TRIBE v2 engagement scoring, timeline analysis, and predictive metrics |
| ⚡ **Intelligence Engine** | Converts raw neural data into weaknesses, actions, optimized scripts, and winner selection |
| 🎵 **Audio Generation** | Gemini script writing + ElevenLabs text-to-speech |
| 🔍 **Semantic Search** | Turbopuffer-powered creative memory with vector search |
| 📊 **Variant Comparison** | Rank multiple variants by engagement, recall, and emotional strength |
| 🌑 **Premium UI** | Dark glassmorphic interface with Framer Motion animations |

## Quick Start

**Prerequisites:** Node.js 20+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Then set your keys in .env.local:
#   GEMINI_API_KEY    — Required for AI features
#   ELEVENLABS_API_KEY — Optional for TTS audio generation
#   TURBOPUFFER_API_KEY — Optional for semantic memory
#   HF_TOKEN          — Optional for authenticated TRIBE v2 access

# 3. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Express    │────▶│   TRIBE v2   │
│  React + TW  │◀────│   Backend    │◀────│   (Gradio)   │
└─────────────┘     │              │     └──────────────┘
                    │   Endpoints  │
                    │  /generate   │────▶ Gemini 3.0 Flash
                    │  /analyze    │────▶ ElevenLabs TTS
                    │  /ingest     │────▶ Turbopuffer
                    └──────────────┘
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/generate-variants` | Generate AI audio variant (script + TTS) |
| `POST` | `/api/projects/ingest` | Ingest creative files into vector memory |
| `POST` | `/api/analyze-neural` | Analyze scripts via TRIBE v2 + Gemini interpretation |
| `POST` | `/api/analyze-audio-neural` | Analyze audio files via TRIBE v2 |

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Backend:** Express, tsx
- **AI:** Google Gemini 3.0 Flash, ElevenLabs
- **Neural:** TRIBE v2 (Gradio via @gradio/client)
- **Memory:** Turbopuffer (vector DB), Dexie (IndexedDB)

## License

Private — all rights reserved.
