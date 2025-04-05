// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    // 1. Cookie extraction security
    const token = req.cookies?.token;
    
    if (!token) {
      // Clear invalid cookie if present
      res.clearCookie('token');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Verify token with proper error handling
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Specify allowed algorithm
      ignoreExpiration: false // Ensure expiration checks
    });

    // 3. Token validation
    if (!decoded?.userId) {
      res.clearCookie('token');
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    
    req.userId = decoded.userId;
    
    // 5. Security headers for browser requests
    res.set({
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Access-Control-Allow-Credentials': 'true'
    });

    next();
  } catch (error) {
    // 6. Detailed error handling
    res.clearCookie('token');
    
    const errorMap = {
      TokenExpiredError: 'Session expired',
      JsonWebTokenError: 'Invalid token',
      NotBeforeError: 'Token inactive'
    };

    const errorMessage = errorMap[error.name] || 'Authentication failed';
    console.error(`Auth Error: ${errorMessage} - IP: ${req.ip}`);
    
    res.status(401).json({ 
      error: errorMessage,
      action: 'relogin' // Frontend can use this to trigger login flow
    });
  }
};