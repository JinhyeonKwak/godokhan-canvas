const Pixel = require("../models/Pixel");

const canvasSocket = (io) => {
  io.on("connect", async (socket) => {
    console.log("User connected:", socket.id);

    try {
      // MongoDB에서 캔버스 데이터 불러오기
      const pixels = await Pixel.find({});
      console.log(pixels);

      // 새 클라이언트에게 기존 캔버스 데이터 전송
      socket.emit("init", pixels);
    } catch (error) {
      console.error("Error loading canvas data:", error);
    }

    // 픽셀 색칠 이벤트
    socket.on("drawPixel", async ({ x, y, color }) => {
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
};

module.exports = canvasSocket;
