const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/authService');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  

      const user = await findUserById(decoded.id);
      if (!user) {
        console.error('[Auth Middleware] User not found for id:', decoded.id);
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

  

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error);

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ success: false, message: 'Token expired, please login again' });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.error('[Auth Middleware] No token provided');
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
