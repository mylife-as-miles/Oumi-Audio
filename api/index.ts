import express from "express";
import multer from "multer";
import { Turbopuffer } from "@turbopuffer/turbopuffer";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// ─── TRIBE v2 Intelligence Engine System Prompt ─────────────────────────────

const INTELLIGENCE_ENGINE_PROMPT = `You are the Oumi Audio Intelligence Engine.

Your role is to interpret neural prediction outputs from TRIBE v2 and transform them into actionable creative optimization insights for audio content.

You receive raw TRIBE v2 analysis output (markdown text with engagement scores, category breakdowns, engagement timelines, cognitive load, and predictive metrics).

Convert this raw neural data into the EXACT JSON schema below. Return ONLY valid JSON, no markdown fences, no explanation.

{
  "summary": {
    "quality": "Bad | Average | Good | Strong | Elite",
    "diagnosis": "One-sentence diagnosis of the content"
  },
  "weaknesses": [
    "Specific problem grounded in the data (3-5 items)"
  ],
  "actions": [
    "Clear, specific optimization action mapped to data (3-5 items)"
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
}

// ─── Helper: Interpret TRIBE output via Gemini ──────────────────────────────

async function interpretWithGemini(
  tribeOutputs: { script: string; markdown: string; variantName: string }[],
  projectGoal?: string
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

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

  const userPrompt = `${projectGoal ? `PROJECT GOAL: ${projectGoal}\n\n` : ""}ANALYZE THE FOLLOWING VARIANT(S) AND RETURN STRUCTURED INSIGHTS:

${variantSections}

Return the JSON response now.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.0-flash",
    contents: userPrompt,
    config: {
      systemInstruction: INTELLIGENCE_ENGINE_PROMPT,
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

    let ai: GoogleGenAI | null = null;
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

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
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
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
  try {
    const { projectId, projectName, campaignType, goal } = req.body;
    const files = req.files as Express.Multer.File[];

    const tpuf = new Turbopuffer({
      apiKey: process.env.TURBOPUFFER_API_KEY || "mock-key",
    });

    let ai: GoogleGenAI | null = null;
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    const extractedChunks: { text: string; source: string }[] = [];

    for (const file of files) {
      // Extract text
      let text = "";
      if (file.originalname.endsWith(".pdf")) {
        const data = await pdfParse(file.buffer);
        text = data.text;
      } else {
        text = file.buffer.toString("utf-8");
      }

      // Chunk text (simple chunking by paragraphs)
      const chunks = text.split(/\n\s*\n/).filter((c) => c.trim().length > 0);
      for (const chunk of chunks) {
        extractedChunks.push({ text: chunk, source: file.originalname });
      }
    }

    // Write to turbopuffer
    if (extractedChunks.length > 0 && process.env.TURBOPUFFER_API_KEY) {
      const ns = tpuf.namespace(`project-${projectId}`);
      
      const rows = [];
      for (let i = 0; i < extractedChunks.length; i++) {
        const chunk = extractedChunks[i];
        let vector = [Math.random(), Math.random()]; // fallback
        
        if (ai) {
          try {
            const embedding = await ai.models.embedContent({
              model: "text-embedding-004",
              contents: chunk.text,
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
          text: {
            type: "string",
            full_text_search: true,
          },
          source: {
            type: "string",
          }
        }
      });
    }

    res.json({ success: true, projectId, chunksProcessed: extractedChunks.length });
  } catch (error) {
    console.error("Ingestion error:", error);
    res.status(500).json({ error: "Ingestion failed" });
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
    const insights = await interpretWithGemini(tribeResults, projectGoal);

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
    const audioBlob = new Blob([file.buffer], { type: file.mimetype });
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
      projectGoal
    );

    insights._raw = [{ variantName, tribeMarkdown: markdown }];

    console.log("[Audio Neural Analysis] Complete.");
    res.json({ success: true, insights });
  } catch (error) {
    console.error("[Audio Neural Analysis] Error:", error);
    res.status(500).json({ error: "Audio neural analysis failed", details: (error as Error).message });
  }
});

export default app;
