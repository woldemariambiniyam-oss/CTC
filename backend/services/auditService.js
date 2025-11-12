const pool = require('../config/database');

class AuditService {
  async logAction(userId, action, resourceType = null, resourceId = null, details = null, req = null) {
    try {
      const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
      const userAgent = req ? req.get('user-agent') : null;
      const detailsJson = details ? JSON.stringify(details) : null;

      await pool.execute(
        `INSERT INTO audit_logs 
         (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, action, resourceType, resourceId, detailsJson, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw - audit logging should not break the application
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      let query = `
        SELECT 
          al.*,
          u.email as user_email,
          u.first_name,
          u.last_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
      
      const params = [];

      if (filters.userId) {
        query += ' AND al.user_id = ?';
        params.push(filters.userId);
      }

      if (filters.action) {
        query += ' AND al.action = ?';
        params.push(filters.action);
      }

      if (filters.resourceType) {
        query += ' AND al.resource_type = ?';
        params.push(filters.resourceType);
      }

      if (filters.startDate) {
        query += ' AND al.created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND al.created_at <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY al.created_at DESC LIMIT ?';
      params.push(filters.limit || 100);

      const [logs] = await pool.execute(query, params);
      return logs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();

