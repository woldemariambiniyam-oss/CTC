import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import moment from 'moment'

const CertificateVerify = () => {
  const { certificateNumber } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    verifyCertificate()
  }, [certificateNumber])

  const verifyCertificate = async () => {
    try {
      const response = await api.get(`/certificates/verify/${certificateNumber}`)
      setCertificate(response.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Certificate not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center">Verifying...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Certificate Verification</h1>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : certificate ? (
          <div>
            <div className={`text-center mb-6 p-4 rounded ${
              certificate.valid
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <h2 className="text-2xl font-bold">
                {certificate.valid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <strong>Certificate Number:</strong> {certificate.certificate.certificateNumber}
              </div>
              <div>
                <strong>Trainee Name:</strong> {certificate.certificate.traineeName}
              </div>
              <div>
                <strong>Session Title:</strong> {certificate.certificate.sessionTitle}
              </div>
              <div>
                <strong>Issue Date:</strong> {moment(certificate.certificate.issueDate).format('MMMM DD, YYYY')}
              </div>
              {certificate.certificate.expiryDate && (
                <div>
                  <strong>Expiry Date:</strong> {moment(certificate.certificate.expiryDate).format('MMMM DD, YYYY')}
                </div>
              )}
              <div>
                <strong>Status:</strong> {certificate.certificate.status}
              </div>
              {certificate.certificate.expired && (
                <div className="text-red-600 font-semibold">
                  This certificate has expired
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Certificate not found
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificateVerify


