
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const marketplaceRoutes = require('./routes/marketplace');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('./config/dbConfig');
require('dotenv').config();



const messagesRoutes = require('./routes/messages'); // Import messages routes [for routing messages added by deepankar]



const app = express();

// 1. Logging middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

// 2. Body parser & cookies
app.use(express.json({ limit: '10mb' })); // Increased for image uploads
app.use(cookieParser());

// 3. CORS Configuration
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

// 4. Static Files Configuration (CRUCIAL FOR IMAGES)
const uploadsDir = path.join(__dirname, 'uploads');
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files with proper caching and security headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Cache control (1 day for images)
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// for routing messages added by deepankar
app.use('/api/messages', messagesRoutes); // Register messages API

// 6. Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 7. SSL Configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert')),
  // For additional security:
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    // Add other secure ciphers as needed
  ].join(':'),
  honorCipherOrder: true
};

// 8. HTTPS Server
const server = https.createServer(sslOptions, app);
const PORT = 3000;
const HOST = 'localhost'; // Using your specific IP

server.listen(PORT, HOST, () => {
  console.log(`Secure server running on https://${HOST}:${PORT}`);
  console.log(`Serving static files from: ${uploadsDir}`);
});