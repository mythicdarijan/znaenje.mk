const STORAGE_KEY = 'znaenje_quiz_history'

export function getQuizHistory() {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveQuizResult(result) {
  const history = getQuizHistory()
  history.unshift(result)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}