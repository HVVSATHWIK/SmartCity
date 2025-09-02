import React, { useState } from 'react';
import CityCanvas from './components/CityCanvas';
import Controls from './components/Controls';
import MapEditor from './components/MapEditor';
import { useCity } from './hooks/useCity';
import MapImporter from './components/MapImporter';
import { MapBounds } from './types';

export default function App() {
  const cityData = useCity();
  const [isCityBuilt, setIsCityBuilt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuildCity = async (bounds: MapBounds) => {
    setIsLoading(true);
    try {
      await cityData.generateCityFromMap(bounds);
      setIsCityBuilt(true);
    } catch (error) {
        alert("Failed to build city. The selected area might be too large or there was a network error. Please try a smaller area.");
        console.error("Error building city:", error);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isCityBuilt) {
    return <MapImporter onBuildCity={handleBuildCity} isLoading={isLoading} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
      <div className="w-[380px] h-full flex flex-col border-r border-gray-700 bg-gray-800 p-4 space-y-4 overflow-y-auto">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400">3D Smart City Simulator</h1>
          <p className="text-sm text-gray-400">Design, Simulate, Analyze</p>
        </header>
        <MapEditor {...cityData} />
        <Controls {...cityData} />
      </div>
      <main className="flex-1 h-full">
        <CityCanvas {...cityData} />
      </main>
    </div>
  );
}