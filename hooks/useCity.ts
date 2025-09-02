import { useState, useEffect, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import {
  GRID_SIZE,
  CELL_SIZE,
  VEHICLE_COUNT,
  LIGHT_CYCLE_SECONDS,
  POLLUTION_PER_TICK,
  POLLUTION_DECAY,
} from '../constants';
import { CityGrid, ElementType, GridCell, Tool, Vehicle, IntersectionController, LightState, AirQualityData, MapBounds } from '../types';
import { fetchAndParseOsmData } from '../services/osmService';

const createEmptyGrid = (): CityGrid =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      type: ElementType.EMPTY,
      id: `cell-${Math.random()}`,
    }))
  );

const getUpdatedCellType = (grid: CityGrid, x: number, y: number): ElementType => {
    const cell = grid[y][x];
    if (cell.type === ElementType.EMPTY || cell.type === ElementType.BUILDING || cell.type === ElementType.TRAFFIC_LIGHT) {
        return cell.type;
    }

    let roadNeighbors = 0;
    const isRoadLike = (type: ElementType) => [ElementType.ROAD, ElementType.INTERSECTION, ElementType.TRAFFIC_LIGHT].includes(type);

    if (y > 0 && isRoadLike(grid[y - 1][x].type)) roadNeighbors++;
    if (y < GRID_SIZE - 1 && isRoadLike(grid[y + 1][x].type)) roadNeighbors++;
    if (x > 0 && isRoadLike(grid[y][x - 1].type)) roadNeighbors++;
    if (x < GRID_SIZE - 1 && isRoadLike(grid[y][x + 1].type)) roadNeighbors++;

    return roadNeighbors > 2 ? ElementType.INTERSECTION : ElementType.ROAD;
};

export const useCity = () => {
  const [grid, setGrid] = useState<CityGrid>(createEmptyGrid);
  const [tool, setTool] = useState<Tool>(Tool.ROAD);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [intersectionControllers, setIntersectionControllers] = useState<IntersectionController[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityData>({});

  const intersectionControllersRef = useRef(intersectionControllers);
  useEffect(() => {
    intersectionControllersRef.current = intersectionControllers;
  }, [intersectionControllers]);

  const gridRef = useRef(grid);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const findPath = useCallback((start: {x: number, y: number}, maxLength = 100) => {
    const path = [start];
    let current = start;
    let lastDir: {x: number, y: number} | null = null;

    for (let i = 0; i < maxLength; i++) {
        const neighbors = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 }
        ].filter(dir => {
            if (!lastDir) return true;
            return dir.x !== -lastDir.x || dir.y !== -lastDir.y;
        });

        const validMoves = [];
        for (const dir of neighbors) {
            const next = { x: current.x + dir.x, y: current.y + dir.y };
            if (next.x >= 0 && next.x < GRID_SIZE && next.y >= 0 && next.y < GRID_SIZE) {
                const cellType = gridRef.current[next.y][next.x].type;
                if (cellType === ElementType.ROAD || cellType === ElementType.INTERSECTION || cellType === ElementType.TRAFFIC_LIGHT) {
                    validMoves.push({next, dir});
                }
            }
        }

        if (validMoves.length === 0) break;

        const { next, dir } = validMoves[Math.floor(Math.random() * validMoves.length)];
        path.push(next);
        current = next;
        lastDir = dir;
    }
    return path;
  }, []);

  const resetVehicles = useCallback(() => {
    const roadCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x].type === ElementType.ROAD || grid[y][x].type === ElementType.INTERSECTION || grid[y][x].type === ElementType.TRAFFIC_LIGHT) {
          roadCells.push({ x, y });
        }
      }
    }

    if (roadCells.length === 0) {
      setVehicles([]);
      return;
    }

    const newVehicles: Vehicle[] = [];
    for (let i = 0; i < VEHICLE_COUNT; i++) {
      const startCell = roadCells[Math.floor(Math.random() * roadCells.length)];
      const path = findPath(startCell);
      if (path.length > 1) {
        newVehicles.push({
          id: i,
          path,
          pathIndex: 0,
          position: new Vector3(
            startCell.x * CELL_SIZE - (GRID_SIZE * CELL_SIZE) / 2,
            0.2,
            startCell.y * CELL_SIZE - (GRID_SIZE * CELL_SIZE) / 2
          ),
          speed: 0.1 + Math.random() * 0.1,
          color: ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1'][Math.floor(Math.random() * 4)],
        });
      }
    }
    setVehicles(newVehicles);
  }, [grid, findPath]);

  const updateGridElement = (x: number, y: number, newType: ElementType) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({...cell})));
      const oldType = prevGrid[y][x].type;
      newGrid[y][x].type = newType;
      
      for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                newGrid[ny][nx].type = getUpdatedCellType(newGrid, nx, ny);
            }
        }
      }

      if (newType === ElementType.TRAFFIC_LIGHT) {
        setIntersectionControllers(prevControllers => {
          const newCell = { x, y };
          const adjacentControllers = prevControllers.filter(controller =>
            controller.cells.some(cell => Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1)
          );
      
          if (adjacentControllers.length === 0) {
            return [...prevControllers, {
              id: `ic-${x}-${y}-${Date.now()}`,
              cells: [newCell],
              state: LightState.GREEN_NS,
              timer: LIGHT_CYCLE_SECONDS,
            }];
          } else {
            const controllersToMergeIds = new Set(adjacentControllers.map(c => c.id));
            const remainingControllers = prevControllers.filter(c => !controllersToMergeIds.has(c.id));
            
            const allCells = adjacentControllers.flatMap(c => c.cells);
            allCells.push(newCell);
            
            const uniqueCells = [...new Map(allCells.map(item => [JSON.stringify(item), item])).values()];
      
            const mergedController: IntersectionController = {
              id: adjacentControllers[0].id,
              cells: uniqueCells,
              state: adjacentControllers[0].state,
              timer: adjacentControllers[0].timer,
            };
            
            return [...remainingControllers, mergedController];
          }
        });
      } else if (oldType === ElementType.TRAFFIC_LIGHT) {
        setIntersectionControllers(prev =>
            prev
            .map(controller => ({
                ...controller,
                cells: controller.cells.filter(cell => cell.x !== x || cell.y !== y),
            }))
            .filter(controller => controller.cells.length > 0)
        );
      }

      return newGrid;
    });
  };

  const handleCellClick = (x: number, y: number) => {
    let newType: ElementType;
    switch (tool) {
      case Tool.ROAD: newType = ElementType.ROAD; break;
      case Tool.BUILDING: newType = ElementType.BUILDING; break;
      case Tool.TRAFFIC_LIGHT: newType = ElementType.TRAFFIC_LIGHT; break;
      case Tool.ERASER: newType = ElementType.EMPTY; break;
      default: return;
    }
    updateGridElement(x, y, newType);
  };
  
  const generateCityFromMap = async (bounds: MapBounds) => {
      const roadSegments = await fetchAndParseOsmData(bounds);
      const newGrid = createEmptyGrid();

      const minLon = bounds.getWest();
      const maxLon = bounds.getEast();
      const minLat = bounds.getSouth();
      const maxLat = bounds.getNorth();
      
      const lonToX = (lon: number) => Math.floor(((lon - minLon) / (maxLon - minLon)) * (GRID_SIZE - 1));
      const latToY = (lat: number) => Math.floor(((maxLat - lat) / (maxLat - minLat)) * (GRID_SIZE - 1));

      // Draw roads using Bresenham's line algorithm
      const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
          let dx = Math.abs(x1 - x0);
          let dy = Math.abs(y1 - y0);
          let sx = (x0 < x1) ? 1 : -1;
          let sy = (y0 < y1) ? 1 : -1;
          let err = dx - dy;

          while(true) {
              if (x0 >= 0 && x0 < GRID_SIZE && y0 >= 0 && y0 < GRID_SIZE) {
                  newGrid[y0][x0].type = ElementType.ROAD;
              }
              if ((x0 === x1) && (y0 === y1)) break;
              let e2 = 2 * err;
              if (e2 > -dy) { err -= dy; x0 += sx; }
              if (e2 < dx) { err += dx; y0 += sy; }
          }
      };

      roadSegments.forEach(seg => {
          const x1 = lonToX(seg.start.lon);
          const y1 = latToY(seg.start.lat);
          const x2 = lonToX(seg.end.lon);
          const y2 = latToY(seg.end.lat);
          drawLine(x1, y1, x2, y2);
      });
      
      // Second pass: identify intersections
      const gridWithIntersections = newGrid.map(row => row.map(cell => ({...cell})));
      for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
              gridWithIntersections[y][x].type = getUpdatedCellType(gridWithIntersections, x, y);
          }
      }

      // Third pass: add buildings
      for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
              if (gridWithIntersections[y][x].type === ElementType.EMPTY) {
                  let isNextToRoad = false;
                  for (let i = -1; i <= 1; i++) {
                      for (let j = -1; j <= 1; j++) {
                          if (i === 0 && j === 0) continue;
                          const nx = x + i;
                          const ny = y + j;
                          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                              const neighborType = gridWithIntersections[ny][nx].type;
                              if (neighborType === ElementType.ROAD || neighborType === ElementType.INTERSECTION) {
                                  isNextToRoad = true;
                                  break;
                              }
                          }
                      }
                      if (isNextToRoad) break;
                  }
                  if (isNextToRoad && Math.random() < 0.5) {
                      gridWithIntersections[y][x].type = ElementType.BUILDING;
                  }
              }
          }
      }

      setGrid(gridWithIntersections);
      setIntersectionControllers([]);
      setAirQuality({});
  }

  useEffect(() => {
    const timer = setInterval(() => {
        setIntersectionControllers(prev => prev.map(controller => {
            const newTimer = controller.timer - 1;
            if (newTimer <= 0) {
                return {
                    ...controller,
                    timer: LIGHT_CYCLE_SECONDS,
                    state: controller.state === LightState.GREEN_NS ? LightState.GREEN_EW : LightState.GREEN_NS
                };
            }
            return {...controller, timer: newTimer};
        }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(resetVehicles, [grid]);
  
  // Game loop for vehicle movement and air quality
  useEffect(() => {
    let animationFrameId: number;
    const gameLoop = () => {
      setVehicles(prevVehicles => {
        const newAirQuality = {...airQuality};
        
        // Decay pollution
        for(const key in newAirQuality) {
            newAirQuality[key] *= POLLUTION_DECAY;
            if (newAirQuality[key] < 0.1) delete newAirQuality[key];
        }

        const updatedVehicles = prevVehicles.map(v => {
          if (!v.path || v.path.length <= v.pathIndex + 1) return v;

          const currentPos = v.position;
          const targetNode = v.path[v.pathIndex + 1];
          const targetPos = new Vector3(
            targetNode.x * CELL_SIZE - (GRID_SIZE * CELL_SIZE) / 2,
            0.2,
            targetNode.y * CELL_SIZE - (GRID_SIZE * CELL_SIZE) / 2
          );

          const dir = targetPos.clone().sub(currentPos).normalize();
          const distance = currentPos.distanceTo(targetPos);
          
          let isStopped = false;

          const controller = intersectionControllersRef.current.find(ic =>
            ic.cells.some(cell => cell.x === targetNode.x && cell.y === targetNode.y)
          );
          if (controller && distance < CELL_SIZE / 2) {
              const fromNode = v.path[v.pathIndex];
              const moveVertical = targetNode.y !== fromNode.y;
              if (moveVertical && controller.state === LightState.GREEN_EW) isStopped = true;
              if (!moveVertical && controller.state === LightState.GREEN_NS) isStopped = true;
          }
          
          if(isStopped) {
            const aqKey = `${targetNode.x}-${targetNode.y}`;
            newAirQuality[aqKey] = (newAirQuality[aqKey] || 0) + POLLUTION_PER_TICK;
            return v;
          }

          if (distance < v.speed) {
            return { ...v, pathIndex: v.pathIndex + 1, position: targetPos };
          } else {
            const newPosition = currentPos.clone().add(dir.multiplyScalar(v.speed));
            return { ...v, position: newPosition };
          }
        });
        
        setAirQuality(newAirQuality);
        return updatedVehicles;
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);


  return { grid, tool, setTool, handleCellClick, resetVehicles, vehicles, intersectionControllers, airQuality, generateCityFromMap };
};