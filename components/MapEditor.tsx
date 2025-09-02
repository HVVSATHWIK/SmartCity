import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw';
import { CityData, RoadParameters } from '../types';

interface MapEditorProps {
    cityConfig: CityData;
    onRoadsChange: (length: number) => void;
}

// A component to recenter the map when the city changes
const MapRecenter: React.FC<{ cityConfig: CityData }> = ({ cityConfig }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([cityConfig.lat, cityConfig.lng], cityConfig.zoom);
    }, [cityConfig, map]);
    return null;
};

const MapEditor = forwardRef(({ cityConfig, onRoadsChange }: MapEditorProps, ref) => {
    const featureGroupRef = useRef<L.FeatureGroup>(null);
    // Fix: Add state to hold map instance to avoid accessing protected property '_map'
    const [map, setMap] = useState<L.Map | null>(null);

    const calculateTotalRoadLength = () => {
        let totalMeters = 0;
        featureGroupRef.current?.eachLayer(layer => {
            if (layer instanceof L.Polyline) {
                const latlngs = layer.getLatLngs() as L.LatLng[];
                for (let i = 0; i < latlngs.length - 1; i++) {
                    totalMeters += latlngs[i].distanceTo(latlngs[i + 1]);
                }
            }
        });
        onRoadsChange(totalMeters / 1000);
    };

    const handleCreate = (e: any) => {
        featureGroupRef.current?.addLayer(e.layer);
        calculateTotalRoadLength();
    };

    const handleEdit = () => {
        calculateTotalRoadLength();
    };
    
    const handleDelete = () => {
        calculateTotalRoadLength();
    };

    useImperativeHandle(ref, () => ({
        resetMap() {
            featureGroupRef.current?.clearLayers();
            calculateTotalRoadLength();
        },
        addRoad(params: RoadParameters) {
            const { length_km, orientation } = params;
            // Fix: Access map instance from state instead of protected property '_map'
            if (!length_km || !orientation || !featureGroupRef.current || !map) return;
            
            const cityCenter = map.getCenter();
            const meters = length_km * 1000;
            
            const latOffset = (orientation === 'north') ? (meters / 111000) : (orientation === 'south') ? (-meters / 111000) : 0;
            const lngOffset = (orientation === 'east') ? (meters / (111000 * Math.cos(cityCenter.lat * Math.PI / 180))) : (orientation === 'west') ? (-meters / (111000 * Math.cos(cityCenter.lat * Math.PI / 180))) : 0;

            const startPoint = L.latLng(cityCenter.lat - latOffset/2, cityCenter.lng - lngOffset/2);
            const endPoint = L.latLng(cityCenter.lat + latOffset/2, cityCenter.lng + lngOffset/2);
            
            const newRoad = L.polyline([startPoint, endPoint], {
                color: '#16a34a',
                weight: 5,
                dashArray: '10, 5'
            });
            
            featureGroupRef.current.addLayer(newRoad);
            map.fitBounds(newRoad.getBounds().pad(0.2));
            calculateTotalRoadLength();
        }
    }));

    // Fix: Component to get map instance via useMap hook and set it to state
    const MapInstanceController = () => {
        const mapInstance = useMap();
        useEffect(() => {
            setMap(mapInstance);
        }, [mapInstance]);
        return null;
    }
    
    return (
        <div className="w-full rounded-lg border-2 border-gray-200 shadow-inner overflow-hidden">
            <MapContainer center={[cityConfig.lat, cityConfig.lng]} zoom={cityConfig.zoom} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreate}
                        onEdited={handleEdit}
                        onDeleted={handleDelete}
                        draw={{
                            polygon: false,
                            marker: false,
                            circle: false,
                            circlemarker: false,
                            rectangle: false,
                            polyline: {
                                shapeOptions: {
                                    color: '#e53e3e',
                                    weight: 4
                                }
                            }
                        }}
                    />
                </FeatureGroup>
                <MapRecenter cityConfig={cityConfig} />
                <MapInstanceController />
            </MapContainer>
        </div>
    );
});

export default MapEditor;