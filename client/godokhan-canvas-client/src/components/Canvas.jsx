import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    socket.on("drawPixel", ({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    return () => {
      socket.off("drawPixel");
    };
  }, []);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default Canvas;