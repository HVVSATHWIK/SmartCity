import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapBounds } from '../types';

interface MapImporterProps {
    onBuildCity: (bounds: MapBounds) => void;
    isLoading: boolean;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// A component to get the map instance
const MapController: React.FC<{ setMap: (map: any) => void }> = ({ setMap }) => {
    const map = useMap();
    setMap(map);
    return null;
};

const MapImporter: React.FC<MapImporterProps> = ({ onBuildCity, isLoading }) => {
    const [map, setMap] = useState<any>(null);

    const handleBuildClick = () => {
        if (map) {
            onBuildCity(map.getBounds());
        }
    };

    return (
        <div className="relative h-screen w-screen">
            <MapContainer center={[37.7749, -122.4194]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController setMap={setMap} />
            </MapContainer>
            <div className="absolute top-0 left-0 right-0 z-[1000] p-6 bg-gradient-to-b from-gray-900/80 to-transparent">
                <div className="max-w-xl mx-auto bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-cyan-400/30">
                    <h1 className="text-3xl font-bold text-center text-cyan-400 mb-2">Build Your Smart City</h1>
                    <p className="text-gray-300 text-center mb-6">Pan and zoom the map to select an area, then click the button to generate the 3D city.</p>
                    <button
                        onClick={handleBuildClick}
                        disabled={isLoading || !map}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-lg disabled:bg-cyan-800 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {isLoading ? <Spinner /> : 'Build City From This View'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapImporter;
