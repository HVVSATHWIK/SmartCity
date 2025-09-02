import React, { useState } from 'react';
import { getCityAnalysis } from '../services/geminiService';
import { CityGrid, IntersectionController, AirQualityData } from '../types';

interface ControlsProps {
  resetVehicles: () => void;
  grid: CityGrid;
  intersectionControllers: IntersectionController[];
  airQuality: AirQualityData;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);


const Controls: React.FC<ControlsProps> = ({ resetVehicles, grid, intersectionControllers, airQuality }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis('');
    
    const elementCounts = grid.flat().reduce((acc, cell) => {
        acc[cell.type] = (acc[cell.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fix: Ensure pollution values are treated as numbers to prevent type errors.
    const pollutionValues = Object.values(airQuality).map(Number);

    const averagePollution = pollutionValues.length > 0
        ? pollutionValues.reduce((a, b) => a + b, 0) / pollutionValues.length
        : 0;

    const cityData = {
        gridSize: `${grid.length}x${grid[0].length}`,
        elementCounts,
        trafficLightCount: intersectionControllers.reduce((count, ic) => count + ic.cells.length, 0),
        maxPollutionLevel: Math.max(0, ...pollutionValues),
        averagePollution,
    };

    const result = await getCityAnalysis(cityData);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Simulation Controls</h3>
        <button
          onClick={resetVehicles}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
        >
          Reset Vehicles
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-300">AI Analysis</h3>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center disabled:bg-purple-800 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Analyze City Impact'}
        </button>
      </div>
      {analysis && (
        <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <h4 className="font-semibold text-purple-400 mb-1">Analysis Result:</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default Controls;
