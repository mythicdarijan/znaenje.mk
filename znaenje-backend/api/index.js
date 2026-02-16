import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import upload from "./upload.js";
import extractText from "./extract-text.js";
import generateQuiz from "./generate-quiz.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

app.post("/api/test", (req, res) => {
  res.json({ success: true });
});

/* === SINGLE FILE: FILE → TEXT === */

app.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractText(req.file.path);

    res.json({ success: true, text });
  } catch (err) {
    console.error("EXTRACT API ERROR:", err);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

/* === MULTI FILE: FILES → COMBINED TEXT === */

app.post("/api/extract-text-multi", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Process all files in parallel, handle partial failures gracefully
    const results = await Promise.allSettled(
      req.files.map(async (file) => {
        const text = await extractText(file.path);

        // Clean up uploaded file after extraction
        try { fs.unlinkSync(file.path); } catch {}

        return {
          name: file.originalname,
          size: file.size,
          text,
          chars: text.length
        };
      })
    );

    const files = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return { name: r.value.name, size: r.value.size, chars: r.value.chars, success: true };
      } else {
        return { name: req.files[i].originalname, success: false, error: r.reason?.message || "Failed" };
      }
    });

    // Combine text from successful files with a clear separator
    const combinedText = results
      .filter(r => r.status === "fulfilled")
      .map(r => {
        const { name, text } = r.value;
        return `\n\n===== ${name} =====\n\n${text}`;
      })
      .join("\n\n");

    if (!combinedText.trim()) {
      return res.status(400).json({
        success: false,
        error: "No text could be extracted from any file",
        files
      });
    }

    const successCount = files.filter(f => f.success).length;

    res.json({
      success: true,
      combinedText,
      totalChars: combinedText.length,
      successCount,
      totalCount: req.files.length,
      files
    });

  } catch (err) {
    console.error("EXTRACT MULTI ERROR:", err);
    res.status(500).json({ error: "Multi-file extraction failed" });
  }
});

/* === TEXT → QUIZ === */

app.post("/api/generate-quiz", generateQuiz);

/* ---------------- SERVER ---------------- */

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});