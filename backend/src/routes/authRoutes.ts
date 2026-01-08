import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout); // Logout functionality will be primarily client-side token removal, but keeping an endpoint for consistency or future server-side session invalidation

export default router;
