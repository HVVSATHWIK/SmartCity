import React, { useRef } from 'react';
import { useDashboard } from '../hooks/useCity';
import { CITIES } from '../constants';
import MapEditor from './MapEditor';
import ImpactCard from './ImpactCard';
import Pm25Chart from './CityCanvas';
import GeminiAssistant from './Controls';
import { RoadParameters } from '../types';

export interface MapEditorHandle {
  resetMap: () => void;
  addRoad: (params: RoadParameters) => void;
}

export default function UrbanDesignDashboard() {
    const {
        currentCity,
        selectCity,
        cityConfig,
        setTotalRoadLengthKm,
        simulationResults
    } = useDashboard();
    
    const mapRef = useRef<MapEditorHandle>(null);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        selectCity(e.target.value);
        mapRef.current?.resetMap();
    };
    
    const handleResetRoads = () => {
        mapRef.current?.resetMap();
    };

    const addRoadFromAI = (params: RoadParameters) => {
        mapRef.current?.addRoad(params);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Smart City Policy Simulator</h1>
                <p className="text-lg text-gray-600 mt-2">An interactive dashboard for urban planning and causal impact analysis.</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">City Design Canvas</h2>
                    <div className="mb-6">
                        <label htmlFor="city-selector" className="block text-sm font-medium text-gray-700 mb-2">Select City:</label>
                        <select id="city-selector" value={currentCity} onChange={handleCityChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            {Object.keys(CITIES).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>

                    <MapEditor 
                        ref={mapRef}
                        cityConfig={cityConfig} 
                        onRoadsChange={setTotalRoadLengthKm} 
                    />
                    
                    <div className="flex justify-end mt-2">
                        <button onClick={handleResetRoads} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">Reset Roads</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Causal Outcomes</h2>
                    <ImpactCard
                        title="Health Impact"
                        value={simulationResults.averted_deaths.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        unit="Annual Deaths Averted"
                        color="blue"
                    />
                    <ImpactCard
                        title="Economic Tradeoff"
                        value={`${simulationResults.gdp_change.toFixed(2)}%`}
                        unit="Estimated GDP Reduction"
                        color="yellow"
                    />
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">PM2.5 Levels (µg/m³)</h3>
                        <Pm25Chart base={cityConfig.base_pm25} current={simulationResults.new_pm25} />
                    </div>
                </div>
            </main>
            
            <GeminiAssistant onAddRoad={addRoadFromAI} />
        </div>
    );
}