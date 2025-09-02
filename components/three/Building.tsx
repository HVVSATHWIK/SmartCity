
import React, { useMemo } from 'react';
import { CELL_SIZE } from '../../constants';
import * as THREE from 'three';

interface BuildingProps {
  position: [number, number, number];
}

const Building: React.FC<BuildingProps> = ({ position }) => {
  const height = useMemo(() => 10 + Math.random() * 20, []);
  const color = useMemo(() => {
    const colors = ['#718096', '#a0aec0', '#4a5568'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <mesh
      castShadow
      receiveShadow
      position={[position[0], height / 2, position[2]]}
    >
      <boxGeometry args={[CELL_SIZE * 0.8, height, CELL_SIZE * 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Building;
