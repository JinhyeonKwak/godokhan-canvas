const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // CORS 허용
});

let canvasData = {}; // 색칠된 픽셀 데이터 저장

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 새 클라이언트에게 현재 캔버스 데이터 전송
  socket.emit("init", canvasData);

  socket.on("draw", ({ x, y, color }) => {
    canvasData[`${x}_${y}`] = color; // 색칠 정보 저장

    // 모든 클라이언트에게 브로드캐스트 (본인 제외)
    socket.broadcast.emit("draw", { x, y, color });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Socket.IO server running on port 5000");
});
