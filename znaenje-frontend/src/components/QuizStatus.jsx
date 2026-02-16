function QuizStatus({ played, limit }) {
  return (
    <div className="mb-3 text-end text-muted">
      Искористени квизови денес: {played} / {limit}
    </div>
  )
}

export default QuizStatus