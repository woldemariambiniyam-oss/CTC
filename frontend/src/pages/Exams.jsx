import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import moment from 'moment'

const Exams = () => {
  const [exams, setExams] = useState([])
  const [myAttempts, setMyAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        api.get('/exams?status=active'),
        api.get('/exams/my/attempts')
      ])
      setExams(examsRes.data)
      setMyAttempts(attemptsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Examinations</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Available Exams</h2>
        {exams.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No active exams available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const attempt = myAttempts.find(a => a.exam_id === exam.id)
              return (
                <div key={exam.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <strong>Session:</strong> {exam.session_title}
                    </p>
                    <p className="text-sm">
                      <strong>Duration:</strong> {exam.duration_minutes} minutes
                    </p>
                    <p className="text-sm">
                      <strong>Passing Score:</strong> {exam.passing_score}%
                    </p>
                    {exam.start_time && (
                      <p className="text-sm">
                        <strong>Start:</strong> {moment(exam.start_time).format('MMMM DD, YYYY HH:mm')}
                      </p>
                    )}
                  </div>
                  {attempt ? (
                    <div className="space-y-2">
                      <p className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                        Score: {attempt.percentage_score.toFixed(2)}% - {attempt.passed ? 'Passed' : 'Failed'}
                      </p>
                      <Link
                        to={`/exams/${exam.id}/take`}
                        className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded"
                      >
                        View Results
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={`/exams/${exam.id}/take`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
                    >
                      Start Exam
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">My Exam History</h2>
        {myAttempts.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No exam attempts yet
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{attempt.exam_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.percentage_score.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded ${attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {moment(attempt.submitted_at).format('MMM DD, YYYY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Exams


