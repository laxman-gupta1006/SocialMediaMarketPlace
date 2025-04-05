const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const marketplaceRoutes = require('./routes/marketplace');
const adminRoutes= require('./routes/admin');
require('./config/dbConfig');

const app = express();

// 1. Set security headers using Helmet
app.use(helmet({
   crossOriginResourcePolicy: false // Disable CORP for static files
   }));

// 2. Logging middleware for incoming requests
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// 3. Rate limiting to mitigate brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// 4. Body parser with increased limit for image uploads,
// XSS protection, and MongoDB sanitization
app.use(express.json({ limit: '10mb' }));
app.use(xss());
app.use(mongoSanitize());
app.use(cookieParser());

// 5. CORS configuration
const allowedOrigins = [
  'https://localhost:3001',
  'https://192.168.2.250:3001',
  'https://192.168.2.250:3002'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 6. Static Files Configuration (CRUCIAL FOR IMAGES)
const uploadsDir = path.join(__dirname, 'uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
+      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));




// 7. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/admin', adminRoutes);
// 8. Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 9. SSL Configuration for HTTPS
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert')),
  // For additional security:
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384'
    // Add other secure ciphers as needed
  ].join(':'),
  honorCipherOrder: true
};

// 10. Create and start the HTTPS server
const server = https.createServer(sslOptions, app);
const PORT = 3000;
const HOST = '192.168.2.250'; // Using your specific IP

server.listen(PORT, HOST, () => {
  console.log(`Secure server running on https://${HOST}:${PORT}`);
  console.log(`Serving static files from: ${uploadsDir}`);
});
