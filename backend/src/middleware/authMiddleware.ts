import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../services/authService';

interface JwtPayload {
  id: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      const user = await findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      // @ts-ignore
      req.user = user;
      next();
    } catch (error) {
      console.error(error);

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
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};
