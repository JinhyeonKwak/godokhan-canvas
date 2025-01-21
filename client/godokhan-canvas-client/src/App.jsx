import React, { useRef, useState, useEffect } from 'react';

const PixelCanvas = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 캔버스 설정
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [pixelSize, setPixelSize] = useState(10); // 픽셀 크기 조정 가능

  // 브러시 색상
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    // 캔버스 배경을 흰색으로 채우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 격자 선 그리기
    drawGrid();
  }, [width, height, pixelSize]);

  // 격자 그리기 함수
  const drawGrid = () => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // 픽셀 칠하기 함수
  const fillPixel = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize;

    const ctx = ctxRef.current;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
  };

  // 마우스 이벤트 처리
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
        <label>캔버스 크기: </label>
        <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /> x
        <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
      </div>
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

export default PixelCanvas;
