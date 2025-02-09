import React, {useRef, useState, useEffect} from 'react';
import {ColorPicker, useColor} from 'react-color-palette';
import {useAuth} from "../context/AuthProvider";
import {io} from 'socket.io-client';
import 'react-color-palette/css';
import PixelHistory from "./PixelHistory.jsx";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PIXEL_SIZE = 10;

const Canvas = () => {
  const [socket, setSocket] = useState(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [pixelData, setPixelData] = useState({});
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [color, setColor] = useColor("hex", "#ff0000");
  const [showPicker, setShowPicker] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const {user} = useAuth();

  // 소켓 연결 설정
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false // 수동으로 연결 제어
    });

    // 연결 이벤트 핸들러
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // 소켓 연결
    newSocket.connect();
    setSocket(newSocket);

    // 클린업 함수
    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.close();
      }
    };
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {
    if (!socket) return;

    socket.on("init", (pixels) => {
      setIsCanvasReady(true); // 캔버스가 준비되었음을 표시
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctxRef.current = ctx;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid();

        const data = {};
        pixels.forEach(pixel => {
          data[`${pixel.x}_${pixel.y}`] = pixel;
          fillPixelAt(pixel.x, pixel.y, pixel.color);
        });
        setPixelData(data);
      });
    });

    socket.on("drawPixel", (pixel) => {
      setPixelData(prevState => ({
        ...prevState,
        [`${pixel.x}_${pixel.y}`]: pixel
      }));
      fillPixelAt(pixel.x, pixel.y, pixel.color);
    });

    socket.on('error', (error) => {
      if (error.code === 'RATE_LIMIT') {
        alert(error.message);
      } else {
        console.error('Socket error:', error);
      }
    });

    return () => {
      socket.off("init");
      socket.off("drawPixel");
      socket.off("error");
      socket.close();
    };
  }, [socket]);

  const drawGrid = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
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
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
  };

  const fillPixel = (e) => {
    if (!isCanvasReady || !socket) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;

    socket.emit("drawPixel", {x, y, color: color.hex, user: user});
  };

  const handleMouseMove = (e) => {
    if (!isCanvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;

    setHoveredPixel({x, y});
  };

  const handleMouseLeave = () => {
    setHoveredPixel(null);
  };

  return (
    <div style={{textAlign: 'center', position: 'relative'}}>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{fontSize: '14px', fontWeight: 'bold', color: '#333'}}>색상을 선택하세요!</span>
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
          <div style={{
            position: 'absolute',
            top: 60,
            right: 0,
            zIndex: 4,
            background: 'white',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <ColorPicker width={300} height={150} color={color} onChange={setColor} hideHSV dark/>
          </div>
        )}
      </div>
      {isCanvasReady ? (
        <>
          <canvas
            ref={canvasRef}
            style={{border: '1px solid black', cursor: 'pointer'}}
            onClick={fillPixel}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          <PixelHistory hoveredPixel={hoveredPixel} pixelData={pixelData}/>
        </>

      ) : (
        <p>캔버스를 불러오는 중...</p>
      )}
    </div>
  );
};

export default Canvas;