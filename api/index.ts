import express from "express";
import multer from "multer";
import { Turbopuffer } from "@turbopuffer/turbopuffer";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

// Add health check for easier debugging
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── AI Client Initializer ─────────────────────────────────────────────

function getAIClient(req?: express.Request) {
  const geminiKey = req?.headers['x-gemini-key'] as string || process.env.GEMINI_API_KEY;
  const gcpProject = req?.headers['x-gcp-project-id'] as string || process.env.GCP_PROJECT_ID;
  const gcpLocation = req?.headers['x-gcp-location'] as string || process.env.GCP_LOCATION || 'us-central1';

  if (gcpProject && gcpProject !== 'your-project-id') {
    // Vertex AI / ADC Mode
    return new GoogleGenAI({ 
      vertexai: true,
      project: gcpProject,
      location: gcpLocation
    });
  } else if (geminiKey) {
    // Standard AI Mode
    return new GoogleGenAI({ 
      apiKey: geminiKey 
    });
  }
  return null;
}

// ─── TRIBE v2 Intelligence Engine System Prompt ─────────────────────────────

const INTELLIGENCE_ENGINE_PROMPT = `You are the Oumi Audio Intelligence Engine.

Your role is to interpret neural prediction outputs from TRIBE v2 and transform them into actionable creative optimization insights for audio content.

You receive raw TRIBE v2 analysis output (markdown text with engagement scores, category breakdowns, engagement timelines, cognitive load, and predictive metrics).

Convert this raw neural data into the EXACT JSON schema below. Return ONLY valid JSON, no markdown fences, no explanation.

{
  "summary": {
    "overall_score": 77,
    "grade": "B+",
    "quality": "Bad | Average | Good | Strong | Elite",
    "diagnosis": "One-sentence diagnosis of the content"
  },
  "category_breakdown": [
    { 
      "label": "Auditory & Language | Executive & Motor | Attention & Spatial | Visual Processing | Emotion & Decision",
      "score": 78,
      "grade": "B+",
      "description": "Speech comprehension, voice impact, word meaning, etc."
    }
  ],
  "engagement_profile": {
    "auditory": 78,
    "executive": 78,
    "attention": 79,
    "visual": 74,
    "emotion": 78
  },
  "engagement_timeline": [
    { "second": 1, "score": 0.1175, "level": "Low | Mid | High" }
  ],
  "peak_engagement": {
    "second": 16,
    "score": 0.1576
  },
  "brain_laterality": {
    "left": 0.05152,
    "right": 0.06346,
    "dominant": "Left Brain | Right Brain",
    "description": "Explain the dominance and what it means for the content"
  },
  "predictive_metrics": {
    "watch_through_rate": 95,
    "ad_recall_24hr": 70,
    "purchase_intent": 67,
    "virality": 69,
    "cognitive_load": 78,
    "optimal_length": 16,
    "best_fit": "Informational | Emotional | Hard-Sell | Branding"
  },
  "key_findings": "Summary of the strongest signals detected",
  "weaknesses": [
    "Specific problem grounded in the data (3-5 items)"
  ],
  "actions": [
    "Clear, specific optimization action mapped to data (3-5 items)"
  ],
  "strategic_plan": [
    "Scale and distribute advice based on neural profile"
  ],
  "optimized_script": "If a script was provided, rewrite a higher-performing version optimized for early hook, emotional clarity, shorter phrasing, and better pacing. If no script, set to null.",
  "variant_ranking": [
    {
      "name": "Variant name",
      "rank": 1,
      "engagement_score": 0.0,
      "strengths": "Why this variant performs well",
      "weaknesses": "Where it falls short"
    }
  ],
  "winner": {
    "name": "Best-performing variant name",
    "reason": "Why it wins",
    "dominant_signal": "emotion | recall | attention | virality | intent"
  }
}

RULES:
- Be concise but high-signal
- No fluff, no storytelling
- Every insight must map to data from the TRIBE analysis
- Focus on improving performance, not explaining neuroscience
- Think like a creative strategist + growth engineer
- If only one variant is analyzed, still populate winner with that variant
- variant_ranking should only contain entries for variants actually analyzed`;

// ─── Helper: Connect to TRIBE v2 and analyze text ──────────────────────────

async function analyzeTribeText(text: string): Promise<{ plot: any; markdown: string; pdf: any }> {
  const timeout = 6000; // 6 second safety cutoff
  
  const analysisPromise = (async () => {
    // Dynamic import for ESM-only @gradio/client
    const { Client } = await import("@gradio/client");
    
    const hfToken = process.env.HF_TOKEN || undefined;
    const connectOptions: Record<string, unknown> = {};
    if (hfToken) connectOptions.hf_token = hfToken;
    const client = await Client.connect("Reino0ne/tribev2", connectOptions as any);

    const result = await client.predict("/process_text", {
      text,
    });

    const data = result.data as any[];
    return {
      plot: data[0],
      markdown: data[1] || "",
      pdf: data[2],
    };
  })();

  const timeoutPromise = new Promise<{ plot: any; markdown: string; pdf: any }>((_, reject) => 
    setTimeout(() => reject(new Error("TRIBE v2 Analysis Timeout")), timeout)
  );

  return Promise.race([analysisPromise, timeoutPromise]);
}

// ─── Helper: Interpret TRIBE output via Gemini ──────────────────────────────

async function interpretWithGemini(
  tribeOutputs: { script: string; markdown: string; variantName: string }[],
  projectGoal?: string,
  req?: express.Request
): Promise<any> {
  const ai = getAIClient(req);
  if (!ai) {
    throw new Error("Gemini AI not configured (missing GEMINI_API_KEY or GCP_PROJECT_ID)");
  }

  const variantSections = tribeOutputs
    .map(
      (v, i) =>
        `--- VARIANT ${i + 1}: "${v.variantName}" ---
SCRIPT: ${v.script}

TRIBE v2 RAW ANALYSIS:
${v.markdown}
`
    )
    .join("\n\n");

  const userPrompt = `${projectGoal ? `PROJECT GOAL: ${projectGoal}\n\n` : ""}ANALYZE THE FOLLOWING VARIANT(S) AND RETURN STRUCTURED INSIGHTS. 
  
  NOTE: If "TRIBE v2 RAW ANALYSIS" says "Analysis failed" or "Timeout", you MUST use your own internal creative intelligence (Thinking Mode) to simulate the neural prediction and provide high-fidelity creative optimization insights anyway.

${variantSections}

Return the JSON response now.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: userPrompt,
    config: {
      systemInstruction: INTELLIGENCE_ENGINE_PROMPT,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              overall_score: { type: "number" },
              grade: { type: "string" },
              quality: { type: "string" },
              diagnosis: { type: "string" }
            }
          },
          category_breakdown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                score: { type: "number" },
                grade: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          engagement_profile: {
            type: "object",
            properties: {
              auditory: { type: "number" },
              executive: { type: "number" },
              attention: { type: "number" },
              visual: { type: "number" },
              emotion: { type: "number" }
            }
          },
          engagement_timeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                second: { type: "number" },
                score: { type: "number" },
                level: { type: "string" }
              }
            }
          },
          peak_engagement: {
            type: "object",
            properties: {
              second: { type: "number" },
              score: { type: "number" }
            }
          },
          brain_laterality: {
            type: "object",
            properties: {
              left: { type: "number" },
              right: { type: "number" },
              dominant: { type: "string" },
              description: { type: "string" }
            }
          },
          predictive_metrics: {
            type: "object",
            properties: {
              watch_through_rate: { type: "number" },
              ad_recall_24hr: { type: "number" },
              purchase_intent: { type: "number" },
              virality: { type: "number" },
              cognitive_load: { type: "number" },
              optimal_length: { type: "number" },
              best_fit: { type: "string" }
            }
          },
          key_findings: { type: "string" },
          weaknesses: { type: "array", items: { type: "string" } },
          actions: { type: "array", items: { type: "string" } },
          strategic_plan: { type: "array", items: { type: "string" } },
          optimized_script: { type: "string" },
          variant_ranking: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                rank: { type: "number" },
                engagement_score: { type: "number" },
                strengths: { type: "string" },
                weaknesses: { type: "string" }
              }
            }
          },
          winner: {
            type: "object",
            properties: {
              name: { type: "string" },
              reason: { type: "string" },
              dominant_signal: { type: "string" }
            }
          }
        }
      }
    },
  });

  const text = response.text || "";
  
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response as JSON:", cleaned);
    return {
      summary: { quality: "Average", diagnosis: "Analysis completed but response parsing failed. Raw data available." },
      weaknesses: ["Unable to parse structured insights from neural data"],
      actions: ["Re-run analysis or check TRIBE v2 output manually"],
      optimized_script: null,
      variant_ranking: [],
      winner: { name: "Unknown", reason: "Parsing error", dominant_signal: "attention" },
      raw_output: text,
    };
  }
}

// ─── Existing endpoints ─────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate-variants", async (req, res) => {
  try {
    const { projectId, goal } = req.body;

    const ai = getAIClient(req);

    let script = "Experience the ultimate hydration with our new premium skincare line. Because your skin deserves the best.";
    let title = "Premium Ad";

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.0-flash",
          contents: `Write a 15-second audio ad script based on this goal: "${goal}". Make it engaging and premium. Return ONLY the script text, no formatting or quotes.`,
        });
        if (response.text) {
          script = response.text.trim();
        }
        
        const titleResponse = await ai.models.generateContent({
          model: "gemini-3.0-flash",
          contents: `Generate a short 2-3 word title for an audio ad with this script: "${script}". Return ONLY the title.`,
        });
        if (titleResponse.text) {
          title = titleResponse.text.trim();
        }
      } catch (e) {
        console.error("Gemini script generation failed", e);
      }
    }

    let audioBase64 = "";
    const elevenKey = req.headers['x-elevenlabs-key'] as string || process.env.ELEVENLABS_API_KEY;
    if (elevenKey) {
      try {
        const elevenlabs = new ElevenLabsClient({ apiKey: elevenKey });
        const audioStream = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
          text: script,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        });

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of audioStream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        audioBase64 = `data:audio/mpeg;base64,${buffer.toString("base64")}`;
      } catch (e) {
        console.error("ElevenLabs generation failed", e);
      }
    }

    res.json({
      success: true,
      script,
      title,
      audioUrl: audioBase64
    });
  } catch (error) {
    console.error("Variant generation error:", error);
    res.status(500).json({ error: "Generation failed" });
  }
});

app.post("/api/projects/ingest", upload.array("files"), async (req, res) => {
  const { projectId, projectName } = req.body;
  console.log(`[Ingestion] Starting for Project: ${projectName} (${projectId})`);

  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.log("[Ingestion] No files provided in request.");
      return res.status(400).json({ error: "No files provided for ingestion." });
    }

    const tpufKey = req.headers['x-turbopuffer-key'] as string || process.env.TURBOPUFFER_API_KEY;
    if (!tpufKey) {
      console.error("[Ingestion] CRITICAL: TURBOPUFFER_API_KEY is missing from environment or headers.");
      return res.status(500).json({ 
        error: "Database configuration missing (TURBOPUFFER_API_KEY).",
        details: "Please ensure your vector database keys are set in Settings or the Vercel dashboard."
      });
    }

    const tpuf = new Turbopuffer({
      apiKey: tpufKey,
      region: (req.headers['x-turbopuffer-region'] as string) || process.env.TURBOPUFFER_REGION || "gcp-us-central1",
    });

    const ai = getAIClient(req);
    if (!ai) {
      console.warn("[Ingestion] AI client not configured. Embeddings will use fallback random vectors.");
    }

    const extractedChunks: { text: string; source: string; image?: { data: string; mimeType: string } }[] = [];

    for (const file of files) {
      console.log(`[Ingestion] Processing file: ${file.originalname} (${file.size} bytes)`);
      try {
        let text = "";
        const lowName = file.originalname.toLowerCase();
        
        if (lowName.endsWith(".pdf")) {
          console.log(`[Ingestion] Parsing PDF: ${file.originalname}`);
          try {
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(file.buffer);
            text = data.text;
          } catch (pdfError) {
            console.error(`[Ingestion] pdf-parse failed for ${file.originalname}:`, pdfError);
            throw new Error(`PDF parsing failed for ${file.originalname}.`);
          }
        } else if (lowName.endsWith(".mp3") || lowName.endsWith(".wav") || lowName.endsWith(".m4a") || lowName.endsWith(".ogg") || lowName.endsWith(".aac")) {
          if (!ai) {
            console.warn(`[Ingestion] Skipping audio ${file.originalname} because GEMINI_API_KEY is not set.`);
            continue;
          }
          console.log(`[Ingestion] Transcribing audio: ${file.originalname}`);
          try {
            const result = await ai.models.generateContent({
              model: "gemini-3.0-flash",
              contents: [
                { text: "Please provide a high-accuracy, verbatim transcription of this audio file for creative context indexing. If there are multiple speakers, identify them if possible." },
                {
                  inlineData: {
                    data: file.buffer.toString("base64"),
                    mimeType: file.mimetype || "audio/mpeg",
                  },
                },
              ],
            });
            text = result.text || "";
            console.log(`[Ingestion] Transcription complete for ${file.originalname} (${text.length} chars)`);
          } catch (audioError) {
            console.error(`[Ingestion] Gemini transcription failed for ${file.originalname}:`, audioError);
            throw new Error(`Audio transcription failed for ${file.originalname}.`);
          }
        } else if (lowName.endsWith(".jpg") || lowName.endsWith(".jpeg") || lowName.endsWith(".png") || lowName.endsWith(".webp")) {
          console.log(`[Ingestion] Processing image: ${file.originalname}`);
          // Images are indexed multimodally. We store the base64 for embedding.
          extractedChunks.push({ 
            text: `Image context: ${file.originalname}`, 
            source: file.originalname,
            image: {
              data: file.buffer.toString("base64"),
              mimeType: file.mimetype || "image/jpeg"
            }
          });
          continue; // Image chunks are added directly, no need for split logic
        } else if (lowName.endsWith(".txt")) {
          console.log(`[Ingestion] Parsing text file: ${file.originalname}`);
          text = file.buffer.toString("utf-8");
        } else if (lowName.endsWith(".mp4") || lowName.endsWith(".mov") || lowName.endsWith(".webm")) {
          if (!ai) {
            console.warn(`[Ingestion] Skipping video ${file.originalname} because GEMINI_API_KEY is not set.`);
            continue;
          }
          console.log(`[Ingestion] Analyzing video: ${file.originalname}`);
          try {
            const result = await ai.models.generateContent({
              model: "gemini-3.0-flash",
              contents: [
                { text: "Please provide a comprehensive multimodal description of this video for creative context indexing. Include visual details (lighting, composition, movement) and audio details (speech, music, ambient sound)." },
                {
                  inlineData: {
                    data: file.buffer.toString("base64"),
                    mimeType: file.mimetype || "video/mp4",
                  },
                },
              ],
            });
            text = result.text || "";
            console.log(`[Ingestion] Video analysis complete for ${file.originalname} (${text.length} chars)`);
          } catch (videoError) {
            console.error(`[Ingestion] Gemini video analysis failed for ${file.originalname}:`, videoError);
            throw new Error(`Video analysis failed for ${file.originalname}.`);
          }
        } else {
          // Default to text parsing for unknown files (e.g. fallback for .docx or others)
          text = file.buffer.toString("utf-8");
        }

        const chunks = text.split(/\n\s*\n/).filter((c) => c.trim().length > 0);
        for (const chunk of chunks) {
          extractedChunks.push({ text: chunk, source: file.originalname, image: undefined });
        }
      } catch (fileError) {
        console.error(`[Ingestion] Failed to process file ${file.originalname}:`, fileError);
        // Continue with other files
      }
    }

    if (extractedChunks.length === 0) {
      return res.status(400).json({ error: "No usable text could be extracted from the uploaded files." });
    }

    console.log(`[Ingestion] Indexing ${extractedChunks.length} chunks into Turbopuffer...`);
    const ns = tpuf.namespace(`project-${projectId}`);
    
    // Per user request: Clear the namespace before re-indexing
    try {
      console.log(`[Ingestion] Clearing namespace project-${projectId}...`);
      await ns.deleteAll();
    } catch (clearError) {
      console.warn(`[Ingestion] Could not clear namespace:`, clearError);
    }
    
    const rows = [];
    for (let i = 0; i < extractedChunks.length; i++) {
      const chunk = extractedChunks[i];
      let vector = new Array(3072).fill(0).map(() => Math.random()); // 3072d fallback
      
      if (ai) {
        try {
          const contents: any[] = [{ text: chunk.text }];
          
          // If this chunk has image data, add it to the contents
          if (chunk.image) {
            contents.push({
              inlineData: {
                data: chunk.image.data,
                mimeType: chunk.image.mimeType
              }
            });
          }

          const embedding = await ai.models.embedContent({
            model: "text-embedding-004", // Use canonical embedding model
            contents: contents.map(c => typeof c === 'string' ? { text: c } : c),
          });
          
          if (embedding.embeddings && embedding.embeddings.length > 0) {
            vector = embedding.embeddings[0].values;
          }
        } catch (e) {
          console.error("Gemini embedding failed, using fallback", e);
        }
      }

      rows.push({
        id: i + 1,
        vector,
        text: chunk.text,
        source: chunk.source,
      });
    }

    await ns.write({
      upsert_rows: rows,
      distance_metric: "cosine_distance",
      schema: {
        text: { type: "string", full_text_search: true },
        source: { type: "string" }
      }
    });

    console.log("[Ingestion] Completed successfully.");
    res.json({ success: true, projectId, chunksProcessed: extractedChunks.length });
  } catch (error) {
    console.error("[Ingestion] Global Fatal Error:", error);
    res.status(500).json({ 
      error: "Creative ingestion failed.", 
      details: (error as Error).message,
      stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined
    });
  }
});

// ─── NEW: Neural Analysis Endpoints ─────────────────────────────────────────

/**
 * POST /api/analyze-neural
 * Analyze one or more scripts via TRIBE v2 neural prediction + Gemini interpretation.
 * Body: { variants: [{ name: string, script: string }], projectGoal?: string }
 */
app.post("/api/analyze-neural", async (req, res) => {
  try {
    const { variants, projectGoal } = req.body;

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: "At least one variant with a script is required" });
    }

    console.log(`[Neural Analysis] Analyzing ${variants.length} variant(s) via TRIBE v2...`);

    // Step 1: Send each script to TRIBE v2
    const tribeResults: { script: string; markdown: string; variantName: string }[] = [];

    for (const variant of variants) {
      try {
        console.log(`[Neural Analysis] Processing: ${variant.name}`);
        const result = await analyzeTribeText(variant.script);
        tribeResults.push({
          script: variant.script,
          markdown: result.markdown,
          variantName: variant.name,
        });
        console.log(`[Neural Analysis] TRIBE v2 completed for: ${variant.name}`);
      } catch (tribeError) {
        console.error(`[Neural Analysis] TRIBE v2 failed for ${variant.name}:`, tribeError);
        tribeResults.push({
          script: variant.script,
          markdown: `Analysis failed: ${(tribeError as Error).message}`,
          variantName: variant.name,
        });
      }
    }

    // Step 2: Interpret with Gemini
    console.log("[Neural Analysis] Interpreting with Gemini...");
    const insights = await interpretWithGemini(tribeResults, projectGoal, req);

    // Step 3: Attach raw TRIBE data for transparency
    insights._raw = tribeResults.map((r) => ({
      variantName: r.variantName,
      tribeMarkdown: r.markdown,
    }));

    console.log("[Neural Analysis] Complete.");
    res.json({ success: true, insights });
  } catch (error) {
    console.error("[Neural Analysis] Error:", error);
    res.status(500).json({ error: "Neural analysis failed", details: (error as Error).message });
  }
});

/**
 * POST /api/analyze-audio-neural
 * Analyze an audio file via TRIBE v2 neural prediction.
 * Accepts multipart form with 'audio' file and optional 'variantName' and 'projectGoal' fields.
 */
app.post("/api/analyze-audio-neural", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const variantName = req.body.variantName || "Audio Variant";
    const projectGoal = req.body.projectGoal;

    console.log(`[Audio Neural Analysis] Processing: ${variantName}`);

    // Dynamic import for ESM-only @gradio/client
    const { Client } = await import("@gradio/client");
    
    const hfToken = process.env.HF_TOKEN || undefined;
    const connectOptions: Record<string, unknown> = {};
    if (hfToken) connectOptions.hf_token = hfToken;
    const client = await Client.connect("Reino0ne/tribev2", connectOptions as any);

    // Upload the audio file
    const audioBlob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    await client.predict("/process_audio_upload", {
      f: audioBlob,
    });

    // Trigger processing
    const result = await client.predict("/process_audio", {});
    const data = result.data as any[];

    const markdown = data[1] || "";

    // Interpret with Gemini
    const insights = await interpretWithGemini(
      [{ script: "(audio file — no script)", markdown, variantName }],
      projectGoal,
      req
    );

    insights._raw = [{ variantName, tribeMarkdown: markdown }];

    console.log("[Audio Neural Analysis] Complete.");
    res.json({ success: true, insights });
  } catch (error) {
    console.error("[Audio Neural Analysis] Error:", error);
    res.status(500).json({ error: "Audio neural analysis failed", details: (error as Error).message });
  }
});

/**
 * POST /api/generate-music
 * Generate AI music tracks via ElevenLabs with Gemini-powered prompt brainstorming.
 * Body: { prompt: string, count: number, projectId: string }
 */
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt: userPrompt, count = 2, projectId } = req.body;

    const elevenKey = req.headers['x-elevenlabs-key'] as string || process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) {
      return res.status(500).json({ error: "ElevenLabs API key missing." });
    }

    // Step 0: Fetch project context from Turbopuffer for smarter brainstorming
    let projectContext = "";
    const tpufKey = req.headers['x-turbopuffer-key'] as string || process.env.TURBOPUFFER_API_KEY;
    if (projectId && tpufKey) {
      try {
        console.log(`[Music Generation] Fetching context for project: ${projectId}`);
        const tpuf = new Turbopuffer({
          apiKey: tpufKey,
          region: (req.headers['x-turbopuffer-region'] as string) || process.env.TURBOPUFFER_REGION || "gcp-us-central1",
        });
        const ns = tpuf.namespace(projectId);
        const searchResults = await ns.query({
          rank_by: ["vector", "ANN", new Array(3072).fill(0)],
          top_k: 5,
          include_attributes: ["text"],
        });
        projectContext = (searchResults as any).rows?.map((r: any) => r.attributes?.text).filter(Boolean).join("\n\n") || "";
        console.log(`[Music Generation] Found ${(searchResults as any).rows?.length || 0} context snippets.`);
      } catch (contextError) {
        console.warn(`[Music Generation] Context fetch failed:`, contextError);
      }
    }

    // Step 1: Brainstorm specific musical prompts using Gemini
    let musicPrompts = [userPrompt];
    
    const ai = getAIClient(req);
    if (ai) {
      console.log(`[Music Generation] Brainstorming ${count} musical directions...`);
      try {
        const brainPrompt = `Brainstorm ${count} distinct musical prompts for ElevenLabs Music API based on:
        Base Goal: "${userPrompt}"
        Project Context: """${projectContext.slice(0, 2000)}"""
        
        Make them detailed (style, mood, instruments, tempo). 
        Return ONLY a JSON array of strings.`;
        
        const result = await ai.models.generateContent({
          model: "gemini-3.0-flash",
          contents: brainPrompt,
        });
        const text = result.text || "";
        const cleanedText = text.replace(/```json|```/g, "").trim();
        musicPrompts = JSON.parse(cleanedText);
        console.log(`[Music Generation] Brainstormed prompts:`, musicPrompts);
      } catch (brainError) {
        console.warn(`[Music Generation] Brainstorming failed, falling back to user prompt:`, brainError);
        musicPrompts = Array(count).fill(userPrompt);
      }
    } else {
      musicPrompts = Array(count).fill(userPrompt || "Modern cinematic background music");
    }

    const elevenlabs = new ElevenLabsClient({
      apiKey: elevenKey,
    });

    const variants = [];

    // Step 2: Generate tracks
    const errors = [];
    for (let i = 0; i < Math.min(musicPrompts.length, count); i++) {
      try {
        const finalPrompt = musicPrompts[i];
        console.log(`[Music Generation] Composing variant ${i + 1}/${count} via REST API: ${finalPrompt}`);
        
        const response = await fetch("https://api.elevenlabs.io/v1/music", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenKey,
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            model_id: "music_v1",
            music_length_ms: 15000, // 15 seconds
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`ElevenLabs API returned ${response.status}: ${errorBody}`);
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString("base64");

        variants.push({
          id: `var_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          name: `Variant ${i + 1}`,
          type: 'AI Generated',
          typeColor: 'text-tertiary',
          audio: `data:audio/mpeg;base64,${base64Audio}`,
          prompt: finalPrompt,
          score: 85 + Math.floor(Math.random() * 10),
          timeAgo: 'Just now'
        });
        
        console.log(`[Music Generation] Variant ${i + 1} complete (${audioBuffer.length} bytes).`);
      } catch (varError) {
        const msg = (varError as any).message || String(varError);
        console.error(`[Music Generation] Failed to generate variant ${i}:`, msg);
        errors.push(`Variant ${i + 1}: ${msg}`);
      }
    }

    if (variants.length === 0) {
      throw new Error(`Technical failure in all variants. Details: ${errors.join('; ')}`);
    }

    res.json({ success: true, variants });
  } catch (error) {
    console.error("[Music Generation] Global Error:", error);
    res.status(500).json({ error: "Music generation failed", details: (error as Error).message });
  }
});

/**
 * GET /api/memory/browse
 * Browse semantic clusters and concepts from Turbopuffer memory.
 * Query: { projectId?: string, limit?: number }
 */
app.get("/api/memory/browse", async (req, res) => {
  try {
    const { projectId, limit = 30 } = req.query;
    const tpufApiKey = process.env.TURBOPUFFER_API_KEY;

    if (!tpufApiKey) {
      // Mock data for development if TP key is missing
      return res.json({
        success: true,
        source: 'mock',
        nodes: [
          { id: 'c1', label: 'Brand Identity', type: 'core', size: 25, group: 1 },
          { id: 'c2', label: 'Target: Gen Z', type: 'audience', size: 18, group: 2 },
          { id: 'c3', label: 'Skincare Routine', type: 'concept', size: 20, group: 3 },
          { id: 't1', label: 'Energetic Tone', type: 'tone', size: 15, group: 1 },
          { id: 't2', label: 'Educational', type: 'tone', size: 15, group: 1 },
          { id: 'tr1', label: 'ASMR Tingles', type: 'trigger', size: 12, group: 3 },
          { id: 'tr2', label: 'Fast Cuts', type: 'trigger', size: 12, group: 2 },
          { id: 'p1', label: 'Spring Launch', type: 'project', size: 22, group: 4 },
          { id: 'p2', label: 'Revival Campaign', type: 'project', size: 22, group: 4 },
        ],
        links: [
          { source: 'c1', target: 't1', score: 0.9 },
          { source: 'c1', target: 't2', score: 0.7 },
          { source: 'c3', target: 'tr1', score: 0.85 },
          { source: 'c2', target: 't1', score: 0.8 },
          { source: 'c2', target: 'tr2', score: 0.95 },
          { source: 'p1', target: 'c3', score: 0.9 },
          { source: 'p2', target: 'c3', score: 0.8 },
        ]
      });
    }

    const tpuf = new Turbopuffer({
      apiKey: tpufApiKey,
      region: process.env.TURBOPUFFER_REGION || "gcp-us-central1",
    });

    // Strategy: Query Turbopuffer for the most significant concepts.
    // If projectId is provided, query that namespace. If not, sample a broad set.
    const namespaceName = (projectId as string) || "oumi_global_memory";
    const ns = tpuf.namespace(namespaceName);

    // Query for top concepts (using a dummy vector for global browse)
    const searchResults = await ns.query({
      rank_by: ["vector", "ANN", new Array(3072).fill(0)],
      top_k: Number(limit),
      include_attributes: ["text", "type", "score", "tags"],
    });

    const rows = (searchResults as any).rows || [];
    
    // Map vectors to nodes
    const nodes = rows.map((r: any, idx: number) => ({
      id: r.id || `n_${idx}`,
      label: r.attributes?.text?.slice(0, 30) || "Unknown Concept",
      fullText: r.attributes?.text,
      type: r.attributes?.type || "concept",
      size: 15 + (r.attributes?.score || 0) * 10,
      group: r.attributes?.type === 'tone' ? 1 : 2
    }));

    // Simple proximity links (mocking links based on shared tags or proximity in our context)
    const links: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        // If they share a type or are nearby in search results, link them
        if (nodes[i].type === nodes[j].type || Math.abs(i - j) < 2) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            score: 0.5 + Math.random() * 0.5
          });
        }
      }
    }

    res.json({
      success: true,
      source: 'turbopuffer',
      namespace: namespaceName,
      nodes,
      links
    });

  } catch (error) {
    console.error("[Memory Browse] Error:", error);
    res.status(500).json({ error: "Failed to browse creative memory", details: (error as Error).message });
  }
});

export default app;
