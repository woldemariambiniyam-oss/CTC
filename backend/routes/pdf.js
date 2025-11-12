const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const pdfService = require('../services/pdfService');

const router = express.Router();

// Generate certificate PDF
router.get('/certificate/:certificateId', authenticateToken, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this certificate
    const [certificates] = await pool.execute(
      'SELECT * FROM certificates WHERE id = ?',
      [certificateId]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = certificates[0];

    // Allow access if user owns the certificate or is admin/trainer
    if (certificate.trainee_id !== userId && userRole !== 'admin' && userRole !== 'trainer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pdfData = await pdfService.generateCertificatePDF(certificateId);

    // In production, you would use a library like Puppeteer or a Python service
    // to convert HTML to PDF. For now, we return the HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(pdfData.html);
  } catch (error) {
    next(error);
  }
});

// Generate report PDF
router.post('/report', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { reportType, data } = req.body;

    const pdfData = await pdfService.generateReportPDF(reportType, data);

    res.json(pdfData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


