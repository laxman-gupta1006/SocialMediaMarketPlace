const express=require('express');
const https=require('https');
const fs=require('fs');
const path=require('path');
const authRoutes=require('./routes/auth');
const usersRoutes=require('./routes/users')
const cookieParser=require('cookie-parser');
const cors=require('cors');
require('./config/dbConfig');

const app=express();

// Logging middleware
app.use((req,res,next)=>{
const now=new Date().toISOString();
console.log(`[${now}] ${req.method} ${req.originalUrl}`);
next();
});

// Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Updated CORS Configuration
const allowedOrigins=['https://localhost:3001','https://192.168.2.250:3001','https://192.168.2.250:3002']; // ✅ USE HTTPS frontend origin
app.use(cors({
  origin:function(origin,callback){
    if(!origin||allowedOrigins.includes(origin)) callback(null,true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials:true
}));


// Routes
app.use('/api/auth',authRoutes);
app.use('/api/users',usersRoutes);

// ✅ SSL Certificates
const options={
  key:fs.readFileSync(path.join(__dirname,'certs','server.key')),
  cert:fs.readFileSync(path.join(__dirname,'certs','server.cert'))
};

const server=https.createServer(options,app);
const IP='0.0.0.0';
const PORT=3000;

server.listen(PORT,IP,()=>{
  console.log(`Secure HTTPS server is running on https://${IP}:${PORT}/`);
});
