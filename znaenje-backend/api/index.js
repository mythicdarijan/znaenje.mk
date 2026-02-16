import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import upload from "./upload.js";
import extractText from "./extract-text.js";
import generateQuiz from "./generate-quiz.js";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow any Render subdomain + localhost for dev
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      /\.onrender\.com$/,          // any render.com subdomain
      /^http:\/\/localhost/,       // local dev
      /^http:\/\/127\.0\.0\.1/,   // local dev alt
    ]
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowed.some(re => re.test(origin))) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json({ limit: "50mb" }))

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.json({ status: "Backend running ✓" })
})

app.post("/api/test", (req, res) => {
  res.json({ success: true })
})

/* === SINGLE FILE: FILE → TEXT === */

app.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })
    const text = await extractText(req.file.path)
    res.json({ success: true, text })
  } catch (err) {
    console.error("EXTRACT API ERROR:", err)
    res.status(500).json({ error: "Failed to extract text", detail: err.message })
  }
})

/* === MULTI FILE: FILES → COMBINED TEXT === */

app.post("/api/extract-text-multi", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const results = await Promise.allSettled(
      req.files.map(async (file) => {
        const text = await extractText(file.path)
        try { fs.unlinkSync(file.path) } catch {}
        return { name: file.originalname, size: file.size, text, chars: text.length }
      })
    )

    const files = results.map((r, i) => {
      if (r.status === "fulfilled") {
        return { name: r.value.name, size: r.value.size, chars: r.value.chars, success: true }
      } else {
        return { name: req.files[i].originalname, success: false, error: r.reason?.message || "Failed" }
      }
    })

    const combinedText = results
      .filter(r => r.status === "fulfilled")
      .map(r => `\n\n===== ${r.value.name} =====\n\n${r.value.text}`)
      .join("\n\n")

    if (!combinedText.trim()) {
      return res.status(400).json({ success: false, error: "No text could be extracted from any file", files })
    }

    const successCount = files.filter(f => f.success).length

    res.json({ success: true, combinedText, totalChars: combinedText.length, successCount, totalCount: req.files.length, files })

  } catch (err) {
    console.error("EXTRACT MULTI ERROR:", err)
    res.status(500).json({ error: "Multi-file extraction failed", detail: err.message })
  }
})

/* === TEXT → QUIZ === */

app.post("/api/generate-quiz", generateQuiz)

/* ---------------- SERVER ---------------- */

// Render assigns PORT dynamically — never hardcode 3001 in production
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})