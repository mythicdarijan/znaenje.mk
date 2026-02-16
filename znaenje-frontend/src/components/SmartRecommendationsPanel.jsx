import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  analyzeQuizHistory,
  getMostMissed,
  getStudyStreak,
  getMomentum
} from "../utils/analytics"
import "./SmartRecommendationsPanel.css"

// ─── Trend badge ──────────────────────────────────────────────────────────────
function TrendBadge({ trend }) {
  const map = {
    improving: { icon: "↑", label: "Напредок",   cls: "trend-up"      },
    declining:  { icon: "↓", label: "Пад",        cls: "trend-down"    },
    stable:     { icon: "→", label: "Стабилно",   cls: "trend-stable"  },
  }
  const t = map[trend] || map.stable
  return (
    <span className={`trend-badge ${t.cls}`}>
      {t.icon} {t.label}
    </span>
  )
}

// ─── Topic row ────────────────────────────────────────────────────────────────
function TopicRow({ topic, percentage, attempts, trend, index }) {
  const barColor =
    percentage >= 80 ? "#22c55e" :
    percentage >= 60 ? "#3b82f6" :
    percentage >= 40 ? "#facc15" : "#ef4444"

  return (
    <motion.div
      className="topic-row-v2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="topic-row-header">
        <span className="topic-name">{topic}</span>
        <div className="topic-row-right">
          <TrendBadge trend={trend} />
          <span className="topic-pct" style={{ color: barColor }}>{percentage}%</span>
        </div>
      </div>

      <div className="topic-bar-track">
        <motion.div
          className="topic-bar-fill"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, delay: index * 0.07 + 0.2, ease: "easeOut" }}
        />
      </div>

      <span className="topic-attempts">{attempts} {attempts === 1 ? "обид" : "обиди"}</span>
    </motion.div>
  )
}

// ─── Missed question card ─────────────────────────────────────────────────────
function MissedCard({ question, topic, count, index }) {
  return (
    <motion.div
      className="missed-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="missed-count">×{count}</div>
      <div className="missed-body">
        <p className="missed-question">{question}</p>
        <span className="missed-topic">{topic}</span>
      </div>
    </motion.div>
  )
}

// ─── Momentum banner ──────────────────────────────────────────────────────────
function MomentumBanner({ momentum, streak }) {
  const config = {
    up:      { icon: "🚀", msg: "Одличен тренд — продолжи вака!",     cls: "momentum-up"      },
    down:    { icon: "⚠️", msg: "Резултатите паѓаат — вежбај повеќе.", cls: "momentum-down"    },
    neutral: { icon: "📈", msg: "Стабилно учење — пробај потешко.",   cls: "momentum-neutral"  },
  }
  const c = config[momentum]

  return (
    <motion.div
      className={`momentum-banner ${c.cls}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="momentum-icon">{c.icon}</span>
      <div className="momentum-body">
        <p className="momentum-msg">{c.msg}</p>
        {streak > 0 && (
          <p className="momentum-streak">
            🔥 {streak} {streak === 1 ? "ден" : "дена"} по ред
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
function SmartRecommendationsPanel({ history }) {
  const navigate = useNavigate()

  if (!history || history.length < 2) {
    return (
      <div className="rec-panel rec-panel--empty">
        <p className="rec-empty-text">
          🧩 Реши уште квизови за да ги видиш паметните препораки.
        </p>
      </div>
    )
  }

  const { performanceByTopic, weakestTopic, strongestTopic } = analyzeQuizHistory(history)
  const mostMissed = getMostMissed(history, 3)
  const streak     = getStudyStreak(history)
  const momentum   = getMomentum(history)

  // Show bottom 3 (weakest) and top 1 (strongest) if different
  const weakTopics   = performanceByTopic.slice(0, Math.min(3, performanceByTopic.length))
  const strongTopics = performanceByTopic.slice(-1).filter(
    t => !weakTopics.find(w => w.topic === t.topic)
  )

  return (
    <div className="rec-panel">

      {/* ── Momentum banner ── */}
      <MomentumBanner momentum={momentum} streak={streak} />

      <div className="rec-grid">

        {/* ── Left: topic performance ── */}
        <div className="rec-section">
          <h3 className="rec-section-title">📊 Успешност по тема</h3>

          <div className="topic-list">
            {weakTopics.map((t, i) => (
              <TopicRow key={t.topic} {...t} index={i} />
            ))}
            {strongTopics.map((t, i) => (
              <TopicRow key={t.topic} {...t} index={weakTopics.length + i} />
            ))}
          </div>
        </div>

        {/* ── Right: missed + recommendation ── */}
        <div className="rec-section">

          {/* Most missed questions */}
          {mostMissed.length > 0 && (
            <>
              <h3 className="rec-section-title">🔁 Најчесто погрешни</h3>
              <div className="missed-list">
                {mostMissed.map((m, i) => (
                  <MissedCard key={i} {...m} index={i} />
                ))}
              </div>
            </>
          )}

          {/* Smart CTA */}
          {weakestTopic && (
            <motion.div
              className="rec-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="rec-cta-body">
                <p className="rec-cta-label">🎯 Препорачана тема</p>
                <p className="rec-cta-topic">{weakestTopic.topic}</p>
                <p className="rec-cta-sub">
                  {weakestTopic.percentage}% успешност ·{" "}
                  {weakestTopic.trend === "declining" ? "⚠️ во пад" :
                   weakestTopic.trend === "improving" ? "↑ во пораст" : "→ стабилно"}
                </p>
              </div>
              <button
                className="btn-primary rec-cta-btn"
                onClick={() => navigate("/generate")}
              >
                Вежбај сега →
              </button>
            </motion.div>
          )}

          {/* Strongest topic shoutout */}
          {strongestTopic && strongestTopic.topic !== weakestTopic?.topic && (
            <motion.div
              className="rec-strong"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              ⭐ Најсилна тема: <strong>{strongestTopic.topic}</strong> · {strongestTopic.percentage}%
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

export default SmartRecommendationsPanel
