const auditService = require('../services/auditService');

const auditMiddleware = (action, resourceType = null) => {
  return async (req, res, next) => {
    // Log after the action completes
    const originalSend = res.json;
    res.json = function(data) {
      // Determine resource ID from response or request
      const resourceId = req.params.id || req.body.id || data.id || null;
      
      // Log the action
      if (req.user) {
        auditService.logAction(
          req.user.id,
          action,
          resourceType,
          resourceId,
          {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode
          },
          req
        );
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditMiddleware;

