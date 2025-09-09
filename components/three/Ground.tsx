

// Fix: Import '@react-three/fiber' to extend JSX namespace for three.js elements.
import '@react-three/fiber';
import React from 'react';
import { GRID_SIZE, CELL_SIZE } from '../../constants';

const Ground: React.FC = () => {
  const size = GRID_SIZE * CELL_SIZE;
  return (
    <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#2d3748" />
    </mesh>
  );
};

export default Ground;