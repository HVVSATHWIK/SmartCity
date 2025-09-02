import React, { useState } from 'react';
import { getDesignFromPrompt } from '../services/geminiService';
import { RoadParameters } from '../types';

interface GeminiAssistantProps {
    onAddRoad: (params: RoadParameters) => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
);

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onAddRoad }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async () => {
        if (!prompt) {
            setStatus("Please enter a design instruction.");
            return;
        }
        setIsLoading(true);
        setStatus("Analyzing request...");

        const result = await getDesignFromPrompt(prompt);

        if (typeof result === 'string') {
            setStatus(`Error: ${result}`);
        } else if (result.action === 'add_road') {
            onAddRoad(result.parameters);
            setStatus(`Successfully added a ${result.parameters.length_km}km road.`);
        } else {
            setStatus("Received an unknown instruction from the AI assistant.");
        }
        
        setIsLoading(false);
    };

    return (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 mr-2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                Design Assistant (Powered by Gemini)
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Add a 10km expressway going east'" 
                    className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                    {isLoading ? <Spinner /> : 'Generate Design'}
                </button>
            </div>
             <p className="text-sm text-gray-500 mt-2 h-5">{status}</p>
        </div>
    );
};

export default GeminiAssistant;