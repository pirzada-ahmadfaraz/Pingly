import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      email: decoded.email,
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
