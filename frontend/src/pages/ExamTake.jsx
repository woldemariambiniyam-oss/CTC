import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const ExamTake = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchExam()
  }, [id])

  const fetchExam = async () => {
    try {
      const response = await api.get(`/exams/${id}`)
      setExam(response.data)
      
      // Check for existing attempt
      const attemptsRes = await api.get('/exams/my/attempts')
      const existingAttempt = attemptsRes.data.find(a => a.exam_id === parseInt(id))
      if (existingAttempt) {
        setAttempt(existingAttempt)
        if (existingAttempt.status === 'submitted') {
          // Load submitted answers
          // Note: You may need to add an endpoint to fetch answers
        }
      }
    } catch (error) {
      console.error('Error fetching exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async () => {
    try {
      const response = await api.post(`/exams/${id}/start`)
      setAttempt(response.data)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start exam')
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    })
  }

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return
    }

    setSubmitting(true)
    try {
      const answerArray = Object.entries(answers).map(([questionId, answerText]) => ({
        questionId: parseInt(questionId),
        answerText
      }))

      await api.post(`/exams/${id}/submit`, { answers: answerArray })
      alert('Exam submitted successfully!')
      navigate('/exams')
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center">Loading...</div>
  if (!exam) return <div className="text-center">Exam not found</div>

  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
          <p className="text-gray-600 mb-6">{exam.description}</p>
          <div className="space-y-2 mb-6">
            <p><strong>Duration:</strong> {exam.duration_minutes} minutes</p>
            <p><strong>Total Questions:</strong> {exam.total_questions}</p>
            <p><strong>Passing Score:</strong> {exam.passing_score}%</p>
          </div>
          <button
            onClick={handleStartExam}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold"
          >
            Start Exam
          </button>
        </div>
      </div>
    )
  }

  if (attempt.status === 'submitted') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
          <div className="mb-6">
            <p className={`text-2xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
              Score: {attempt.percentage_score.toFixed(2)}% - {attempt.passed ? 'Passed' : 'Failed'}
            </p>
          </div>
          <button
            onClick={() => navigate('/exams')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg"
          >
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">Time remaining: {exam.duration_minutes} minutes</p>
          <p className="text-gray-600">
            Answered: {Object.keys(answers).length} / {exam.questions?.length || 0}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {exam.questions?.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Question {index + 1}: {question.question_text}
            </h3>
            {question.question_type === 'multiple_choice' && question.options ? (
              <div className="space-y-2">
                {JSON.parse(question.options).map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full border rounded p-2"
                rows={4}
                placeholder="Enter your answer..."
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/exams')}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < exam.questions?.length}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  )
}

export default ExamTake


