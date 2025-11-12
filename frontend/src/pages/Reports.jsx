import { useState, useEffect } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import api from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Reports = () => {
  const [attendance, setAttendance] = useState([])
  const [performance, setPerformance] = useState([])
  const [enrollmentTrends, setEnrollmentTrends] = useState([])
  const [certificateStats, setCertificateStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [attendanceRes, performanceRes, trendsRes, certRes] = await Promise.all([
        api.get('/reports/attendance'),
        api.get('/reports/performance'),
        api.get('/reports/enrollment-trends?months=6'),
        api.get('/reports/certificates')
      ])
      setAttendance(attendanceRes.data)
      setPerformance(performanceRes.data)
      setEnrollmentTrends(trendsRes.data)
      setCertificateStats(certRes.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Loading reports...</div>

  const attendanceData = {
    labels: attendance.map(a => a.title),
    datasets: [
      {
        label: 'Attended',
        data: attendance.map(a => a.attended_count),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      },
      {
        label: 'Absent',
        data: attendance.map(a => a.absent_count),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }
    ]
  }

  const performanceData = {
    labels: performance.map(p => p.exam_title),
    datasets: [
      {
        label: 'Average Score (%)',
        data: performance.map(p => p.average_score?.toFixed(2) || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  }

  const enrollmentTrendsData = {
    labels: enrollmentTrends.map(t => t.month),
    datasets: [
      {
        label: 'Enrollments',
        data: enrollmentTrends.map(t => t.enrollment_count),
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4
      }
    ]
  }

  const certificateData = {
    labels: ['Issued', 'Revoked', 'Expired'],
    datasets: [
      {
        data: [
          certificateStats.reduce((sum, c) => sum + (c.issued_count || 0), 0),
          certificateStats.reduce((sum, c) => sum + (c.revoked_count || 0), 0),
          certificateStats.reduce((sum, c) => sum + (c.expired_count || 0), 0)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(156, 163, 175, 0.5)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Attendance Statistics</h2>
          {attendance.length > 0 ? (
            <Bar data={attendanceData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-500">No attendance data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Performance Statistics</h2>
          {performance.length > 0 ? (
            <Bar data={performanceData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-500">No performance data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Enrollment Trends</h2>
          {enrollmentTrends.length > 0 ? (
            <Line data={enrollmentTrendsData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-500">No enrollment trends data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Certificate Statistics</h2>
          {certificateStats.length > 0 ? (
            <Doughnut data={certificateData} options={{ responsive: true }} />
          ) : (
            <p className="text-gray-500">No certificate data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports


