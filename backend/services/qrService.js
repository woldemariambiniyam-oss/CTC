const axios = require('axios');

class QRService {
  constructor() {
    this.baseURL = process.env.QR_SERVICE_URL || 'http://localhost:5001';
  }

  async generateQRCode(data) {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, {
        data: data,
        size: 300
      });

      return {
        success: true,
        qrCodeUrl: response.data.qr_code_url,
        qrCodeData: response.data.qr_code_data
      };
    } catch (error) {
      console.error('QR Code generation error:', error);
      // Fallback: return a placeholder or use a public QR API
      return {
        success: false,
        error: error.message,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`,
        qrCodeData: data
      };
    }
  }

  async generateCertificateQR(certificateNumber, traineeId, sessionId) {
    const qrData = JSON.stringify({
      certificate_number: certificateNumber,
      trainee_id: traineeId,
      session_id: sessionId,
      verification_url: `${process.env.FRONTEND_URL}/verify/${certificateNumber}`
    });

    return await this.generateQRCode(qrData);
  }
}

module.exports = new QRService();


