import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import officeParser from "officeparser";

import { ImageAnnotatorClient } from "@google-cloud/vision";

// ─── Google Vision (singleton, lazy-initialized) ──────────────────────────────
let _visionClient = null;

function getVisionClient() {
  if (_visionClient) return _visionClient;

  const raw = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_CREDENTIALS_JSON is not set. " +
      "Paste your service account JSON as a single-line string in .env"
    );
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_CREDENTIALS_JSON is not valid JSON — check for stray line breaks");
  }

  _visionClient = new ImageAnnotatorClient({ credentials });
  return _visionClient;
}

// ─── Main extractor ───────────────────────────────────────────────────────────
export default async function extractText(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    let rawText = "";

    // ── DOCX ──────────────────────────────────────────
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value;
    }

    // ── PDF ───────────────────────────────────────────
    else if (ext === ".pdf") {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const pdf  = await pdfjsLib.getDocument({ data }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }

      rawText = text;
    }

    // ── PPTX ──────────────────────────────────────────
    else if (ext === ".pptx") {
      const result = await officeParser.parseOffice(filePath);
      rawText = result.toText();
    }

    // ── IMAGES → Google Vision OCR ────────────────────
    else if ([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"].includes(ext)) {
      rawText = await extractTextFromImage(filePath);
    }

    else {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    return cleanExtractedText(rawText);

  } catch (err) {
    console.error("EXTRACT ERROR:", err);
    throw err;
  }
}

// ─── Google Vision OCR ────────────────────────────────────────────────────────
async function extractTextFromImage(filePath) {
  let client;
  try {
    client = await getVisionClient();
  } catch (err) {
    throw new Error(`Vision API not configured: ${err.message}`);
  }

  // Read file as base64
  const imageBytes = fs.readFileSync(filePath);
  const base64     = imageBytes.toString("base64");
  const mimeType   = getMimeType(filePath);

  const [result] = await client.documentTextDetection({
    image: {
      content: base64
    },
    imageContext: {
      languageHints: ["mk", "en"]  // Macedonian + English
    }
  });

  // documentTextDetection gives the best full-page OCR
  const fullText = result.fullTextAnnotation?.text || "";

  if (!fullText) {
    // Fallback: try TEXT_DETECTION (simpler, works on sparse text)
    const [fallback] = await client.textDetection({
      image: { content: base64 }
    });
    const annotations = fallback.textAnnotations || [];
    return annotations.length > 0 ? annotations[0].description : "";
  }

  return fullText;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".webp": "image/webp",
    ".bmp":  "image/bmp",
    ".tiff": "image/tiff",
  };
  return map[ext] || "image/jpeg";
}

// ─── Text cleaner ─────────────────────────────────────────────────────────────
function cleanExtractedText(text) {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/\b(image|slide|text|paragraph|heading|left|right)\b/gi, "")
    .replace(/Description automatically generated.*$/gim, "")
    .replace(/Sample footer text/gi, "")
    .replace(/\bimage\d+\.(png|jpg|jpeg)\b/gi, "")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 2)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join("\n")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}