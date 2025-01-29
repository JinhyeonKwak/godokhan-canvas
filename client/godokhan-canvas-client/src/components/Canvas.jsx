import React, { useRef, useState, useEffect } from 'react';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PIXEL_SIZE = 10;

const Canvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useColor("hex", "#000000");
  const [canvasData, setCanvasData] = useState({});
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    socket.on("init", (data) => {
      setCanvasData(data);
      Object.entries(data).forEach(([key, color]) => {
        const [x, y] = key.split('_').map(Number);
        fillPixelAt(x, y, color);
      });
    });

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

    fillPixelAt(x, y, color.hex);
    socket.emit("drawPixel", { x, y, color: color.hex });
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>색상을 선택하세요!</span>
        <div
          style={{
            width: 50,
            height: 50,
            backgroundColor: color.hex,
            border: '3px solid #fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            boxShadow: '0px 4px 6px rgba(255, 0, 0, 0.1)'
          }}
          onClick={() => setShowPicker(!showPicker)}
        />
        {showPicker && (
          <div style={{ position: 'absolute', top: 60, right: 0, zIndex: 4, background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
            <ColorPicker width={300} height={150} color={color} onChange={setColor} hideHSV dark />
          </div>
        )}
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
