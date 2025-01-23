const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // CORS 허용
});

app.use(cors());

// MongoDB 연결
const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}`;
mongoose.connect(mongoURI);

// MongoDB Schema 및 Model 정의
const pixelSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  color: String,
});

const Pixel = mongoose.model("pixels", pixelSchema);

io.on("connect", async (socket) => {
  console.log("User connected:", socket.id);

  // MongoDB에서 캔버스 데이터 불러오기
  try {
    const pixels = await Pixel.find({});
    const canvasData = {};
    pixels.forEach(({ x, y, color }) => {
      canvasData[`${x}_${y}`] = color;
    });

    // 새 클라이언트에게 기존 캔버스 데이터 전송
    socket.emit("init", canvasData);
  } catch (error) {
    console.error("Error loading canvas data:", error);
  }

  // 픽셀 색칠 이벤트
  socket.on("drawPixel", async ({ x, y, color }) => {
    const pixelKey = `${x}_${y}`;
    
    // DB에 해당 좌표의 픽셀이 이미 존재하면 업데이트, 없으면 새로 저장
    try {
      await Pixel.findOneAndUpdate(
        { x, y },
        { color },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error saving pixel:", error);
    }

    // 모든 클라이언트에게 전송 (본인 제외)
    socket.broadcast.emit("drawPixel", { x, y, color });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5001, () => {
  console.log("Socket.IO server running on port 5001");
});

// 서버 종료 시 소켓 & DB 정리
const cleanUp = async () => {
  console.log("\n[Server] Cleaning up resources...");

  // 모든 소켓 연결 해제
  io.close(() => {
    console.log("[Socket.IO] All sockets closed.");
  });

  // MongoDB 연결 해제
  try {
    await mongoose.disconnect();
    console.log("[MongoDB] Connection closed.");
  } catch (error) {
    console.error("[MongoDB] Error while disconnecting:", error);
  }

  // 서버 종료
  serverInstance.close(() => {
    console.log("[Server] HTTP server closed.");
    process.exit(0);
  });
};

// 종료 이벤트 처리
process.on("SIGINT", cleanUp);  // Ctrl + C
process.on("SIGTERM", cleanUp); // 종료 신호 (예: PM2, Docker 등)

module.exports = app;