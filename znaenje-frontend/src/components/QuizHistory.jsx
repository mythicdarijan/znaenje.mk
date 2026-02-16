import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getQuizHistory } from "../utils/storage"
import "./QuizHistory.css"

const gradeColor = (pct) => {
  if (pct >= 81) return { bar: "#22c55e", badge: "rgba(34,197,94,0.15)",  text: "#86efac" }
  if (pct >= 61) return { bar: "#3b82f6", badge: "rgba(59,130,246,0.15)", text: "#93c5fd" }
  if (pct >= 41) return { bar: "#facc15", badge: "rgba(250,204,21,0.15)", text: "#fde68a" }
  return              { bar: "#ef4444", badge: "rgba(239,68,68,0.15)",  text: "#fca5a5" }
}

const gradeLabel = (g) => ["", "Недоволен", "Задоволителен", "Добар", "Многу добар", "Одличен"][g] || ""

function QuizHistory({ limit }) {
  const all     = getQuizHistory()
  const history = limit ? all.slice(0, limit) : all
  const [filter, setFilter] = useState("all")  // all | passed | failed

  const filtered = history.filter(q => {
    if (filter === "passed") return q.percentage >= 61
    if (filter === "failed") return q.percentage < 61
    return true
  })

  if (history.length === 0) {
    return (
      <div className="qh-empty">
        <div className="qh-empty-icon">📋</div>
        <p className="qh-empty-title">Нема историја</p>
        <p className="qh-empty-sub">Реши го твојот прв квиз за да го видиш тука.</p>
      </div>
    )
  }

  return (
    <div className="qh-wrap">

      {/* Filter bar — only show on full history page (no limit) */}
      {!limit && (
        <div className="qh-filters">
          {[
            { key: "all",    label: "Сите" },
            { key: "passed", label: "✓ Положени" },
            { key: "failed", label: "✕ Неположени" },
          ].map(f => (
            <button
              key={f.key}
              className={`qh-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <span className="qh-count">{filtered.length} квизови</span>
        </div>
      )}

      {/* List */}
      <div className="qh-list">
        <AnimatePresence>
          {filtered.map((quiz, i) => {
            const c = gradeColor(quiz.percentage)
            return (
              <motion.div
                key={i}
                className="qh-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                layout
              >
                {/* Left: rank + title */}
                <div className="qh-rank">{i + 1}</div>

                <div className="qh-info">
                  <p className="qh-title">{quiz.title}</p>
                  <p className="qh-meta">
                    {quiz.correct}/{quiz.total} точни
                    <span className="qh-dot">·</span>
                    {quiz.date}
                  </p>
                </div>

                {/* Center: progress bar */}
                <div className="qh-bar-wrap">
                  <div className="qh-bar-track">
                    <motion.div
                      className="qh-bar-fill"
                      style={{ background: c.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${quiz.percentage}%` }}
                      transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="qh-pct">{quiz.percentage}%</span>
                </div>

                {/* Right: grade badge */}
                <div
                  className="qh-grade"
                  style={{ background: c.badge, color: c.text }}
                >
                  <span className="qh-grade-num">{quiz.grade}</span>
                  <span className="qh-grade-lbl">{gradeLabel(quiz.grade)}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="qh-no-results">Нема квизови за овој филтер.</div>
        )}
      </div>

      {/* Summary row */}
      {!limit && filtered.length > 0 && (
        <div className="qh-summary">
          <span>Просек: <strong>{Math.round(filtered.reduce((s, q) => s + q.percentage, 0) / filtered.length)}%</strong></span>
          <span>Положени: <strong>{filtered.filter(q => q.percentage >= 61).length} / {filtered.length}</strong></span>
          <span>Најдобра оценка: <strong>{Math.max(...filtered.map(q => q.grade))}</strong></span>
        </div>
      )}
    </div>
  )
}

export default QuizHistory