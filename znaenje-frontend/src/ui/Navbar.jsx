import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { useSidebar } from "../context/SidebarContext"
import "./Navbar.css"

// Map routes to readable titles
const pageTitles = {
  "/dashboard": "Dashboard",
  "/generate":  "Generate Quiz",
  "/history":   "History",
}

function HamburgerIcon({ isOpen }) {
  return (
    <div className={`hamburger ${isOpen ? "hamburger--open" : ""}`}>
      <span />
      <span />
      <span />
    </div>
  )
}

function Navbar() {
  const { isOpen, toggle } = useSidebar()
  const location = useLocation()
  const title = pageTitles[location.pathname] || "Znaenje"

  return (
    <motion.header
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Toggle button */}
      <button
        className="navbar-toggle"
        onClick={toggle}
        aria-label="Toggle sidebar"
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <HamburgerIcon isOpen={isOpen} />
      </button>

      {/* Page title */}
      <motion.span
        key={title}
        className="navbar-title"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {title}
      </motion.span>

      {/* Right side */}
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="avatar" title="Student">S</div>
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar