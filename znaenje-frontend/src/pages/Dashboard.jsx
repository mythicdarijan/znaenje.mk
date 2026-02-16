import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { getQuizHistory } from "../utils/storage"
import AnimatedCounter from "../components/AnimatedCounter"
import QuizHistory from "../components/QuizHistory"
import PageWrapper from "../layout/PageWrapper"
import "./Dashboard.css"
import SmartRecommendationsPanel from "../components/SmartRecommendationsPanel"
import SchoolBanner from "../components/SchoolBanner"

// ─── Daily limit tracker ──────────────────────────────────────────────────────
function getDailyCount() {
  const today = new Date()
  const key = `quiz-count-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  return Number(localStorage.getItem(key)) || 0
}

const DAILY_LIMIT = 3

// ─── Circular progress ring ───────────────────────────────────────────────────
function RingProgress({ value, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <svg width={size} height={size} className="ring-svg">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      {/* Fill */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c7cff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, suffix = "", accent, delay = 0 }) {
  return (
    <motion.div
      className="stat-card"
      style={{ "--accent-rgb": accent }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">
          <AnimatedCounter value={typeof value === "number" ? value : 0} suffix={suffix} />
          {typeof value !== "number" && <span>{value}</span>}
        </p>
      </div>
      <div className="stat-glow" />
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNavigate }) {
  return (
    <motion.div
      className="empty-dashboard"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-icon">🎓</div>
      <h3 className="empty-title">Сè уште нема квизови</h3>
      <p className="empty-desc">
        Прикачи материјал и генерирај го твојот прв квиз за да го видиш напредокот тука.
      </p>
      <button className="btn-primary" onClick={onNavigate}>
        Генерирај прв квиз →
      </button>
    </motion.div>
  )
}

// ─── Daily limit bar ──────────────────────────────────────────────────────────
function DailyTracker({ played, limit }) {
  const pct = Math.min((played / limit) * 100, 100)
  const remaining = limit - played
  const color = played >= limit ? "#ef4444" : played === limit - 1 ? "#facc15" : "#22c55e"

  return (
    <motion.div
      className="daily-tracker"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <div className="daily-top">
        <span className="daily-label">Дневен лимит</span>
        <span className="daily-count" style={{ color }}>
          {played} / {limit} квизови
        </span>
      </div>

      <div className="daily-bar-track">
        <motion.div
          className="daily-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        />
      </div>

      <p className="daily-hint">
        {played >= limit
          ? "⛔ Дневниот лимит е достигнат. Обиди се утре."
          : `✅ Уште ${remaining} ${remaining === 1 ? "квиз" : "квизови"} достапни денес`}
      </p>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate()
  const history = getQuizHistory()
  const dailyPlayed = getDailyCount()

  const totalQuizzes = history.length

  const avgPct =
    totalQuizzes === 0
      ? 0
      : Math.round(history.reduce((sum, q) => sum + q.percentage, 0) / totalQuizzes)

  const bestGrade =
    totalQuizzes === 0
      ? 0
      : Math.max(...history.map(q => q.grade))

  const totalCorrect =
    totalQuizzes === 0
      ? 0
      : history.reduce((sum, q) => sum + q.correct, 0)

  return (
    <PageWrapper>
      <div className="dashboard">

        <SchoolBanner />

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">
              {totalQuizzes === 0
                ? "Добредојде! Започни со учење."
                : `Одлична работа — ${totalQuizzes} ${totalQuizzes === 1 ? "квиз решен" : "квизови решени"} до сега.`}
            </p>
          </div>

          <motion.button
            className="btn-primary dash-cta"
            onClick={() => navigate("/generate")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            + Нов квиз
          </motion.button>
        </div>

        {totalQuizzes === 0 ? (
          <EmptyState onNavigate={() => navigate("/generate")} />
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div className="stats-row">
              <StatCard icon="📚" label="Решени квизови"    value={totalQuizzes}  accent="124,124,255" delay={0.05} />
              <StatCard icon="🎯" label="Просечна успешност" value={avgPct}        suffix="%" accent="34,211,238"  delay={0.1}  />
              <StatCard icon="⭐" label="Најдобра оценка"   value={bestGrade}     accent="250,204,21"  delay={0.15} />
              <StatCard icon="✅" label="Точни одговори"    value={totalCorrect}  accent="34,197,94"   delay={0.2}  />
            </div>

            {/* ── Progress + Daily ── */}
            <div className="mid-row">

              {/* Ring progress */}
              <motion.div
                className="progress-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <p className="panel-label">Вкупен напредок</p>
                <div className="ring-wrap">
                  <RingProgress value={avgPct} size={130} stroke={11} />
                  <div className="ring-center">
                    <span className="ring-value">{avgPct}%</span>
                    <span className="ring-sub">просек</span>
                  </div>
                </div>
              </motion.div>

              {/* Daily tracker */}
              <DailyTracker played={dailyPlayed} limit={DAILY_LIMIT} />

            </div>

            {/* ── Recent quizzes ── */}
            <motion.div
              className="history-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="history-panel-header">
                <h2 className="panel-label" style={{ margin: 0 }}>Последни квизови</h2>
                <button className="btn-link" onClick={() => navigate("/history")}>
                  Погледни ги сите →
                </button>
              </div>
              <QuizHistory limit={4} />
            </motion.div>
            
          {totalQuizzes >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="history-panel-header" style={{ marginBottom: "1rem" }}>
                <h2 className="panel-label" style={{ margin: 0 }}>🧠 Паметни препораки</h2>
              </div>
              <SmartRecommendationsPanel history={history} />
            </motion.div>
          )}
          </>
        )}

      </div>
    </PageWrapper>
  )
}

export default Dashboard