import { useState } from "react"
import UploadMaterial from "../components/UploadMaterial"
import QuizGenerator from "../components/QuizGenerator"
import QuizPlayer from "../components/QuizPlayer"
import QuizHistory from "../components/QuizHistory"

function QuizApp() {
  const [text, setText] = useState("")
  const [quiz, setQuiz] = useState(null)

  return (
    <div className="app-shell page">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">Znaenje.mk</div>

        <div className="nav-item active">📊 Dashboard</div>
        <div className="nav-item">🧠 Нов квиз</div>
        <div className="nav-item">📚 Историја</div>
      </aside>

      {/* MAIN */}
      <div>

        {/* TOPBAR */}
        <div className="topbar">
          <strong>AI Learning Dashboard</strong>
          <div className="user-chip">👤 Student</div>
        </div>

        {/* CONTENT */}
        <main style={{ padding: "32px" }}>

          <div style={{ marginBottom: 24 }}>
            <h2>Контролен панел</h2>
            <p style={{ color: "#9ca3af" }}>
              Прикачи материјал и добиј интелигентен квиз
            </p>
          </div>

          {/* TOP GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            <div className="card">
              <h4>1. Прикачи материјал</h4>
              <UploadMaterial onExtracted={setText} />
            </div>

            <div className="card">
              <h4>2. Генерирај квиз</h4>
              <QuizGenerator text={text} onQuizGenerated={setQuiz} />
            </div>

          </div>

          {quiz && (
            <div className="card" style={{ marginTop: 24 }}>
              <QuizPlayer quiz={quiz} />
            </div>
          )}

          <div className="card" style={{ marginTop: 24 }}>
            <QuizHistory />
          </div>

        </main>

        {/* FOOTER */}
        <footer className="footer">
          © 2026 Znaenje.mk — AI Learning Platform
        </footer>

      </div>
    </div>
  )
}

export default QuizApp