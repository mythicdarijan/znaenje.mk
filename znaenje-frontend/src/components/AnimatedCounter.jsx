import { useEffect, useState } from "react"

function AnimatedCounter({ value, duration = 800, suffix = "" }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = value / (duration / 16)

    const interval = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplay(value)
        clearInterval(interval)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(interval)
  }, [value, duration])

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}

export default AnimatedCounter