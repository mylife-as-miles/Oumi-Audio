import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { Turbopuffer } from "@turbopuffer/turbopuffer";
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import pdfParse from "pdf-parse";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
          const dataBuffer = fs.readFileSync(file.path);
          const data = await pdfParse(dataBuffer);
          text = data.text;
        } else {
          text = fs.readFileSync(file.path, "utf-8");
        }

        // Chunk text (simple chunking by paragraphs)
        const chunks = text.split(/\n\s*\n/).filter((c) => c.trim().length > 0);
        for (const chunk of chunks) {
          extractedChunks.push({ text: chunk, source: file.originalname });
        }

        // Clean up temp file
        fs.unlinkSync(file.path);
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
