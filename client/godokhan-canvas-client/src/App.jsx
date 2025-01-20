import React, { useState } from "react";

const GRID_SIZE = 50; // 그리드 크기 (50x50)
const PIXEL_SIZE = 12; // 픽셀 크기 (각 셀의 크기)
const DEFAULT_COLORS = ["#FFFFFF", "#FF4136", "#0074D9", "#2ECC40", "#FFDC00", "#111111"]; // 기본 색상

function App() {
  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill("#FFFFFF"))
  );
  const [selectedColor, setSelectedColor] = useState("#111111"); // 기본 색상 (검은색)
  const [isDrawing, setIsDrawing] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  // 특정 좌표 색상 변경
  const updateGrid = (x, y) => {
    const newGrid = [...grid];
    newGrid[x][y] = selectedColor;
    setGrid(newGrid);
  };

  // 마우스 클릭하면 색칠 시작
  const handleMouseDown = (x, y) => {
    updateGrid(x, y);
    setIsDrawing(true);
  };

  // 마우스 이동 중이면 계속 색칠
  const handleMouseEnter = (x, y) => {
    if (isDrawing) updateGrid(x, y);
  };

  // 마우스를 떼면 드래그 종료
  const handleMouseUp = () => setIsDrawing(false);

  // 사용자가 RGB 색상 입력
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setCustomColor(newColor);
    setSelectedColor(newColor);
  };

  return (
    <div className="container" onMouseUp={handleMouseUp}>
      <h1 className="title">🎨 r/Place Clone</h1>

      {/* 색상 선택 */}
      <div className="color-picker">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className="color-btn"
            style={{ backgroundColor: color, border: selectedColor === color ? "3px solid black" : "none" }}
          />
        ))}
        {/* RGB 색상 입력 */}
        <input
          type="color"
          value={customColor}
          onChange={handleColorChange}
          className="color-input"
        />
      </div>

      {/* 캔버스 */}
      <div className="canvas">
        {grid.flat().map((color, index) => {
          const x = Math.floor(index / GRID_SIZE);
          const y = index % GRID_SIZE;
          return (
            <div
              key={index}
              onMouseDown={() => handleMouseDown(x, y)}
              onMouseEnter={() => handleMouseEnter(x, y)}
              className="pixel"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
