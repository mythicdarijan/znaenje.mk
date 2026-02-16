// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"

function AnimatedProgress({ value }) {
  return (
    <div className="progress-wrapper">
      <motion.div
        className="progress-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <span className="progress-label">{value}%</span>
    </div>
  )
}

export default AnimatedProgress