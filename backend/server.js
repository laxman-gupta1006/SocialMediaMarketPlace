const https = require('https');
const fs = require('fs');
const path = require('path');

// Paths to your SSL certificate and key
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')), // Replace with your private key path
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert')), // Replace with your certificate path


};
console.log(path.join(__dirname, 'certs', 'server.key'));
console.log(path.join(__dirname, 'certs', 'server.cert'));
// Create the HTTPS server
const server = https.createServer(options, (req, res) => {
    try {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello, From backend!\n');
      console.log('Response');
    } catch (err) {
      console.error('Error handling request:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });

// Start the server on a specified port

// Define the IP address and port to listen on¯
const IP = '0.0.0.0'; // Allows connections from any network interface
// Replace with the desired IP address
const PORT = 3000;

// Start the server
server.listen(PORT,IP, () => {
  console.log("Secure HTTPS server is running on http://${IP}:${PORT}/");
}); 
