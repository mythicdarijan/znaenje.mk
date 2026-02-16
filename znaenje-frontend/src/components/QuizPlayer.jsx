import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { saveQuizResult } from "../utils/storage"
import "./QuizPlayer.css"

const QUIZ_LIMIT = 3

const getTodayKey = () => {
  const t = new Date()
  return `quiz-count-${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`
}

const getGrade = (pct) => {
  if (pct >= 81) return 5
  if (pct >= 61) return 4
  if (pct >= 41) return 3
  if (pct >= 21) return 2
  return 1
}

const getScoreLabel = (pct) => {
  if (pct >= 81) return { text: "Одличен!",     color: "#22c55e", emoji: "🏆" }
  if (pct >= 61) return { text: "Многу добар",  color: "#3b82f6", emoji: "🎯" }
  if (pct >= 41) return { text: "Добар",         color: "#facc15", emoji: "📚" }
  if (pct >= 21) return { text: "Задоволителен", color: "#f97316", emoji: "💪" }
  return           { text: "Недоволен",          color: "#ef4444", emoji: "📖" }
}

// ─── Option button ────────────────────────────────────────────────────────────
function OptionBtn({ label, text, selected, correct, revealed, onClick }) {
  let cls = "qp-option"
  if (revealed) {
    if (correct)           cls += " qp-option--correct"
    else if (selected)     cls += " qp-option--wrong"
    else                   cls += " qp-option--dim"
  } else if (selected)     cls += " qp-option--selected"

  return (
    <motion.button
      className={cls}
      onClick={onClick}
      disabled={revealed}
      whileHover={!revealed ? { scale: 1.015, x: 4 } : {}}
      whileTap={!revealed ? { scale: 0.98 } : {}}
      layout
    >
      <span className="qp-option-label">{label}</span>
      <span className="qp-option-text">{text}</span>
      {revealed && correct  && <span className="qp-option-icon">✓</span>}
      {revealed && selected && !correct && <span className="qp-option-icon">✕</span>}
    </motion.button>
  )
}

// ─── Results screen ───────────────────────────────────────────────────────────
function ResultsScreen({ quiz, answers, onRestart }) {
  const total   = quiz.questions.length
  const correct = quiz.questions.filter((q, i) => answers[i] === q.correctIndex).length
  const pct     = Math.round((correct / total) * 100)
  const grade   = getGrade(pct)
  const label   = getScoreLabel(pct)
  const circ    = 2 * Math.PI * 45
  const offset  = circ - (pct / 100) * circ

  return (
    <motion.div
      className="qp-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ring */}
      <div className="qp-results-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="45"
            fill="none"
            stroke={label.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div className="qp-results-ring-inner">
          <span className="qp-results-emoji">{label.emoji}</span>
          <span className="qp-results-pct" style={{ color: label.color }}>{pct}%</span>
        </div>
      </div>

      <div className="qp-results-body">
        <h2 className="qp-results-label" style={{ color: label.color }}>{label.text}</h2>
        <p className="qp-results-sub">{correct} / {total} точни одговори</p>

        {/* Grade badge */}
        <div className="qp-grade-badge" style={{ borderColor: label.color, color: label.color }}>
          <span className="qp-grade-num">{grade}</span>
          <span className="qp-grade-text">Оценка</span>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="qp-breakdown">
        <p className="qp-breakdown-title">Детален преглед</p>
        {quiz.questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctIndex
          return (
            <motion.div
              key={i}
              className={`qp-breakdown-row ${isCorrect ? "correct" : "wrong"}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              <span className="qp-breakdown-icon">{isCorrect ? "✓" : "✕"}</span>
              <div className="qp-breakdown-info">
                <p className="qp-breakdown-q">{q.question}</p>
                {!isCorrect && (
                  <p className="qp-breakdown-ans">
                    Точен: <strong>{q.options[q.correctIndex]}</strong>
                    {answers[i] !== undefined && (
                      <> · Твој: <span className="wrong-ans">{q.options[answers[i]]}</span></>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <button className="qp-restart-btn" onClick={onRestart}>
        ↺ Нов квиз
      </button>
    </motion.div>
  )
}

// ─── Main QuizPlayer ──────────────────────────────────────────────────────────
function QuizPlayer({ quiz }) {
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState({})
  const [selected, setSelected] = useState(null)   // selected option for current q
  const [revealed, setRevealed] = useState(false)  // answer revealed for current q
  const [finished, setFinished] = useState(false)
  const [direction, setDirection] = useState(1)

  const todayKey    = getTodayKey()
  const playedToday = Number(localStorage.getItem(todayKey)) || 0
  const limitReached = playedToday >= QUIZ_LIMIT

  if (!quiz || !quiz.questions) return null

  if (limitReached) {
    return (
      <div className="qp-limit-screen">
        <div className="qp-limit-icon">⛔</div>
        <h3>Дневен лимит достигнат</h3>
        <p>Може да решаваш максимум {QUIZ_LIMIT} квизови на ден.<br />Обиди се повторно утре.</p>
      </div>
    )
  }

  const q     = quiz.questions[current]
  const total = quiz.questions.length
  const pct   = Math.round(((current) / total) * 100)

  const LABELS = ["A", "B", "C", "D", "E"]

  const handleSelect = (oi) => {
    if (revealed) return
    setSelected(oi)
    setRevealed(true)
    setAnswers(prev => ({ ...prev, [current]: oi }))
  }

  const handleNext = () => {
    if (current + 1 >= total) {
      // finish
      const finalAnswers = { ...answers }
      const correct = quiz.questions.filter((qq, i) => finalAnswers[i] === qq.correctIndex).length
      const percentage = Math.round((correct / total) * 100)
      const grade = getGrade(percentage)
      const weakQuestions = quiz.questions
        .map((qq, i) => finalAnswers[i] !== qq.correctIndex ? { question: qq.question, correctIndex: qq.correctIndex, userIndex: finalAnswers[i], topic: quiz.title } : null)
        .filter(Boolean)

      saveQuizResult({ title: quiz.title, date: new Date().toLocaleDateString("en-GB"), correct, total, percentage, grade, weakQuestions })
      localStorage.setItem(todayKey, playedToday + 1)
      setFinished(true)
    } else {
      setDirection(1)
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const handlePrev = () => {
    if (current === 0) return
    setDirection(-1)
    setCurrent(c => c - 1)
    setSelected(answers[current - 1] ?? null)
    setRevealed(answers[current - 1] !== undefined)
  }

  if (finished) {
    return <ResultsScreen quiz={quiz} answers={answers} onRestart={() => window.location.reload()} />
  }

  return (
    <div className="qp-shell">

      {/* Header */}
      <div className="qp-header">
        <div className="qp-progress-bar">
          <motion.div
            className="qp-progress-fill"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="qp-meta">
          <span className="qp-counter">{current + 1} / {total}</span>
          <span className="qp-daily">{QUIZ_LIMIT - playedToday} квизови останати денес</span>
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          className="qp-card"
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="qp-q-num">Прашање {current + 1}</div>
          <p className="qp-q-text">{q.question}</p>

          <div className="qp-options">
            {q.options.map((opt, oi) => (
              <OptionBtn
                key={oi}
                label={LABELS[oi]}
                text={opt}
                selected={selected === oi}
                correct={revealed && oi === q.correctIndex}
                revealed={revealed}
                onClick={() => handleSelect(oi)}
              />
            ))}
          </div>

          {/* Feedback pill */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                className={`qp-feedback ${selected === q.correctIndex ? "qp-feedback--correct" : "qp-feedback--wrong"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {selected === q.correctIndex
                  ? "✓ Точно!"
                  : `✕ Точен одговор: ${q.options[q.correctIndex]}`}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="qp-nav">
        <button className="qp-nav-btn qp-nav-btn--ghost" onClick={handlePrev} disabled={current === 0}>
          ← Назад
        </button>

        <button
          className={`qp-nav-btn qp-nav-btn--next ${!revealed ? "qp-nav-btn--disabled" : ""}`}
          onClick={handleNext}
          disabled={!revealed}
        >
          {current + 1 === total ? "Заврши квиз 🎯" : "Следно →"}
        </button>
      </div>

    </div>
  )
}

export default QuizPlayer