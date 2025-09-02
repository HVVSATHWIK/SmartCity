
import React from 'react';
import { Html } from '@react-three/drei';

interface AirQualityIndicatorProps {
  position: [number, number, number];
  quality: number;
}

const getQualityColor = (quality: number) => {
    if (quality < 5) return 'text-green-400';
    if (quality < 10) return 'text-yellow-400';
    return 'text-red-400';
}

const AirQualityIndicator: React.FC<AirQualityIndicatorProps> = ({ position, quality }) => {
  if (quality < 1) return null;

  return (
    <Html position={position} center>
      <div className="bg-gray-900 bg-opacity-70 p-1.5 rounded-md text-center pointer-events-none">
        <div className="text-xs font-semibold text-white">AQI</div>
        <div className={`text-sm font-bold ${getQualityColor(quality)}`}>
            {quality.toFixed(1)}
        </div>
      </div>
    </Html>
  );
};

export default AirQualityIndicator;
