import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import moment from 'moment'

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions?upcoming=true')
      setSessions(response.data)
    } catch (error) {
      setError('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (sessionId) => {
    try {
      await api.post(`/sessions/${sessionId}/enroll`)
      alert('Successfully enrolled!')
      fetchSessions()
    } catch (error) {
      alert(error.response?.data?.error || 'Enrollment failed')
    }
  }

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Training Sessions</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">{session.title}</h3>
            <p className="text-gray-600 mb-4">{session.description}</p>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <strong>Date:</strong> {moment(session.session_date).format('MMMM DD, YYYY HH:mm')}
              </p>
              <p className="text-sm">
                <strong>Duration:</strong> {session.duration_minutes} minutes
              </p>
              <p className="text-sm">
                <strong>Capacity:</strong> {session.enrolled_count}/{session.max_capacity}
              </p>
              {session.location && (
                <p className="text-sm">
                  <strong>Location:</strong> {session.location}
                </p>
              )}
            </div>
            <button
              onClick={() => handleEnroll(session.id)}
              disabled={session.enrolled_count >= session.max_capacity || session.status !== 'scheduled'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {session.enrolled_count >= session.max_capacity
                ? 'Full'
                : session.status !== 'scheduled'
                ? 'Not Available'
                : 'Enroll'}
            </button>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No upcoming sessions available
        </div>
      )}
    </div>
  )
}

export default Sessions


