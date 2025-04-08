// socket.js
const { Server } = require("socket.io");

let ioInstance = null;

function initSocket(server, allowedOrigins) {
  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    },
    path: '/socket.io',  // Make sure this matches your client configuration
    transports: ['websocket', 'polling']  // Explicitly define transports
  });

  ioInstance.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`✅ Socket ${socket.id} joined chat room ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      console.log(`🚪 Socket ${socket.id} left chat room ${chatId}`);
    });

    socket.on("newMessage", (chatId) => {
      if (!chatId) return;
      console.log(`📨 Broadcasting message signal for chat ${chatId}`);
      socket.to(chatId).emit("newMessage", chatId);  // ✅ Just emit chatId
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized! Call initSocket() first.");
  }
  return ioInstance;
}

module.exports = { initSocket, getIO };
