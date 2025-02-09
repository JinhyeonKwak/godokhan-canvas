const Pixel = require("../models/Pixel");
const User = require("../models/User");

// 사용자별 마지막 요청 시간을 저장할 Map
const userLastRequestMap = new Map();

const canvasSocket = (io) => {
    // 인증 미들웨어
    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) {
                return next(new Error('Authentication error'));
            }

            const parsedCookies = parseCookies(cookies);
            const sessionId = parsedCookies['connect.sid'];
            if (!sessionId) {
                return next(new Error('Invalid session'));
            }

            socket.sessionId = sessionId;
            next();
        } catch (err) {
            console.error(err);
            next(new Error('Invalid token'));
        }
    });

    io.on("connect", async (socket) => {
        console.log("User connected:", socket.id);

        try {
            const pixels = await Pixel.find({}).populate("user");
            socket.emit("init", pixels);
        } catch (error) {
            console.error("Error loading canvas data:", error);
        }

        // drawPixel 이벤트 핸들러
        socket.on("drawPixel", async (data) => {
            try {
                // 처리율 제한 검사
                const canProceed = await checkRateLimit(socket);
                if (!canProceed) {
                    return; // 제한에 걸리면 여기서 종료
                }

                const {x, y, color, user} = data;
                const findUser = await User.findById(user.id);

                const updatedPixel = await Pixel.findOneAndUpdate(
                  {x, y},
                  {color, user: findUser._id},
                  {upsert: true, new: true}
                ).populate("user");

                // 모든 클라이언트에게 브로드캐스트
                io.emit("drawPixel", updatedPixel); // socket.emit 대신 io.emit 사용
            } catch (error) {
                console.error("Error processing pixel:", error);
                socket.emit('error', {
                    code: 'INTERNAL_ERROR',
                    message: '픽셀 처리 중 오류가 발생했습니다.'
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

// 처리율 제한 검사 함수
const checkRateLimit = async (socket) => {
    try {
        const sessionId = socket.sessionId;
        if (!sessionId) {
            socket.emit('error', {
                code: 'AUTH_ERROR',
                message: '인증이 필요합니다.'
            });
            return false;
        }

        const now = Date.now();
        const lastRequest = userLastRequestMap.get(sessionId) || 0;
        const timeElapsed = now - lastRequest;

        if (timeElapsed < 60000) {
            const remainingTime = Math.ceil((60000 - timeElapsed) / 1000);
            socket.emit('error', {
                code: 'RATE_LIMIT',
                message: `다음 요청까지 ${remainingTime}초 남았습니다.`
            });
            return false;
        }

        userLastRequestMap.set(sessionId, now);
        return true;
    } catch (error) {
        console.error('[Rate Limit] Error:', error);
        socket.emit('error', {
            code: 'INTERNAL_ERROR',
            message: '서버 오류가 발생했습니다.'
        });
        return false;
    }
};

// 주기적인 정리 작업
setInterval(() => {
    const now = Date.now();
    userLastRequestMap.forEach((lastRequest, sessionId) => {
        if (now - lastRequest > 60000) {
            userLastRequestMap.delete(sessionId);
        }
    });
}, 60000);

const parseCookies = (cookies) => {
    return cookies.split(';')
      .map(v => v.split('='))
      .reduce((acc, v) => {
          acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
          return acc;
      }, {});
};

module.exports = canvasSocket;