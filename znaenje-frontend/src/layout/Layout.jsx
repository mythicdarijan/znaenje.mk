import { AnimatePresence, motion } from "framer-motion"
import { useLocation } from "react-router-dom"

import { SidebarProvider } from "../context/SidebarContext"
import Navbar from "../ui/Navbar"
import Sidebar from "../ui/Sidebar"
import Footer from "../ui/Footer"

import "./Layout.css"

function LayoutInner({ children }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Navbar />

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="app-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  )
}

// SidebarProvider wraps everything so both Navbar and Sidebar
// can share the isOpen state via context
function Layout({ children }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  )
}

export default Layout