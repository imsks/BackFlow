import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { jwtBlacklist } from '../utils/jwtBlacklist.js';
import { authenticateToken } from '../utils/authMiddleware.js';

const router = express.Router();

// Simple user store (in production, use a database)
const users = [
  { id: 1, username: 'admin', password: 'admin123' },
  { id: 2, username: 'user', password: 'user123' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT with unique ID (jti) for blacklisting
  const tokenId = uuidv4();
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username,
      jti: tokenId // JWT ID for blacklisting
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '1h' }
  );

  res.json({
    message: 'Login successful',
    token,
    tokenId,
    expiresIn: '1h'
  });
});

router.post('/logout', authenticateToken, (req, res) => {
  const tokenId = req.user.jti;

  if (tokenId) {
    jwtBlacklist.add(tokenId);
    res.json({ message: 'Logged out successfully' });
  } else {
    res.status(400).json({ error: 'Token ID not found' });
  }
});

// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

export default router;
