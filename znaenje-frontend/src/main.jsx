import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import './index.css'   

// 🌙 GLOBAL PREMIUM THEME
import "./styles/theme.css"

// ако имаш bootstrap
// import "bootstrap/dist/css/bootstrap.min.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)