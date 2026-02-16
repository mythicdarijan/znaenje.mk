// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { getQuizHistory } from "../utils/storage"

function DashboardStats() {
  const history = getQuizHistory()

  const totalQuizzes = history.length

  const avgPercentage =
    totalQuizzes === 0
      ? 0
      : Math.round(
          history.reduce((sum, q) => sum + q.percentage, 0) / totalQuizzes
        )

  const avgGrade =
    totalQuizzes === 0
      ? "-"
      : (
          history.reduce((sum, q) => sum + q.grade, 0) / totalQuizzes
        ).toFixed(1)

  const stats = [
    { label: "Решени квизови", value: totalQuizzes },
    { label: "Просечна успешност", value: `${avgPercentage}%` },
    { label: "Просечна оценка", value: avgGrade }
  ]

  return (
    <div className="dashboard-grid">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <p className="dashboard-label">{stat.label}</p>
          <h2 className="dashboard-value">{stat.value}</h2>
        </motion.div>
      ))}
    </div>
  )
}

export default DashboardStats
