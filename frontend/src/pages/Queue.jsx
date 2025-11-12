import { useState, useEffect } from 'react'
import api from '../services/api'

const Queue = () => {
  const [myQueues, setMyQueues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyQueues()
  }, [])

  const fetchMyQueues = async () => {
    try {
      const response = await api.get('/queue/my/queues')
      setMyQueues(response.data)
    } catch (error) {
      console.error('Error fetching queues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveQueue = async (queueId) => {
    if (!window.confirm('Are you sure you want to leave the queue?')) return

    try {
      await api.delete(`/queue/leave/${queueId}`)
      fetchMyQueues()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to leave queue')
    }
  }

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Queue Positions</h1>

      {myQueues.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          You are not in any queue
        </div>
      ) : (
        <div className="space-y-4">
          {myQueues.map((queue) => (
            <div key={queue.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-2">{queue.session_title}</h3>
                  <p className="text-gray-600 mb-2">
                    <strong>Position:</strong> {queue.queue_position}
                  </p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(queue.joined_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleLeaveQueue(queue.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Leave Queue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Queue


