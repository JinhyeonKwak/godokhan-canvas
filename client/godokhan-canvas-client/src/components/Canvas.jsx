import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element is not available.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context.");
      return;
    }

    socket.on("drawPixel", ({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    return () => {
      socket.off("drawPixel");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{ border: "1px solid black" }} // 가시성을 위해 테두리 추가
    />
  );
};

export default Canvas;
