function PerformanceByTopic({ data }) {
  if (!data || data.length === 0) return null

  return (
    <div className="insight-card">
      <h4>📊 Успешност по предмет</h4>

      {data.map((t, i) => (
        <div key={i} className="progress-row">
          <span>{t.topic}</span>

          <div className="mini-bar">
            <div
              className="mini-bar-fill"
              style={{ width: `${t.percentage}%` }}
            />
          </div>

          <span>{t.percentage}%</span>
        </div>
      ))}
    </div>
  )
}

export default PerformanceByTopic