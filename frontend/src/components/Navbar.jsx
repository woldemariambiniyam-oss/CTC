import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold">
            Coffee Training Center
          </Link>
          
          {user && (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/sessions" className="hover:text-blue-200">Sessions</Link>
              <Link to="/queue" className="hover:text-blue-200">Queue</Link>
              <Link to="/exams" className="hover:text-blue-200">Exams</Link>
              <Link to="/certificates" className="hover:text-blue-200">Certificates</Link>
              {(user.role === 'admin' || user.role === 'trainer') && (
                <Link to="/reports" className="hover:text-blue-200">Reports</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/users" className="hover:text-blue-200">User Management</Link>
              )}
              <span className="text-blue-200">Welcome, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar


