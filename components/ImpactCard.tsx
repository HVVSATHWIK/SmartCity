import React from 'react';

interface ImpactCardProps {
    title: string;
    value: string;
    unit: string;
    color: 'blue' | 'yellow';
}

const colorSchemes = {
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        title: 'text-blue-900',
        value: 'text-blue-800',
        unit: 'text-blue-700'
    },
    yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        title: 'text-yellow-900',
        value: 'text-yellow-800',
        unit: 'text-yellow-700'
    }
};

const ImpactCard: React.FC<ImpactCardProps> = ({ title, value, unit, color }) => {
    const scheme = colorSchemes[color];
    return (
        <div className={`${scheme.bg} border-l-4 ${scheme.border} p-4 rounded-lg mb-6`}>
            <h3 className={`text-lg font-semibold ${scheme.title}`}>{title}</h3>
            <p className={`text-2xl font-bold ${scheme.value}`}>{value}</p>
            <p className={`text-sm ${scheme.unit}`}>{unit}</p>
        </div>
    );
};

export default ImpactCard;