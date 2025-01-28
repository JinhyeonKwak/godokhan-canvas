import React, { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:5001"); // 서버 주소

const Canvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pixelSize, setPixelSize] = useState(10);
  const [color, setColor] = useState('#000000');
  const [canvasData, setCanvasData] = useState({});

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
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
    for (let x = 0; x < 800; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
  };

  const fillPixelAt = (x, y, color) => {
    const ctx = ctxRef.current;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
  };

  const fillPixel = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize;

    fillPixelAt(x, y, color);
    socket.emit("drawPixel", { x, y, color }); // 서버로 전송
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    fillPixel(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    fillPixel(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <label>픽셀 크기: </label>
        <input type="number" value={pixelSize} min="1" onChange={(e) => setPixelSize(Number(e.target.value))} />
      </div>
      <div>
        <label>브러시 색상: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', cursor: 'pointer' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Canvas;