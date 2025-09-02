
import React from 'react';
import { GRID_SIZE } from '../constants';
import { CityGrid, ElementType, Tool } from '../types';

interface MapEditorProps {
  grid: CityGrid;
  handleCellClick: (x: number, y: number) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
}

const toolIcons: Record<Tool, string> = {
    [Tool.ROAD]: '─',
    [Tool.BUILDING]: 'B',
    [Tool.TRAFFIC_LIGHT]: '🚦',
    [Tool.ERASER]: '⌫',
}

const toolColors: Record<Tool, string> = {
    [Tool.ROAD]: 'hover:bg-gray-600 ring-gray-400',
    [Tool.BUILDING]: 'hover:bg-blue-600 ring-blue-400',
    [Tool.TRAFFIC_LIGHT]: 'hover:bg-yellow-600 ring-yellow-400',
    [Tool.ERASER]: 'hover:bg-red-600 ring-red-400',
};

const cellColors: Record<ElementType, string> = {
    [ElementType.EMPTY]: 'bg-gray-700 hover:bg-gray-600',
    [ElementType.ROAD]: 'bg-gray-500',
    [ElementType.BUILDING]: 'bg-blue-500',
    [ElementType.INTERSECTION]: 'bg-gray-600',
    [ElementType.TRAFFIC_LIGHT]: 'bg-yellow-500 flex items-center justify-center text-xs',
};

const MapEditor: React.FC<MapEditorProps> = ({ grid, handleCellClick, tool, setTool }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
        <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Editor Tools</h3>
            <div className="grid grid-cols-4 gap-2">
                {Object.values(Tool).map(t => (
                    <button 
                        key={t}
                        onClick={() => setTool(t)}
                        className={`p-2 rounded-md transition-all duration-200 text-lg font-bold
                            ${tool === t ? 'ring-2 ring-offset-2 ring-offset-gray-800 ' + toolColors[t].split(' ')[2] : 'bg-gray-700 ' + toolColors[t]} `}
                        title={t.charAt(0) + t.slice(1).toLowerCase()}
                    >
                        {toolIcons[t]}
                    </button>
                ))}
            </div>
        </div>

      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`}}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              className={`aspect-square cursor-pointer transition-colors duration-150 ${cellColors[cell.type]}`}
            >
              {cell.type === ElementType.TRAFFIC_LIGHT && '🚦'}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MapEditor;
