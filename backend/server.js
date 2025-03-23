const express=require('express');
const https=require('https');
const fs=require('fs');
const path=require('path');
const authRoutes=require('./routes/auth');

// DB connection
require('./config/dbConfig'); // Ensure dbconfig.js is in the same folder

const app=express();

// Middleware to parse JSON body (important for POST routes)
app.use(express.json());

// Routes
app.use('/api/auth',authRoutes);

// SSL options
const options={
key:fs.readFileSync(path.join(__dirname,'certs','server.key')),
cert:fs.readFileSync(path.join(__dirname,'certs','server.cert'))
};

console.log('SSL Key Path:',path.join(__dirname,'certs','server.key'));
console.log('SSL Cert Path:',path.join(__dirname,'certs','server.cert'));

// Create HTTPS server **with Express app**
const server=https.createServer(options,app);

// Server listen
const IP='0.0.0.0';
const PORT=3000;

server.listen(PORT,IP,()=>{
console.log(`Secure HTTPS server is running on https://${IP}:${PORT}/`);
});
