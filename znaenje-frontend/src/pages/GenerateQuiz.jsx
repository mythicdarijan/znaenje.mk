import { useState } from "react"
import PageWrapper from "../layout/PageWrapper"
import MultiUploadZone from "../components/MultiUploadZone"
import QuizPlayer from "../components/QuizPlayer"
import "./generate-quiz.css"

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Материјал", "Поставки", "Генерирање", "Квиз"]
  return (
    <div className="step-bar">
      {steps.map((label, i) => (
        <div key={i} className={`step-item ${step > i ? "done" : ""} ${step === i ? "active" : ""}`}>
          <div className="step-dot">{step > i ? "✓" : i + 1}</div>
          <span className="step-label">{label}</span>
          {i < steps.length - 1 && <div className={`step-line ${step > i ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  )
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ questionCount, setQuestionCount, difficulty, setDifficulty, onGenerate, loading }) {
  const difficulties = [
    { value: "easy",   label: "Лесно",  desc: "Факти и дефиниции",    color: "#22c55e" },
    { value: "medium", label: "Средно", desc: "Разбирање и примена",   color: "#3b82f6" },
    { value: "hard",   label: "Тешко",  desc: "Анализа и заклучување", color: "#ef4444" },
  ]

  return (
    <div className="settings-section">
      <div className="setting-block">
        <label className="setting-label">Број на прашања</label>
        <div className="count-row">
          {[5, 10, 15, 20].map(n => (
            <button
              key={n}
              className={`count-btn ${questionCount === n ? "active" : ""}`}
              onClick={() => setQuestionCount(n)}
            >{n}</button>
          ))}
          <input
            type="number" min="3" max="30"
            value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="count-input"
            placeholder="Друго"
          />
        </div>
      </div>

      <div className="setting-block">
        <label className="setting-label">Тежина</label>
        <div className="difficulty-row">
          {difficulties.map(d => (
            <button
              key={d.value}
              className={`difficulty-btn ${difficulty === d.value ? "active" : ""}`}
              style={difficulty === d.value ? { borderColor: d.color, color: d.color } : {}}
              onClick={() => setDifficulty(d.value)}
            >
              <span className="diff-label">{d.label}</span>
              <span className="diff-desc">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary btn-full btn-generate" onClick={onGenerate} disabled={loading}>
        {loading
          ? <span className="btn-loader"><span className="spinner" />AI генерира квиз…</span>
          : "🧠 Генерирај квиз"}
      </button>
    </div>
  )
}

// ─── Generating Screen ────────────────────────────────────────────────────────
function GeneratingScreen() {
  return (
    <div className="generating-screen">
      <div className="orbit-ring"><div className="orbit-dot" /></div>
      <div className="orbit-ring ring-2"><div className="orbit-dot dot-2" /></div>
      <div className="ai-icon">🧠</div>
      <h3 className="generating-title">AI работи на квизот</h3>
      <p className="generating-step">Генерирање прашања…</p>
      <div className="gen-bar-wrap"><div className="gen-bar-fill" /></div>
    </div>
  )
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onBack }) {
  return (
    <div className="error-banner">
      <div className="error-banner-top">
        <span className="error-banner-icon">⚠️</span>
        <div>
          <p className="error-banner-title">Грешка при генерирање</p>
          <p className="error-banner-msg">{message}</p>
        </div>
      </div>
      <button className="btn-back" onClick={onBack} style={{ marginTop: "1rem" }}>
        ← Обиди се повторно
      </button>
    </div>
  )
}

// ─── Success Banner ───────────────────────────────────────────────────────────
function SuccessBanner({ quiz, fileCount, onRestart }) {
  return (
    <div className="success-banner">
      <div className="success-glow" />
      <div className="success-top">
        <span className="success-icon">✅</span>
        <div>
          <h3 className="success-title">{quiz.title}</h3>
          <p className="success-meta">
            {quiz.questions.length} прашања · од {fileCount} {fileCount === 1 ? "документ" : "документи"}
          </p>
        </div>
        <button className="btn-ghost" onClick={onRestart}>+ Нов квиз</button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function GenerateQuiz() {
  const [step, setStep]               = useState(0)
  const [text, setText]               = useState("")
  const [filesMeta, setFilesMeta]     = useState([])
  const [quiz, setQuiz]               = useState(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty]   = useState("medium")
  const [genLoading, setGenLoading]   = useState(false)
  const [genError, setGenError]       = useState(null)   // ← stores real error message

  const handleExtracted = (combinedText, files, successCount) => {
    setText(combinedText)
    setFilesMeta(files.filter(f => f.success))
    if (successCount > 0) setStep(1)
  }

  const handleGenerate = async () => {
    setStep(2)
    setGenLoading(true)
    setGenError(null)

    try {
      const res  = await fetch("http://localhost:3001/api/generate-quiz", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text, questionCount, difficulty })
      })

      const data = await res.json()

      if (!data.success) {
        // Show the REAL error from the server
        throw new Error(data.error || "Неуспешно генерирање")
      }

      setQuiz(data.quiz)
      setStep(3)

    } catch (err) {
      // Distinguish network errors from server errors
      const msg = err.message === "Failed to fetch"
        ? "Не може да се поврзе со серверот. Дали е стартуван backend-от?"
        : err.message

      setGenError(msg)
      setStep(1)   // go back to settings so user can retry

    } finally {
      setGenLoading(false)
    }
  }

  const handleRestart = () => {
    setText("")
    setFilesMeta([])
    setQuiz(null)
    setGenError(null)
    setStep(0)
  }

  return (
    <PageWrapper>
      <div className="generate-quiz">

        <div className="gq-header">
          <h1 className="gq-title">Генерирај квиз</h1>
          <p className="gq-subtitle">
            Прикачи еден или повеќе документи и добиј паметен квиз за неколку секунди.
          </p>
        </div>

        <StepBar step={step} />

        <div className="gq-panel">

          {/* STEP 0 — Upload */}
          {step === 0 && (
            <div className="panel-body">
              <h2 className="panel-title">📄 Прикачи документи</h2>
              <p className="panel-desc">PDF, DOCX, PPTX или TXT — до 10 фајлови истовремено</p>
              <MultiUploadZone onExtracted={handleExtracted} />
            </div>
          )}

          {/* STEP 1 — Settings */}
          {step === 1 && (
            <div className="panel-body">
              <div className="back-row">
                <button className="btn-back" onClick={() => setStep(0)}>← Назад</button>
                <span className="text-pill">
                  ✅ {filesMeta.length} {filesMeta.length === 1 ? "документ" : "документи"} · {text.length.toLocaleString()} карактери
                </span>
              </div>

              {filesMeta.length > 0 && (
                <div className="source-chips">
                  {filesMeta.map((f, i) => (
                    <span key={i} className="source-chip">{f.name}</span>
                  ))}
                </div>
              )}

              {/* ← Show real error here, right above the settings */}
              {genError && <ErrorBanner message={genError} onBack={() => setGenError(null)} />}

              <h2 className="panel-title" style={{ marginTop: "1.2rem" }}>⚙️ Постави параметри</h2>
              <p className="panel-desc">Прилагоди го квизот на твојот стил на учење.</p>
              <SettingsPanel
                questionCount={questionCount}
                setQuestionCount={setQuestionCount}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onGenerate={handleGenerate}
                loading={genLoading}
              />
            </div>
          )}

          {/* STEP 2 — Generating */}
          {step === 2 && <GeneratingScreen />}

          {/* STEP 3 — Quiz */}
          {step === 3 && quiz && (
            <div className="panel-body">
              <SuccessBanner quiz={quiz} fileCount={filesMeta.length} onRestart={handleRestart} />
              <QuizPlayer quiz={quiz} />
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  )
}

export default GenerateQuiz