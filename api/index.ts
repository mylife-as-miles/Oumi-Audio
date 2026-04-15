import express from "express";
import multer from "multer";
import { Turbopuffer } from "@turbopuffer/turbopuffer";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "elevenlabs";
// @ts-ignore
import pdfParse from "pdf-parse";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

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

export default app;
