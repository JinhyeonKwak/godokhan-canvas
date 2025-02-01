const Pixel = require("../models/Pixel");
const User = require("../models/User");

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

        socket.on("drawPixel", async ({x, y, color, user}) => {
            try {
                const findUser = await User.findById(user.id);

                await Pixel.findOneAndUpdate(
                    {x, y},
                    {color, user: findUser._id},
                    {upsert: true, new: true}
                );
            } catch (error) {
                console.error("Error saving pixel:", error);
            }

            await Pixel.findOne({x, y}, (err, pixel) =>
                // 모든 클라이언트에게 브로드캐스트
                socket.broadcast.emit("drawPixel", pixel))
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

module.exports = canvasSocket;
