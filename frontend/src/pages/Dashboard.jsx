import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {user.role === 'trainee' ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Enrollments</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalEnrollments || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Completed Sessions</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.completedSessions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Certificates</h3>
              <p className="text-3xl font-bold text-purple-600">{stats?.certificates || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Exam Attempts</h3>
              <p className="text-3xl font-bold text-orange-600">{stats?.examAttempts || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Passed Exams</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.passedExams || 0}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Sessions</h3>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalSessions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Active Sessions</h3>
              <p className="text-3xl font-bold text-green-600">{stats?.activeSessions || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Trainees</h3>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalTrainees || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Certificates Issued</h3>
              <p className="text-3xl font-bold text-orange-600">{stats?.totalCertificates || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700">Total Exams</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats?.totalExams || 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/sessions"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
            >
              View Training Sessions
            </Link>
            <Link
              to="/exams"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded"
            >
              View Exams
            </Link>
            <Link
              to="/certificates"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded"
            >
              My Certificates
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


