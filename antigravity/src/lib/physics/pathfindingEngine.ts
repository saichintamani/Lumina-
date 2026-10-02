/**
 * A* Pathfinding Engine for Lunar Surface Navigation
 * ====================================================
 * Implements grid-based A* pathfinding on a discretized lunar surface.
 * Hazard zones (steep slopes, PSRs, boulders) are encoded as high-cost cells.
 * The output path is projected back to 3D sphere coordinates for visualization.
 */

export interface GridCell {
  x: number;
  y: number;
  cost: number;       // Movement cost (1 = flat, 100 = impassable)
  isHazard: boolean;
  hazardType?: 'SLOPE' | 'PSR' | 'BOULDER' | 'CRATER_RIM';
}

interface PathNode {
  x: number;
  y: number;
  g: number;  // Cost from start
  h: number;  // Heuristic to goal
  f: number;  // g + h
  parent: PathNode | null;
}

export interface PathResult {
  path: [number, number, number][];   // 3D coordinates on sphere
  totalCost: number;
  hazardsAvoided: number;
  distanceKm: number;
  computeTimeMs: number;
}

const GRID_SIZE = 40;
const MOON_RADIUS = 1.48; // Match our 3D model

// Generate a procedural hazard map for the Faustini Crater region
function generateHazardGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Seed-based pseudo-random for consistent terrain
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const noise = seed - Math.floor(seed);
      
      let cost = 1;
      let isHazard = false;
      let hazardType: GridCell['hazardType'] = undefined;

      // Crater rim (ring pattern)
      const cx = x - GRID_SIZE / 2;
      const cy = y - GRID_SIZE / 2;
      const distFromCenter = Math.sqrt(cx * cx + cy * cy);
      
      // Inner crater (steep slopes)
      if (distFromCenter > 12 && distFromCenter < 15) {
        cost = 80;
        isHazard = true;
        hazardType = 'CRATER_RIM';
      }
      
      // Permanently Shadowed Regions (PSR) - center of crater
      if (distFromCenter < 6 && noise > 0.5) {
        cost = 60;
        isHazard = true;
        hazardType = 'PSR';
      }

      // Random boulders
      if (noise > 0.88 && !isHazard) {
        cost = 50;
        isHazard = true;
        hazardType = 'BOULDER';
      }
      
      // Steep slopes (scattered)
      if (noise > 0.78 && noise <= 0.88 && !isHazard) {
        cost = 30;
        isHazard = true;
        hazardType = 'SLOPE';
      }

      row.push({ x, y, cost, isHazard, hazardType });
    }
    grid.push(row);
  }
  
  return grid;
}

// Heuristic: Euclidean distance
function heuristic(a: PathNode, bx: number, by: number): number {
  return Math.sqrt((a.x - bx) ** 2 + (a.y - by) ** 2);
}

// Convert grid coordinates to 3D sphere position
function gridTo3D(gx: number, gy: number): [number, number, number] {
  // Map grid (0..GRID_SIZE) to a small region on the south pole of our moon sphere
  // lat: -80° to -90° (south pole region), lon: 20° to 40°
  const latDeg = -80 - (gy / GRID_SIZE) * 10;
  const lonDeg = 20 + (gx / GRID_SIZE) * 20;
  
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  
  const x = MOON_RADIUS * Math.cos(lat) * Math.sin(lon);
  const y = MOON_RADIUS * Math.sin(lat);
  const z = MOON_RADIUS * Math.cos(lat) * Math.cos(lon);
  
  return [x, y, z];
}

// A* Pathfinding
export function findPath(
  startGrid: [number, number],
  goalGrid: [number, number]
): PathResult {
  const startTime = performance.now();
  const grid = generateHazardGrid();
  
  const [sx, sy] = startGrid;
  const [gx, gy] = goalGrid;

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  
  const startNode: PathNode = {
    x: sx, y: sy,
    g: 0,
    h: heuristic({ x: sx, y: sy } as PathNode, gx, gy),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  let hazardsAvoided = 0;
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [-1, 1], [1, -1], [-1, -1]  // 8-directional
  ];

  while (openSet.length > 0) {
    // Find lowest f-cost node
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    const key = `${current.x},${current.y}`;
    if (closedSet.has(key)) continue;
    closedSet.add(key);

    // Goal reached
    if (current.x === gx && current.y === gy) {
      const path: [number, number, number][] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(gridTo3D(node.x, node.y));
        node = node.parent;
      }
      
      const computeTimeMs = performance.now() - startTime;
      
      return {
        path,
        totalCost: current.g,
        hazardsAvoided,
        distanceKm: path.length * 0.125, // Each grid cell ~125m
        computeTimeMs
      };
    }

    // Explore neighbors
    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
      if (closedSet.has(`${nx},${ny}`)) continue;
      
      const cell = grid[ny][nx];
      
      // Skip truly impassable terrain
      if (cell.cost >= 80) {
        if (cell.isHazard) hazardsAvoided++;
        continue;
      }
      
      const moveCost = cell.cost * (dx !== 0 && dy !== 0 ? 1.414 : 1); // Diagonal penalty
      const g = current.g + moveCost;
      const h = heuristic({ x: nx, y: ny } as PathNode, gx, gy);
      
      openSet.push({
        x: nx, y: ny,
        g, h, f: g + h,
        parent: current
      });
    }
  }

  // No path found — return straight line
  return {
    path: [gridTo3D(sx, sy), gridTo3D(gx, gy)],
    totalCost: -1,
    hazardsAvoided: 0,
    distanceKm: 0,
    computeTimeMs: performance.now() - startTime
  };
}

// Export hazard grid for visualization
export { generateHazardGrid, gridTo3D, GRID_SIZE };
