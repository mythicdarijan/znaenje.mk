import { NavLink, useNavigate } from "react-router-dom"
/// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "../context/SidebarContext"
import "./Sidebar.css"

const links = [
  { to: "/dashboard",  label: "Dashboard",     icon: "⊞" },
  { to: "/generate",   label: "Generate Quiz",  icon: "✦" },
  { to: "/history",    label: "History",        icon: "◷" },
]

function Sidebar() {
  const { isOpen, close } = useSidebar()
  const navigate = useNavigate()

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar panel ── */}
      <motion.aside
        className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--collapsed"}`}
        animate={{ width: isOpen ? 240 : 68 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
          <span className="sidebar-logo-icon">Z</span>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                className="sidebar-logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Nav links */}
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={() => {
                // close on mobile when link is clicked
                if (window.innerWidth < 768) close()
              }}
            >
              {({ isActive }) => (
                <>
                  <span className="sidebar-icon" title={!isOpen ? link.label : undefined}>
                    {link.icon}
                  </span>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        className="sidebar-link-label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="active-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <span className="sidebar-tooltip">{link.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: version tag */}
        <div className="sidebar-footer">
          <AnimatePresence>
            {isOpen && (
              <motion.span
                className="sidebar-version"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                v1.0 · znaenje.mk
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar