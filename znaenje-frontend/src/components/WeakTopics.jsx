function WeakTopics({ data }) {
  if (!data || data.length === 0) {
    return <p>Нема доволно податоци.</p>
  }

  return (
    <div className="insight-card">
      <h4>🧠 Слаби области</h4>

      {data.slice(0, 3).map((t, i) => (
        <div key={i} className="topic-row">
          <span>{t.topic}</span>
          <span>{t.percentage}%</span>
        </div>
      ))}
    </div>
  )
}

export default WeakTopics