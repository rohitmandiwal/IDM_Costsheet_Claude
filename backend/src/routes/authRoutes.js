const { Router } = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout); // Logout functionality will be primarily client-side token removal, but keeping an endpoint for consistency or future server-side session invalidation

module.exports = router;
