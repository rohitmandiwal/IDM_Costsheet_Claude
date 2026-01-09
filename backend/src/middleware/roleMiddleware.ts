import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;

    if (!user) {
      console.error('[Role Middleware] User object not found in request');
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    console.log('[Role Middleware] User:', { id: user.id, username: user.username, role: user.role });
    console.log('[Role Middleware] Allowed roles:', allowedRoles);
    console.log('[Role Middleware] User role type:', typeof user.role, Array.isArray(user.role));

    if (!user.role) {
      console.error('[Role Middleware] User role is missing');
      return res.status(403).json({ success: false, message: 'Access denied - no roles assigned' });
    }

    let userRoles: string[] = [];

    if (Array.isArray(user.role)) {
      userRoles = user.role;
    } else if (typeof user.role === 'string') {
      try {
        userRoles = JSON.parse(user.role);
        if (!Array.isArray(userRoles)) {
          userRoles = [user.role];
        }
      } catch {
        userRoles = [user.role];
      }
    } else {
      console.error('[Role Middleware] User role has unexpected type:', typeof user.role);
      return res.status(403).json({ success: false, message: 'Access denied - invalid role format' });
    }

    console.log('[Role Middleware] Normalized user roles:', userRoles);

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
