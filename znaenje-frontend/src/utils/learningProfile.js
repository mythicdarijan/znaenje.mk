import { getQuizHistory } from './storage'

export function buildLearningProfile() {
  const history = getQuizHistory()

  const profile = {}

  history.forEach(quiz => {
    quiz.weakQuestions?.forEach(wq => {
      if (!profile[wq.topic]) {
        profile[wq.topic] = 0
      }
      profile[wq.topic]++
    })
  })

  return profile
}