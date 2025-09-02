import { Cities } from './types';

export const CITIES: Cities = {
    'Delhi': {
        lat: 28.6139,
        lng: 77.2090,
        zoom: 11,
        base_pm25: 153.0,
        base_traffic: 8.5e7,
        causal_coefficient: 4.7e-7, // Effect of 1 unit of traffic on PM2.5
        economic_factor: 0.0051, // % GDP loss per % traffic reduction
        mortality_rate: 0.01 / 10, // Dose-response mortality
        annual_deaths_baseline: 150000
    },
    'Bangalore': {
        lat: 12.9716,
        lng: 77.5946,
        zoom: 12,
        base_pm25: 85.0,
        base_traffic: 4.2e7,
        causal_coefficient: 1.1e-7,
        economic_factor: 0.0035,
        mortality_rate: 0.01 / 10,
        annual_deaths_baseline: 80000
    }
};

// Fix: Add missing constants for components/three/* files
export const GRID_SIZE = 20;
export const CELL_SIZE = 5;
