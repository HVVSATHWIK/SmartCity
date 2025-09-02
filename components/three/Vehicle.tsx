
import React from 'react';
import { Vehicle } from '../../types';

interface VehicleComponentProps {
  vehicle: Vehicle;
}

const VehicleComponent: React.FC<VehicleComponentProps> = ({ vehicle }) => {
  return (
    <mesh castShadow position={vehicle.position}>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color={vehicle.color} />
    </mesh>
  );
};

export default VehicleComponent;
