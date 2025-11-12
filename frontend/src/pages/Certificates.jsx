import { useState, useEffect } from 'react'
import api from '../services/api'
import moment from 'moment'

const Certificates = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates/my')
      setCertificates(response.data)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No certificates issued yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-2">{cert.session_title}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <strong>Certificate Number:</strong> {cert.certificate_number}
                </p>
                <p className="text-sm">
                  <strong>Issue Date:</strong> {moment(cert.issue_date).format('MMMM DD, YYYY')}
                </p>
                {cert.expiry_date && (
                  <p className="text-sm">
                    <strong>Expiry Date:</strong> {moment(cert.expiry_date).format('MMMM DD, YYYY')}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded ${
                    cert.status === 'issued' ? 'bg-green-100 text-green-800' :
                    cert.status === 'revoked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cert.status}
                  </span>
                </p>
              </div>
              {cert.qr_code_url && (
                <div className="mb-4">
                  <img
                    src={cert.qr_code_url}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              )}
              <a
                href={`/verify/${cert.certificate_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
              >
                Verify Certificate
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Certificates


