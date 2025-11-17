import { randomChoice, randomInt } from "@/lib/utilities";
import { CityCell, CityForegroundElement, CityFeature } from "./city-types";

export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 12;
export const WALKER_COUNT = 14;

function chooseBuildingColor(): string {
  const opacity = 0.8;
  return randomChoice([
    `rgba(148, 163, 184, ${opacity})`,
    `rgba(203, 213, 245, ${opacity})`,
    `rgba(241, 245, 249, ${opacity})`,
    `rgba(245, 203, 213, ${opacity})`,
  ]);
}

export const getRoadNeighbors = (basemap: CityCell[][], x: number, y: number) => {
  // Looks up right, down right, down left, up left
  const neighbors: { x: number; y: number }[] = [];
  const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      ny >= 0 &&
      nx < GRID_WIDTH &&
      ny < GRID_HEIGHT &&
      basemap[ny][nx].feature === "road"
    ) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
};

function createGrove(
  x: number,
  y: number
): { background: CityCell; foreground: CityForegroundElement } {
  return {
    background: { feature: "grove" },
    foreground: {
      feature: "grove",
      x,
      y,
      groveCount: Math.floor(Math.random() * 2) + 1,
      height: 14 + Math.random() * 6,
    },
  };
}

function createPark(): CityCell {
  return { feature: "park" };
}

function createFountain(
  x: number,
  y: number
): { background: CityCell; foreground: CityForegroundElement } {
  return {
    background: { feature: "fountain" },
    foreground: { feature: "fountain", x, y, fountainAnimations: [] },
  };
}

function createBuilding(
  x: number,
  y: number,
  height: number
): { background: CityCell; foreground: CityForegroundElement } {
  return {
    background: { feature: "building" },
    foreground: { feature: "building", x, y, height, color: chooseBuildingColor() },
  };
}

function createRoad(): CityCell {
  return { feature: "road" };
}

export const generateCity = () => {
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);
  const basemap: CityCell[][] = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => ({
      feature: "park" as CityFeature,
    }))
  );
  const foreground: CityForegroundElement[] = [];
  let fountainCount = 0;

  const primaryAvenueX = centerX + randomInt(-2, 1);
  const primaryAvenueY = centerY + randomInt(-2, 1);
  const secondaryAvenuesX = [
    randomInt(0, primaryAvenueX - 3),
    randomInt(0, primaryAvenueX - 3),
    randomInt(primaryAvenueX + 3, GRID_WIDTH - 1),
    randomInt(primaryAvenueX + 3, GRID_WIDTH - 1),
  ];
  const secondaryAvenuesY = [
    randomInt(0, primaryAvenueY - 3),
    randomInt(0, primaryAvenueY - 3),
    randomInt(primaryAvenueY + 3, GRID_HEIGHT - 1),
    randomInt(primaryAvenueY + 3, GRID_HEIGHT - 1),
  ];

  // Generate the city cells
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const distanceToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
      const isPrimaryAvenue = x === primaryAvenueX || y === primaryAvenueY;
      const isSecondaryRoad =
        (x === secondaryAvenuesX[0] && y < primaryAvenueY) ||
        (x === secondaryAvenuesX[1] && y > primaryAvenueY) ||
        (x === secondaryAvenuesX[2] && y < primaryAvenueY) ||
        (x === secondaryAvenuesX[3] && y > primaryAvenueY) ||
        (y === secondaryAvenuesY[0] && x < primaryAvenueX) ||
        (y === secondaryAvenuesY[1] && x > primaryAvenueX) ||
        (y === secondaryAvenuesY[2] && x < primaryAvenueX) ||
        (y === secondaryAvenuesY[3] && x > primaryAvenueX);

      if (isPrimaryAvenue || isSecondaryRoad) {
        basemap[y][x] = createRoad();
        continue;
      }

      if (distanceToCenter <= 4 && Math.random() > 0.75) {
        const element = createBuilding(x, y, 75 + Math.random() * 90);
        basemap[y][x] = element.background;
        foreground.push(element.foreground);
      } else if (distanceToCenter > 4 && Math.random() > 0.8) {
        const element = createBuilding(x, y, 40 + Math.random() * 40);
        basemap[y][x] = element.background;
        foreground.push(element.foreground);
      } else if (Math.random() > 0.4) {
        basemap[y][x] = createPark();
      } else if (Math.random() > 0.9 && fountainCount < 5) {
        const element = createFountain(x, y);
        basemap[y][x] = element.background;
        foreground.push(element.foreground);
        fountainCount += 1;
      } else {
        const element = createGrove(x, y);
        basemap[y][x] = element.background;
        foreground.push(element.foreground);
      }
    }
  }

  // Prune roads that are not connected to any other road
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (basemap[y][x].feature === "road") {
        const neighbors = getRoadNeighbors(basemap, x, y);
        if (neighbors.length === 0) {
          basemap[y][x] = createPark();
        } else if (neighbors.length === 1) {
          basemap[y][x].roadType = "dead-end";
          if (neighbors[0].x === x) {
            if (neighbors[0].y < y) {
              basemap[y][x].roadOrientation = "top-right";
            } else {
              basemap[y][x].roadOrientation = "bottom-left";
            }
          } else if (neighbors[0].y === y) {
            if (neighbors[0].x < x) {
              basemap[y][x].roadOrientation = "top-left";
            } else {
              basemap[y][x].roadOrientation = "bottom-right";
            }
          }
        } else if (neighbors.length === 2) {
          if (neighbors[0].x === neighbors[1].x || neighbors[0].y === neighbors[1].y) {
            basemap[y][x].roadType = "through-road";
            if (neighbors[0].x === x) {
              basemap[y][x].roadOrientation = "top-right";
            } else {
              basemap[y][x].roadOrientation = "bottom-right";
            }
          } else {
            basemap[y][x].roadType = "turn-only";
            if (neighbors[0].x > x && neighbors[0].y === y) {
              basemap[y][x].roadOrientation = "bottom-right";
            } else if (
              neighbors[0].x - 1 === neighbors[1].x &&
              neighbors[0].y === neighbors[1].y - 1
            ) {
              basemap[y][x].roadOrientation = "top-left";
            } else if (neighbors[0].y < y && neighbors[0].x === x) {
              basemap[y][x].roadOrientation = "top-right";
            } else if (neighbors[0].y > y && neighbors[0].x === x) {
              basemap[y][x].roadOrientation = "bottom-left";
            }
          }
        } else if (neighbors.length === 3) {
          basemap[y][x].roadType = "three-way-intersection";
          const hasTwoXNeighbors = neighbors.filter((n) => n.x === x).length === 2;

          if (hasTwoXNeighbors) {
            const thirdNeighbor = neighbors.find((n) => n.x !== x && n.y === y);
            if (thirdNeighbor?.x && thirdNeighbor.x > x) {
              basemap[y][x].roadOrientation = "bottom-right";
            } else {
              basemap[y][x].roadOrientation = "top-left";
            }
          } else {
            const thirdNeighbor = neighbors.find((n) => n.y !== y && n.x === x);
            if (thirdNeighbor?.y && thirdNeighbor.y > y) {
              basemap[y][x].roadOrientation = "bottom-left";
            } else {
              basemap[y][x].roadOrientation = "top-right";
            }
          }
        } else if (neighbors.length === 4) {
          basemap[y][x].roadType = "four-way-intersection";
          basemap[y][x].roadOrientation = "top-right";
        }
      }
    }
  }

  return { basemap, foreground };
};
