require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const canvasSocket = require("./sockets/canvasSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());

// MongoDB 연결
connectDB();

// Socket.io 이벤트 핸들러 등록
canvasSocket(io);

// 서버 시작
server.listen(5001, () => {
  console.log("[Server] Running on port 5001");
});

// 서버 종료 시 자원 정리
const cleanUp = async () => {
  console.log("\n[Server] Cleaning up resources...");

  io.close(() => {
    console.log("[Socket.IO] All sockets closed.");
  });

  try {
    await mongoose.disconnect();
    console.log("[MongoDB] Connection closed.");
  } catch (error) {
    console.error("[MongoDB] Error while disconnecting:", error);
  }

  server.close(() => {
    console.log("[Server] HTTP server closed.");
    process.exit(0);
  });
};

// 종료 이벤트 처리
process.on("SIGINT", cleanUp);
process.on("SIGTERM", cleanUp);

module.exports = app;