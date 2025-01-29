import React, { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600
const PIXEL_SIZE = 10;

const Canvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [canvasData, setCanvasData] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // 서버에서 초기 캔버스 데이터 받기
    socket.on("init", (data) => {
      setCanvasData(data);
      Object.entries(data).forEach(([key, color]) => {
        const [x, y] = key.split('_').map(Number);
        fillPixelAt(x, y, color);
      });
    });

    // 서버에서 픽셀 업데이트 받기
    socket.on("drawPixel", ({ x, y, color }) => {
      fillPixelAt(x, y, color);
    });

    return () => {
      socket.off("init");
      socket.off("drawPixel");
    };
  }, []);

  const drawGrid = () => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_WIDTH; x += PIXEL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += PIXEL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
  };

  const fillPixelAt = (x, y, color) => {
    const ctx = ctxRef.current;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
  };

  const fillPixel = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;

    fillPixelAt(x, y, color);
    socket.emit("drawPixel", { x, y, color }); // 서버로 전송
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <label>브러시 색상: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', cursor: 'pointer' }}
        onClick={fillPixel}
      />
    </div>
  );
};

export default Canvas;