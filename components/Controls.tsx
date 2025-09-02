import React, { useState } from 'react';
import { getPolicyImpactAnalysis } from '../services/geminiService';
import { CityGrid, IntersectionController, AirQualityData, PolicyAnalysisResult } from '../types';

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
  const [analysis, setAnalysis] = useState<PolicyAnalysisResult | string | null>(null);
  const [trafficReduction, setTrafficReduction] = useState(20);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    
    const elementCounts = grid.flat().reduce((acc, cell) => {
        acc[cell.type] = (acc[cell.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pollutionValues = Object.values(airQuality).map(Number);
    const averagePollution = pollutionValues.length > 0
        ? pollutionValues.reduce((a, b) => a + b, 0) / pollutionValues.length
        : 0;

    const cityData = {
        gridSize: `${grid.length}x${grid[0].length}`,
        totalCells: grid.length * grid[0].length,
        roadCellCount: elementCounts['ROAD'] || 0,
        intersectionCellCount: elementCounts['INTERSECTION'] || 0,
        buildingCellCount: elementCounts['BUILDING'] || 0,
        trafficLightControllerCount: intersectionControllers.length,
        currentMaxPollutionLevel: Math.max(0, ...pollutionValues).toFixed(2),
        currentAveragePollution: averagePollution.toFixed(2),
    };
    
    const intervention = {
        trafficReductionPercentage: trafficReduction,
    };

    const result = await getPolicyImpactAnalysis(cityData, intervention);
    setAnalysis(result);
    setIsLoading(false);
  };

  const renderAnalysis = () => {
    if (!analysis) return null;
    if (typeof analysis === 'string') {
         return (
            <div className="mt-4 p-3 bg-red-900/50 rounded-md border border-red-700">
                <h4 className="font-semibold text-red-400 mb-1">Analysis Error:</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{analysis}</p>
            </div>
         )
    }

    return (
        <div className="mt-4 space-y-3 text-sm">
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <h4 className="font-semibold text-cyan-400 mb-1">Predicted AQI Impact</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis.predictedAqiImpact}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <h4 className="font-semibold text-green-400 mb-1">Health Risk Assessment</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis.healthRiskAssessment}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <h4 className="font-semibold text-yellow-400 mb-1">Economic Tradeoffs</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis.economicTradeoffs}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                <h4 className="font-semibold text-purple-400 mb-1">Recommendations</h4>
                <p className="text-gray-300 whitespace-pre-wrap">{analysis.recommendations}</p>
            </div>
        </div>
    )
  }

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
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Policy Simulation Dashboard</h3>
         <div className="space-y-3">
            <label htmlFor="traffic-reduction" className="block text-sm font-medium text-gray-400">
                Traffic Reduction Policy: <span className="font-bold text-white">{trafficReduction}%</span>
            </label>
            <input 
                id="traffic-reduction"
                type="range"
                min="0"
                max="100"
                value={trafficReduction}
                onChange={(e) => setTrafficReduction(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center disabled:bg-purple-800 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner /> : 'Run Causal Analysis'}
        </button>
      </div>
      {renderAnalysis()}
    </div>
  );
};

export default Controls;