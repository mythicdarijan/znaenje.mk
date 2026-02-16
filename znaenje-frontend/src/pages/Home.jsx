import QuizGenerator from '../components/QuizGenerator'
import QuizPlayer from '../components/QuizPlayer'
import QuizHistory from '../components/QuizHistory'
import DashboardStats from "../components/DashboardStats"
import PageTransition from "../components/PageTransitions"  // ✅ fixed: was "PageTransition" (missing 's')

function Home() {
  return (
    <PageTransition>
      <div className="container mt-5">
        <h1>Znaenje.com</h1>
        <p>Внеси материјал и добиј квиз за вежбање.</p>

        <DashboardStats />
        <QuizGenerator />
        <QuizPlayer />
        <QuizHistory />
      </div>
    </PageTransition>
  )
}

export default Home