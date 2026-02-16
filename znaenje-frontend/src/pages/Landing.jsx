// ✅ fixed: removed import "./styles.css" — file doesn't exist, theme.css handles all styles

function Landing() {
  return (
    <div className="container py-5 fade-in">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">
          Znaenje.mk
        </h1>
        <p className="lead mt-3">
          Претвори било кој материјал во интелигентен квиз за 30 секунди
        </p>

        <a href="/app" className="btn-primary mt-3" style={{ display: "inline-block", textDecoration: "none" }}>
          Започни бесплатно
        </a>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5>1. Прикачи материјал</h5>
            <p>PDF, DOCX, PPTX</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5>2. AI генерира квиз</h5>
            <p>Автоматски прашања и одговори</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5>3. Учи паметно</h5>
            <p>Историја, оценки, прогрес</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <p style={{ opacity: 0.5 }}>
          Проектна задача креирана од ученик на СОУ Ристе Ристески Ричко – Прилеп
        </p>
      </div>
    </div>
  )
}

export default Landing