import { useState, useMemo, useCallback } from 'react';
import { CITIES } from '../constants';

export const useDashboard = () => {
    const [currentCity, setCurrentCity] = useState<string>('Delhi');
    const [totalRoadLengthKm, setTotalRoadLengthKm] = useState(0);

    const cityConfig = useMemo(() => CITIES[currentCity], [currentCity]);

    const simulationResults = useMemo(() => {
        // Assumption: 1 km of new road adds 20,000 traffic units
        const added_traffic = totalRoadLengthKm * 20000;
        const pm25_increase = added_traffic * cityConfig.causal_coefficient;
        const new_pm25 = cityConfig.base_pm25 + pm25_increase;

        const averted_deaths = -1 * (pm25_increase * cityConfig.mortality_rate) * cityConfig.annual_deaths_baseline;

        const traffic_change_percent = (added_traffic / cityConfig.base_traffic) * 100;
        const gdp_change = -1 * traffic_change_percent * cityConfig.economic_factor;
        
        return {
            new_pm25,
            averted_deaths,
            gdp_change
        };
    }, [totalRoadLengthKm, cityConfig]);

    const selectCity = useCallback((city: string) => {
        if (CITIES[city]) {
            setCurrentCity(city);
            setTotalRoadLengthKm(0); // Reset roads on city change
        }
    }, []);

    return {
        currentCity,
        selectCity,
        cityConfig,
        totalRoadLengthKm,
        setTotalRoadLengthKm,
        simulationResults
    };
};