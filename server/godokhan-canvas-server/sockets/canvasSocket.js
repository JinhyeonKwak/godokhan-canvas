const Pixel = require("../models/Pixel");

const canvasSocket = (io) => {
  io.on("connect", async (socket) => {
    console.log("User connected:", socket.id);

    try {
      // 사용자가 접속하면 기존 픽셀 데이터를 자동으로 전송
      const pixels = await Pixel.find({}).populate("user");
      socket.emit("init", pixels);
    } catch (error) {
      console.error("Error loading canvas data:", error);
    }

    socket.on("drawPixel", async ({ x, y, color, user }) => {
      try {
        await Pixel.findOneAndUpdate(
          { x, y },
          { color, user },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error("Error saving pixel:", error);
      }

      // 모든 클라이언트에게 브로드캐스트
      socket.broadcast.emit("drawPixel", { x, y, color, user });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = canvasSocket;
