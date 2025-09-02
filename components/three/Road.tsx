
import React from 'react';
import { CELL_SIZE } from '../../constants';
import { ElementType } from '../../types';

interface RoadProps {
  position: [number, number, number];
  type: ElementType;
}

const roadColors: Record<ElementType, string> = {
    [ElementType.ROAD]: '#4a5568',
    [ElementType.INTERSECTION]: '#2d3748',
    [ElementType.TRAFFIC_LIGHT]: '#2d3748',
    [ElementType.EMPTY]: '', // Not used
    [ElementType.BUILDING]: '', // Not used
}

const Road: React.FC<RoadProps> = ({ position, type }) => {
  return (
    <mesh receiveShadow position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
      <meshStandardMaterial color={roadColors[type]} />
    </mesh>
  );
};

export default Road;
