import jwt from 'jsonwebtoken';
import { jwtBlacklist } from './jwtBlacklist.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Check if token is blacklisted
    if (jwtBlacklist.has(decoded.jti)) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
