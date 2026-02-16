import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.OPENAI_API_KEY;
console.log("OPENAI_API_KEY loaded:", !!KEY, KEY ? `(starts with ${KEY.slice(0, 8)}...)` : "(MISSING)");

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: KEY });

// GPT-4o-mini has a 128k token context window.
// 1 token ≈ 4 chars, so ~400k chars is safe. We truncate large inputs.
const MAX_TEXT_CHARS = 80_000;

export default async function generateQuiz(req, res) {
  try {
    const { text, questionCount = 10, difficulty = "medium" } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY is not set in the backend .env file"
      });
    }

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "No text provided"
      });
    }

    if (text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: `Text too short (${text.trim().length} chars). Minimum is 50 characters.`
      });
    }

    // ── Truncate if needed ────────────────────────────────────
    const safeText = text.length > MAX_TEXT_CHARS
      ? text.slice(0, MAX_TEXT_CHARS) + "\n\n[Текстот е скратен поради должина]"
      : text;

    const difficultyLabel = {
      easy:   "лесни (основни факти и дефиниции)",
      medium: "средно тешки (разбирање и примена)",
      hard:   "тешки (анализа, споредба, заклучување)"
    }[difficulty] || "средно тешки";

    const prompt = `
Од следниот наставен текст креирај квиз со точно ${questionCount} прашања.
Прашањата треба да бидат ${difficultyLabel}.

Врати САМО валиден JSON во форматот подолу, без никаков дополнителен текст.

{
  "title": "Ime na kviz",
  "questions": [
    {
      "question": "Прашање",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }
  ]
}

Текст:
${safeText}
`;

    console.log(`Generating quiz: ${questionCount} questions, difficulty=${difficulty}, text=${safeText.length} chars`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const raw = completion.choices[0].message.content;
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse failed. Raw response:", raw);
      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON",
        raw: raw.slice(0, 300)   // send first 300 chars for debugging
      });
    }

    if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: "AI returned a quiz with no questions"
      });
    }

    console.log(`Quiz generated: "${quiz.title}" with ${quiz.questions.length} questions`);

    res.json({ success: true, quiz });

  } catch (err) {
    // Send the REAL error message back so it's visible in the frontend
    console.error("GENERATE QUIZ ERROR:", err);

    const message =
      err?.error?.message ||          // OpenAI API error message
      err?.message ||                 // JS error message
      "Unknown error";

    res.status(500).json({
      success: false,
      error: message,
      code: err?.status || err?.code || null
    });
  }
}