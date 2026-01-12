// backend/src/middleware/roleMiddleware.js
const logger = require('../utils/logger');

const requireRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      logger.error('User not authenticated: Cannot check roles.');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Ensure user.roles is an array, even if undefined or null
    const userRoles = Array.isArray(user.roles) ? user.roles : [];

    // Check if user has any of the required roles
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      logger.warn(`User ${user.email} attempted to access with insufficient roles. Required: ${roles.join(', ')}, Provided: ${userRoles.join(', ')}`);
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  requireRole,
};