/// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useContext, useState } from "react"

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => setIsOpen(v => !v)
  const close  = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  return useContext(SidebarContext)
}