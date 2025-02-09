require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const canvasSocket = require("./sockets/canvasSocket");
const authRoutes = require("./routes/authRoutes");

// MongoDB 연결
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true, // 쿠키 전송을 위해 필수
  }
});

app.use(cors({
  origin: "http://localhost:5173",
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
    cookie: { 
      httpOnly: true, // XSS 공격 방지
      secure: false, // https 환경에서는 true로 설정
      maxAge: 1000 * 60 * 60 * 24 // 1일 동안 유지
    },
  })
);

// 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
})

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