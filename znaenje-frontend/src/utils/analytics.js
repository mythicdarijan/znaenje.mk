/// eslint-disable-next-line react-refresh/only-export-components

/**
 * analytics.js v2
 * Richer learning analytics: trends, streaks, most-missed, momentum
 */

// ─── Per-topic performance + trend ───────────────────────────────────────────
export function analyzeQuizHistory(history) {
  const topicStats = {}
  const weakQuestions = []

  history.forEach(quiz => {
    const topic = quiz.title

    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0, attempts: [], dates: [] }
    }

    topicStats[topic].total   += quiz.total
    topicStats[topic].correct += quiz.correct
    topicStats[topic].attempts.push(quiz.percentage)
    topicStats[topic].dates.push(quiz.date)

    quiz.weakQuestions?.forEach(q => weakQuestions.push(q))
  })

  const performanceByTopic = Object.entries(topicStats).map(([topic, data]) => {
    const percentage = Math.round((data.correct / data.total) * 100)

    // trend: compare first half vs second half of attempts
    const arr = data.attempts
    let trend = "stable"
    if (arr.length >= 2) {
      const mid   = Math.floor(arr.length / 2)
      const first = avg(arr.slice(0, mid))
      const last  = avg(arr.slice(mid))
      if (last - first >= 8)  trend = "improving"
      if (first - last >= 8)  trend = "declining"
    }

    return {
      topic,
      percentage,
      attempts: arr.length,
      trend
    }
  })

  performanceByTopic.sort((a, b) => a.percentage - b.percentage)

  return {
    performanceByTopic,
    weakQuestions,
    weakestTopic: performanceByTopic[0] || null,
    strongestTopic: performanceByTopic[performanceByTopic.length - 1] || null,
  }
}

// ─── Most-missed questions ────────────────────────────────────────────────────
export function getMostMissed(history, limit = 3) {
  const freq = {}

  history.forEach(quiz => {
    quiz.weakQuestions?.forEach(wq => {
      const key = wq.question
      if (!freq[key]) freq[key] = { question: wq.question, topic: wq.topic, count: 0 }
      freq[key].count++
    })
  })

  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// ─── Study streak (consecutive days) ─────────────────────────────────────────
export function getStudyStreak(history) {
  if (!history.length) return 0

  // Parse all quiz dates into unique day strings
  const days = [...new Set(
    history.map(q => {
      // dates stored as "DD/MM/YYYY"
      const [d, m, y] = q.date.split("/")
      return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`
    })
  )].sort().reverse()  // most recent first

  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const day of days) {
    const dayDate = new Date(day)
    const diff = Math.round((cursor - dayDate) / 86400000)

    if (diff === 0 || diff === 1) {
      streak++
      cursor = dayDate
    } else {
      break
    }
  }

  return streak
}

// ─── Overall momentum (last 5 quizzes trend) ─────────────────────────────────
export function getMomentum(history) {
  if (history.length < 2) return "neutral"
  const last5 = history.slice(0, 5).map(q => q.percentage)
  const trend = last5[0] - last5[last5.length - 1]
  if (trend >= 10) return "up"
  if (trend <= -10) return "down"
  return "neutral"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avg(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}