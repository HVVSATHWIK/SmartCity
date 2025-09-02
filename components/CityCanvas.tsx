import React from 'react';
import { Canvas } from '@react-three/fiber';
import { MapControls, Text } from '@react-three/drei';
import Ground from './three/Ground';
import { CityGrid, ElementType, Vehicle, IntersectionController, AirQualityData } from '../types';
import Building from './three/Building';
import Road from './three/Road';
import { GRID_SIZE, CELL_SIZE } from '../constants';
import VehicleComponent from './three/Vehicle';
import TrafficLightComponent from './three/TrafficLight';
import AirQualityIndicator from './three/AirQualityIndicator';

interface CityCanvasProps {
  grid: CityGrid;
  vehicles: Vehicle[];
  intersectionControllers: IntersectionController[];
  airQuality: AirQualityData;
}

const CityCanvas: React.FC<CityCanvasProps> = ({ grid, vehicles, intersectionControllers, airQuality }) => {
  const offset = (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2;

  return (
    <Canvas
      camera={{ position: [0, 80, 80], fov: 50 }}
      shadows
      style={{ background: '#1a202c' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[40, 60, 40]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <Ground />

      {grid.map((row, y) =>
        row.map((cell, x) => {
          const pos: [number, number, number] = [
            x * CELL_SIZE - offset,
            0,
            y * CELL_SIZE - offset,
          ];
          switch (cell.type) {
            case ElementType.BUILDING:
              return <Building key={cell.id} position={pos} />;
            case ElementType.ROAD:
            case ElementType.INTERSECTION:
            case ElementType.TRAFFIC_LIGHT:
              return <Road key={cell.id} position={pos} type={cell.type} />;
            default:
              return null;
          }
        })
      )}
      
      {intersectionControllers.map(controller =>
        controller.cells.map(cell => (
            <TrafficLightComponent 
                key={`${controller.id}-${cell.x}-${cell.y}`}
                position={[cell.x * CELL_SIZE - offset, 0, cell.y * CELL_SIZE - offset]}
                state={controller.state}
            />
        ))
      )}
      
      {vehicles.map(vehicle => (
        <VehicleComponent key={vehicle.id} vehicle={vehicle} />
      ))}

      {Object.entries(airQuality).map(([key, value]) => {
          const [x, y] = key.split('-').map(Number);
          return (
              <AirQualityIndicator 
                  key={key} 
                  position={[x * CELL_SIZE - offset, 2, y * CELL_SIZE - offset]}
                  quality={value}
              />
          );
      })}

      <MapControls 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={30}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2.2}
       />
    </Canvas>
  );
};

export default CityCanvas;
