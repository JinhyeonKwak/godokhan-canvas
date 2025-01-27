require("dotenv").config();
const express = require("express");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const canvasSocket = require("./sockets/canvasSocket");
const authRoutes = require("./routes/authRoutes");

// MongoDB 연결
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors({
  origin: true,  // 모든 요청 출처 허용 (쿠키 포함 가능)
  credentials: true, // 쿠키 및 인증 정보 허용
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정 (OAuth 로그인용)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// OAuth 라우트 등록
app.use("/auth", authRoutes);

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