import React from 'react';

const PixelHistory = ({ hoveredPixel, pixelData }) => {
    if (!hoveredPixel) return null;
    if (pixelData[hoveredPixel.x + '_' + hoveredPixel.y] === undefined) return null;

    return (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <h3>픽셀 히스토리 (X: {hoveredPixel.x}, Y: {hoveredPixel.y})</h3>
            <strong>{pixelData[`${hoveredPixel.x}_${hoveredPixel.y}`].user.nickname}</strong> - {pixelData[`${hoveredPixel.x}_${hoveredPixel.y}`].color} ({new Date(pixelData[`${hoveredPixel.x}_${hoveredPixel.y}`].createdAt).toLocaleString()})
        </div>
    );
};

export default PixelHistory;
