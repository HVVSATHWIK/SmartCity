import { Vector3 } from 'three';

export enum ElementType {
  EMPTY = 'EMPTY',
  ROAD = 'ROAD',
  BUILDING = 'BUILDING',
  INTERSECTION = 'INTERSECTION',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
}

export interface GridCell {
  type: ElementType;
  id: string;
}

export type CityGrid = GridCell[][];

export enum Tool {
  ROAD = 'ROAD',
  BUILDING = 'BUILDING',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  ERASER = 'ERASER',
}

export enum LightState {
  GREEN_NS = 'GREEN_NS', // North-South
  GREEN_EW = 'GREEN_EW', // East-West
}

export interface IntersectionController {
  id: string;
  cells: { x: number; y: number }[];
  state: LightState;
  timer: number;
}

export interface Vehicle {
    id: number;
    position: Vector3;
    path: {x: number, y: number}[];
    pathIndex: number;
    speed: number;
    color: string;
}

export interface AirQualityData {
  [key: string]: number; // key is `${x}-${y}`
}

// Minimal interface for Leaflet's LatLngBounds
export interface MapBounds {
  getSouth: () => number;
  getWest: () => number;
  getNorth: () => number;
  getEast: () => number;
}

// Types for parsing OpenStreetMap data from Overpass API
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
  tags?: { [key: string]: string };
}

export type OsmElement = OsmNode | OsmWay;

export interface OsmData {
  elements: OsmElement[];
}

export interface RoadSegment {
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
}