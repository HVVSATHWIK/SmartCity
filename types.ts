// Fix: By importing '@react-three/fiber', we enable automatic JSX namespace augmentation.
// This resolves errors like "Property 'mesh' does not exist on type 'JSX.IntrinsicElements'"
// for all react-three-fiber components.
import '@react-three/fiber';

export interface CityData {
    lat: number;
    lng: number;
    zoom: number;
    base_pm25: number;
    base_traffic: number;
    causal_coefficient: number;
    economic_factor: number;
    mortality_rate: number;
    annual_deaths_baseline: number;
}

export interface Cities {
    [key: string]: CityData;
}

// For Gemini response
export interface RoadParameters {
    length_km: number;
    orientation: 'north' | 'south' | 'east' | 'west';
}

export interface GeminiDesignResponse {
    action: "add_road";
    parameters: RoadParameters;
}

// Fix: Add missing type definitions for services/osmService.ts
export interface MapBounds {
    getSouth: () => number;
    getWest: () => number;
    getNorth: () => number;
    getEast: () => number;
}

export interface OsmNode {
    type: 'node';
    id: number;
    lat: number;
    lon: number;
}

export interface OsmWay {
    type: 'way';
    id: number;
    nodes: number[];
}

export type OsmElement = OsmNode | OsmWay;

export interface OsmData {
    elements: OsmElement[];
}

export interface RoadSegment {
    start: { lat: number, lon: number };
    end: { lat: number, lon: number };
}

// Fix: Add missing type definition for components/three/Road.tsx
export enum ElementType {
    ROAD,
    INTERSECTION,
    TRAFFIC_LIGHT,
    EMPTY,
    BUILDING,
}

// Fix: Add missing type definition for components/three/Vehicle.tsx
export interface Vehicle {
    position: [number, number, number];
    color: string;
}

// Fix: Add missing type definition for components/three/TrafficLight.tsx
export enum LightState {
    GREEN_NS,
    GREEN_EW,
}