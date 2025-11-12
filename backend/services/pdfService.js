const axios = require('axios');
const pool = require('../config/database');

class PDFService {
  async generateCertificatePDF(certificateId) {
    try {
      // Get certificate data
      const [certificates] = await pool.execute(
        `SELECT 
          c.*,
          u.first_name,
          u.last_name,
          u.email,
          ts.title as session_title,
          ts.session_date
        FROM certificates c
        JOIN users u ON c.trainee_id = u.id
        JOIN training_sessions ts ON c.session_id = ts.id
        WHERE c.id = ?`,
        [certificateId]
      );

      if (certificates.length === 0) {
        throw new Error('Certificate not found');
      }

      const certificate = certificates[0];

      // Generate HTML for PDF
      const htmlContent = this.generateCertificateHTML(certificate);

      // In a real implementation, you would use a service like Puppeteer, 
      // ReportLab (via Python service), or a PDF generation library
      // For now, we'll return the HTML and a note that PDF generation should be implemented
      
      return {
        success: true,
        html: htmlContent,
        message: 'PDF generation requires additional setup. HTML template generated.'
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  generateCertificateHTML(certificate) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${certificate.certificate_number}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      margin: 0;
      padding: 40px;
      background: #f5f5f5;
    }
    .certificate {
      background: white;
      border: 10px solid #d4af37;
      padding: 60px;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      font-size: 48px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 24px;
      color: #7f8c8d;
      margin-bottom: 40px;
    }
    .name {
      font-size: 36px;
      font-weight: bold;
      color: #2c3e50;
      margin: 40px 0;
      padding: 20px;
      border-bottom: 2px solid #d4af37;
      border-top: 2px solid #d4af37;
    }
    .description {
      font-size: 18px;
      color: #34495e;
      margin: 30px 0;
      line-height: 1.6;
    }
    .details {
      margin-top: 40px;
      font-size: 14px;
      color: #7f8c8d;
    }
    .qr-code {
      margin-top: 30px;
    }
    .footer {
      margin-top: 50px;
      font-size: 12px;
      color: #95a5a6;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">CERTIFICATE OF COMPLETION</div>
    <div class="subtitle">Coffee Training Center</div>
    
    <div class="description">
      This is to certify that
    </div>
    
    <div class="name">
      ${certificate.first_name} ${certificate.last_name}
    </div>
    
    <div class="description">
      has successfully completed the training course<br>
      <strong>${certificate.session_title}</strong>
    </div>
    
    <div class="details">
      <p>Certificate Number: <strong>${certificate.certificate_number}</strong></p>
      <p>Issue Date: ${new Date(certificate.issue_date).toLocaleDateString()}</p>
      ${certificate.expiry_date ? `<p>Expiry Date: ${new Date(certificate.expiry_date).toLocaleDateString()}</p>` : ''}
    </div>
    
    ${certificate.qr_code_url ? `
    <div class="qr-code">
      <img src="${certificate.qr_code_url}" alt="QR Code" style="width: 150px; height: 150px;">
      <p style="font-size: 12px; margin-top: 10px;">Verify at: ${process.env.FRONTEND_URL}/verify/${certificate.certificate_number}</p>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>This certificate is issued by Coffee Training Center</p>
      <p>For verification, visit: ${process.env.FRONTEND_URL}/verify/${certificate.certificate_number}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  async generateReportPDF(reportType, data) {
    // Similar implementation for report PDFs
    // This would generate different PDFs based on report type
    return {
      success: true,
      message: 'Report PDF generation requires additional setup'
    };
  }
}

module.exports = new PDFService();


