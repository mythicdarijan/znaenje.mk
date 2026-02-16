function SmartRecommendation({ weakest }) {
  if (!weakest) return null

  return (
    <div className="insight-card highlight">
      <h4>🎯 Препорака</h4>
      <p>
        Најслаба област ти е <strong>{weakest.topic}</strong> со
        <strong> {weakest.percentage}%</strong> успешност.
      </p>
      <p>Препорачуваме да генерираш квиз од оваа тема.</p>
    </div>
  )
}

export default SmartRecommendation