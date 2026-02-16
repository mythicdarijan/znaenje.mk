import { motion } from "framer-motion"
import "./SchoolBanner.css"

const LOGO_URL = "https://scontent.fskp4-2.fna.fbcdn.net/v/t39.30808-6/266408705_3078468225748570_8236462662320879771_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=53Z-cuJHR6wQ7kNvwHiKnra&_nc_oc=AdkmA3b8Vmp180bsmLAKD2GcRyiTGLFcY0nNbb-Pl9b-pYBhMbezCIA84S9YpvO0nIk&_nc_zt=23&_nc_ht=scontent.fskp4-2.fna&_nc_gid=LZJfDP8bZbWvLKP39FYztw&oh=00_AftEyEn5N6WFTMNQ5ufsfanq6UPvNvQD13ByPhquFKUyVg&oe=699897D0"

function SchoolBanner() {
  return (
    <motion.div
      className="school-banner"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Left glow decoration */}
      <div className="sb-glow" />

      {/* Logo */}
      <img
        src={LOGO_URL}
        alt="СОУ Ристе Ристески Ричко"
        className="sb-logo"
        onError={e => { e.target.style.display = "none" }}
      />

      {/* Divider */}
      <div className="sb-divider" />

      {/* Text */}
      <div className="sb-text">
        <p className="sb-title">Проектна задача — СОУ Ристе Ристески Ричко</p>
        <p className="sb-sub">Изработил: <strong>Даријан Мицкоски</strong> &nbsp;·&nbsp; IV‑1</p>
      </div>

      {/* Right badge */}
      <div className="sb-badge">
        <span>2025/26</span>
      </div>
    </motion.div>
  )
}

export default SchoolBanner
