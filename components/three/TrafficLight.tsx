
import React from 'react';
import { LightState } from '../../types';
import * as THREE from 'three';

interface TrafficLightProps {
  position: [number, number, number];
  state: LightState;
}

const TrafficLightComponent: React.FC<TrafficLightProps> = ({ position, state }) => {
    const red = new THREE.Color("red");
    const green = new THREE.Color("green");
    const grey = new THREE.Color("grey");

  return (
    <group position={position}>
        {/* NS Lights */}
        <mesh position={[0, 2, 2.3]}>
            <boxGeometry args={[0.5,1,0.5]}/>
            <meshStandardMaterial color={state === LightState.GREEN_NS ? green : red}/>
        </mesh>
        <mesh position={[0, 2, -2.3]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[0.5,1,0.5]}/>
            <meshStandardMaterial color={state === LightState.GREEN_NS ? green : red}/>
        </mesh>
        {/* EW Lights */}
        <mesh position={[2.3, 2, 0]} rotation={[0, -Math.PI/2, 0]}>
            <boxGeometry args={[0.5,1,0.5]}/>
            <meshStandardMaterial color={state === LightState.GREEN_EW ? green : red}/>
        </mesh>
        <mesh position={[-2.3, 2, 0]} rotation={[0, Math.PI/2, 0]}>
            <boxGeometry args={[0.5,1,0.5]}/>
            <meshStandardMaterial color={state === LightState.GREEN_EW ? green : red}/>
        </mesh>
    </group>
  );
};

export default TrafficLightComponent;
