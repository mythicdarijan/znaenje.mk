import { useState } from "react"

function QuizGenerator({ text, onQuizGenerated, questionCount = 10, difficulty = "medium" }) {
  const [loading, setLoading] = useState(false)

  const generateQuiz = async () => {
    if (!text) return
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3001/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, questionCount, difficulty })
      })

      const data = await res.json()

      if (!data.success) {
        alert("Неуспешно генерирање квиз")
        return
      }

      onQuizGenerated(data.quiz)
    } catch {
      alert("Грешка при поврзување со серверот")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        className="btn-primary"
        onClick={generateQuiz}
        disabled={!text || loading}
      >
        {loading ? "⏳ Се генерира..." : "🧠 Генерирај квиз"}
      </button>

      {!text && (
        <p style={{ marginTop: "0.75rem", opacity: 0.5, fontSize: "0.85rem" }}>
          Прво прикачи материјал за да генерираш квиз.
        </p>
      )}
    </div>
  )
}

export default QuizGenerator