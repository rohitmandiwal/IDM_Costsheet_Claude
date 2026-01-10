const { RoleAssignment } = require('../models');

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) {
      console.error('[Role Middleware] User object not found in request');
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const roles = await RoleAssignment.findAll({ where: { user_id: user.id } });
    const userRoles = roles.map(r => r.role);

    console.log('[Role Middleware] User:', { id: user.id, roles: userRoles });
    console.log('[Role Middleware] Allowed roles:', allowedRoles);

    if (!userRoles || userRoles.length === 0) {
      console.error('[Role Middleware] User roles are missing');
      return res.status(403).json({ success: false, message: 'Access denied - no roles assigned' });
    }

    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      console.error('[Role Middleware] Role check failed. User roles:', userRoles, 'Required:', allowedRoles);
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions',
        debug: {
          userRoles: userRoles,
          requiredRoles: allowedRoles
        }
      });
    }

    console.log('[Role Middleware] Access granted');
    next();
  };
};

module.exports = { requireRole };
