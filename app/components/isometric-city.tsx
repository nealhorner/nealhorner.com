"use client";

import { useEffect, useRef } from "react";

type CityFeature = "road" | "park" | "grove" | "midrise" | "tower";

type RoadType =
  | "four-way-intersection"
  | "three-way-intersection"
  | "turn-only"
  | "through-road"
  | "dead-end";
type RoadOrientation = "top-right" | "bottom-right" | "bottom-left" | "top-left";

type CityCell = {
  feature: CityFeature;
  height?: number;
  roadType?: RoadType;
  roadOrientation?: RoadOrientation;
};

type Walker = {
  id: number;
  path: {
    x: number;
    y: number;
  };
  next: {
    x: number;
    y: number;
  };
  progress: number;
  speed: number;
  direction: 1 | -1;
  trail: TrailDot[];
  color: string;
};

type TrailDot = {
  x: number;
  y: number;
  life: number;
};

const GRID_WIDTH = 12;
const GRID_HEIGHT = 12;
const TILE_WIDTH = 88;
const TILE_HEIGHT = 44;
const WALKER_COUNT = 14;
const EDGE_CENTER_OFFSET_X = TILE_WIDTH / 4;
const EDGE_CENTER_OFFSET_Y = TILE_HEIGHT / 4;

const WALKER_COLORS = ["#38bdf8", "#f97316", "#a855f7", "#34d399", "#facc15", "#fb7185"];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const seedRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
};

const generateCity = () => {
  const rand = seedRandom(1337);
  const centerX = Math.floor(GRID_WIDTH / 2);
  const centerY = Math.floor(GRID_HEIGHT / 2);
  const city: CityCell[][] = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => ({
      feature: "park" as CityFeature,
    }))
  );

  // Generate the city cells
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const distanceToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
      const isPrimaryAvenue = x === centerX || y === centerY || x === 2 || x === GRID_WIDTH - 3;
      const isSecondaryRoad = (x % 3 === 0 || y % 4 === 0) && distanceToCenter >= 2;
      const roll = rand();

      if (isPrimaryAvenue || (isSecondaryRoad && roll > 0.5)) {
        city[y][x] = { feature: "road" };
        continue;
      }

      if (distanceToCenter <= 4 && roll > 0.6) {
        const height = 75 + rand() * 90;
        city[y][x] = { feature: "tower", height };
      } else if (distanceToCenter > 4 && roll > 0.9) {
        const height = 60 + rand() * 90;
        city[y][x] = { feature: "tower", height };
      } else if (roll > 0.6) {
        const height = 35 + rand() * 60;
        city[y][x] = { feature: "midrise", height };
      } else if (roll > 0.4) {
        city[y][x] = { feature: "park" };
      } else {
        city[y][x] = { feature: "grove" };
      }
    }
  }

  // Prune roads that are not connected to any other road
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (city[y][x].feature === "road") {
        const neighbors = getRoadNeighbors(city, x, y);
        if (neighbors.length === 0) {
          city[y][x] = { feature: "park" };
        } else if (neighbors.length === 1) {
          city[y][x].roadType = "dead-end";
          if (neighbors[0].x === x) {
            if (neighbors[0].y < y) {
              city[y][x].roadOrientation = "top-right";
            } else {
              city[y][x].roadOrientation = "bottom-left";
            }
          } else if (neighbors[0].y === y) {
            if (neighbors[0].x < x) {
              city[y][x].roadOrientation = "top-left";
            } else {
              city[y][x].roadOrientation = "bottom-right";
            }
          }
        } else if (neighbors.length === 2) {
          if (neighbors[0].x === neighbors[1].x || neighbors[0].y === neighbors[1].y) {
            city[y][x].roadType = "through-road";
            if (neighbors[0].x === x) {
              city[y][x].roadOrientation = "top-right";
            } else {
              city[y][x].roadOrientation = "bottom-right";
            }
          } else {
            city[y][x].roadType = "turn-only";
            if (neighbors[0].x > x && neighbors[0].y === y) {
              city[y][x].roadOrientation = "bottom-right";
            } else if (neighbors[0].x < x && neighbors[0].y === y) {
              city[y][x].roadOrientation = "top-left";
            } else if (neighbors[0].y < y && neighbors[0].x === x) {
              city[y][x].roadOrientation = "top-right";
            } else if (neighbors[0].y > y && neighbors[0].x === x) {
              city[y][x].roadOrientation = "bottom-left";
            }
          }
        } else if (neighbors.length === 3) {
          city[y][x].roadType = "three-way-intersection";
          const hasTwoXNeighbors = neighbors.filter((n) => n.x === x).length === 2;

          if (hasTwoXNeighbors) {
            const thirdNeighbor = neighbors.find((n) => n.x !== x && n.y === y);
            if (thirdNeighbor?.x && thirdNeighbor.x > x) {
              city[y][x].roadOrientation = "bottom-right";
            } else {
              city[y][x].roadOrientation = "top-left";
            }
          } else {
            const thirdNeighbor = neighbors.find((n) => n.y !== y && n.x === x);
            if (thirdNeighbor?.y && thirdNeighbor.y > y) {
              city[y][x].roadOrientation = "bottom-left";
            } else {
              city[y][x].roadOrientation = "top-right";
            }
          }
        } else if (neighbors.length === 4) {
          city[y][x].roadType = "four-way-intersection";
          city[y][x].roadOrientation = "top-right";
        }
      }
    }
  }

  return city;
};

const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
};

const getRoadNeighbors = (city: CityCell[][], x: number, y: number) => {
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
      city[ny][nx].feature === "road"
    ) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
};

const tileTop = (x: number, y: number, originX: number, originY: number) => ({
  x: originX + (x - y) * (TILE_WIDTH / 2),
  y: originY + (x + y) * (TILE_HEIGHT / 2),
});

const tileCenter = (x: number, y: number, originX: number, originY: number) => {
  const top = tileTop(x, y, originX, originY);
  return {
    x: top.x,
    y: top.y + TILE_HEIGHT / 2,
  };
};

const tileEdgeCenter = (x: number, y: number, orientation: RoadOrientation) => {
  switch (orientation) {
    case "top-right":
      return {
        x: x + EDGE_CENTER_OFFSET_X,
        y: y - EDGE_CENTER_OFFSET_Y,
      };
    case "bottom-right":
      return {
        x: x + EDGE_CENTER_OFFSET_X,
        y: y + EDGE_CENTER_OFFSET_Y,
      };
    case "bottom-left":
      return {
        x: x - EDGE_CENTER_OFFSET_X,
        y: y + EDGE_CENTER_OFFSET_Y,
      };
    case "top-left":
      return {
        x: x - EDGE_CENTER_OFFSET_X,
        y: y - EDGE_CENTER_OFFSET_Y,
      };
  }
};

const drawDiamond = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillStyle: string | CanvasGradient,
  strokeStyle?: string
) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
  ctx.lineTo(x, y + TILE_HEIGHT);
  ctx.lineTo(x - TILE_WIDTH / 2, y + TILE_HEIGHT / 2);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
};

const drawBuilding = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  baseColor: string
) => {
  const topY = y - height;
  const top = [
    { x, y: topY },
    { x: x + TILE_WIDTH / 2, y: topY + TILE_HEIGHT / 2 },
    { x, y: topY + TILE_HEIGHT },
    { x: x - TILE_WIDTH / 2, y: topY + TILE_HEIGHT / 2 },
  ];

  const leftFace = [
    { x, y: y + TILE_HEIGHT },
    { x: x - TILE_WIDTH / 2, y: y + TILE_HEIGHT / 2 },
    { x: x - TILE_WIDTH / 2, y: y + TILE_HEIGHT / 2 - height },
    { x, y: topY + TILE_HEIGHT },
  ];

  const rightFace = [
    { x, y: y + TILE_HEIGHT },
    { x: x + TILE_WIDTH / 2, y: y + TILE_HEIGHT / 2 },
    { x: x + TILE_WIDTH / 2, y: y + TILE_HEIGHT / 2 - height },
    { x, y: topY + TILE_HEIGHT },
  ];

  const parseRGBA = (color: string) => {
    const c = String(color).replace(/[^0-9,.]/gi, "");
    const [r, g, b, a] = c.split(",");
    return {
      r: parseInt(r),
      g: parseInt(g),
      b: parseInt(b),
      a: parseFloat(a),
    };
  };

  const lighten = (rgba: string, lightnessMultiplier: number) => {
    const { r, g, b, a } = parseRGBA(rgba);
    const clampChannel = (channel: number) =>
      clamp(Math.round(channel + channel * lightnessMultiplier), 0, 255);

    return `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${a})`;
  };

  ctx.beginPath();
  ctx.moveTo(leftFace[0].x, leftFace[0].y);
  for (let i = 1; i < leftFace.length; i += 1) {
    ctx.lineTo(leftFace[i].x, leftFace[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = lighten(baseColor, -0.2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rightFace[0].x, rightFace[0].y);
  for (let i = 1; i < rightFace.length; i += 1) {
    ctx.lineTo(rightFace[i].x, rightFace[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = lighten(baseColor, -0.33);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(top[0].x, top[0].y);
  for (let i = 1; i < top.length; i += 1) {
    ctx.lineTo(top[i].x, top[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = baseColor;
  ctx.fill();
};

const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, rand: () => number) => {
  const height = 14 + rand() * 6;
  const trunkHeight = height * 0.45;

  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x + 2, y);
  ctx.lineTo(x + 1, y - trunkHeight);
  ctx.lineTo(x - 1, y - trunkHeight);
  ctx.closePath();
  ctx.fill();

  const canopyRadius = 9 + rand() * 4;
  const gradient = ctx.createRadialGradient(
    x,
    y - trunkHeight - canopyRadius * 0.4,
    canopyRadius * 0.2,
    x,
    y - trunkHeight - canopyRadius * 0.4,
    canopyRadius
  );
  gradient.addColorStop(0, "rgba(74, 222, 128, 0.9)");
  gradient.addColorStop(1, "rgba(22, 163, 74, 0.7)");

  ctx.beginPath();
  ctx.arc(x, y - trunkHeight - canopyRadius * 0.4, canopyRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
};

const createWalkers = (city: CityCell[][], originX: number, originY: number) => {
  const rand = seedRandom(9876);
  const roadTiles: { x: number; y: number }[] = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (city[y][x].feature === "road") {
        roadTiles.push({ x, y });
      }
    }
  }

  return Array.from({ length: WALKER_COUNT }, (_, idx) => {
    const start = roadTiles[Math.floor(rand() * roadTiles.length)];
    const neighbors = getRoadNeighbors(city, start.x, start.y);
    const next = neighbors[Math.floor(rand() * neighbors.length)] ?? start;
    const center = tileCenter(start.x, start.y, originX, originY);
    return {
      id: idx,
      path: { ...start },
      next: { ...next },
      progress: rand(),
      speed: 0.45 + rand() * 0.65,
      direction: rand() > 0.5 ? 1 : -1,
      trail: [
        {
          x: center.x,
          y: center.y,
          life: 1,
        },
      ],
      color: WALKER_COLORS[idx % WALKER_COLORS.length],
    } satisfies Walker;
  });
};

const renderWalkers = (ctx: CanvasRenderingContext2D, walkers: Walker[]) => {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const walker of walkers) {
    for (let i = walker.trail.length - 1; i >= 0; i -= 1) {
      const dot = walker.trail[i];
      ctx.globalAlpha = dot.life * 0.6;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = walker.color;
      ctx.fill();
    }

    const head = walker.trail[0];
    if (head) {
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = walker.color;
      ctx.fill();
    }
  }

  ctx.restore();
};

const drawRoadDetails = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  roadType: RoadType,
  roadOrientation: RoadOrientation
) => {
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.setLineDash([4, 6]);

  if (roadType === "four-way-intersection") {
    const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "top-right");
    ctx.moveTo(x1, y1);
    const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "bottom-left");
    ctx.lineTo(x2, y2);
    const { x: x3, y: y3 } = tileEdgeCenter(centerX, centerY, "bottom-right");
    ctx.moveTo(x3, y3);
    const { x: x4, y: y4 } = tileEdgeCenter(centerX, centerY, "top-left");
    ctx.lineTo(x4, y4);
  } else if (roadType === "three-way-intersection") {
    if (roadOrientation === "top-right") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "top-right");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "bottom-right");
      ctx.moveTo(x2, y2);
      const { x: x3, y: y3 } = tileEdgeCenter(centerX, centerY, "top-left");
      ctx.lineTo(x3, y3);
    } else if (roadOrientation === "bottom-right") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "bottom-right");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "bottom-left");
      ctx.moveTo(x2, y2);
      const { x: x3, y: y3 } = tileEdgeCenter(centerX, centerY, "top-right");
      ctx.lineTo(x3, y3);
    } else if (roadOrientation === "bottom-left") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "bottom-left");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "top-left");
      ctx.moveTo(x2, y2);
      const { x: x3, y: y3 } = tileEdgeCenter(centerX, centerY, "bottom-right");
      ctx.lineTo(x3, y3);
    } else if (roadOrientation === "top-left") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "top-left");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "top-right");
      ctx.moveTo(x2, y2);
      const { x: x3, y: y3 } = tileEdgeCenter(centerX, centerY, "bottom-left");
      ctx.lineTo(x3, y3);
    }
  } else if (roadType === "turn-only") {
    if (roadOrientation === "top-right") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "top-right");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "bottom-right");
      ctx.lineTo(x2, y2);
    } else if (roadOrientation === "bottom-right") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "bottom-right");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "bottom-left");
      ctx.lineTo(x2, y2);
    } else if (roadOrientation === "bottom-left") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "bottom-left");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "top-left");
      ctx.lineTo(x2, y2);
    } else if (roadOrientation === "top-left") {
      const { x: x1, y: y1 } = tileEdgeCenter(centerX, centerY, "top-left");
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      const { x: x2, y: y2 } = tileEdgeCenter(centerX, centerY, "top-right");
      ctx.lineTo(x2, y2);
    }
  } else if (roadType === "through-road") {
    const { x: x1, y: y1 } = tileEdgeCenter(
      centerX,
      centerY,
      roadOrientation === "top-right" ? "top-right" : "bottom-right"
    );
    ctx.moveTo(x1, y1);
    const { x: x2, y: y2 } = tileEdgeCenter(
      centerX,
      centerY,
      roadOrientation === "top-right" ? "bottom-left" : "top-left"
    );
    ctx.lineTo(x2, y2);
  } else if (roadType === "dead-end") {
    const { x, y } = tileEdgeCenter(centerX, centerY, roadOrientation);
    ctx.moveTo(x, y);
    ctx.lineTo(centerX, centerY);
  }

  ctx.stroke();
};

const renderCity = (
  ctx: CanvasRenderingContext2D,
  city: CityCell[][],
  originX: number,
  originY: number
) => {
  ctx.save();
  ctx.clearRect(
    0,
    0,
    ctx.canvas.width / (window.devicePixelRatio || 1),
    ctx.canvas.height / (window.devicePixelRatio || 1)
  );

  const rand = seedRandom(4242);
  const layers = GRID_WIDTH + GRID_HEIGHT;

  for (let layer = 0; layer < layers; layer += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const y = layer - x;
      if (y < 0 || y >= GRID_HEIGHT) {
        continue;
      }

      const cell = city[y][x];
      const top = tileTop(x, y, originX, originY);

      switch (cell.feature) {
        case "road": {
          if (!cell.roadType || !cell.roadOrientation) {
            break;
          }
          const roadGradient = ctx.createLinearGradient(top.x, top.y, top.x, top.y + TILE_HEIGHT);
          roadGradient.addColorStop(0, "#1f2937");
          roadGradient.addColorStop(1, "#111827");
          drawDiamond(ctx, top.x, top.y, roadGradient);
          const center = tileCenter(x, y, originX, originY);
          drawRoadDetails(ctx, center.x, center.y, cell.roadType, cell.roadOrientation);
          break;
        }
        case "park": {
          const parkGradient = ctx.createLinearGradient(top.x, top.y, top.x, top.y + TILE_HEIGHT);
          parkGradient.addColorStop(0, "rgba(134, 239, 172, 0.95)");
          parkGradient.addColorStop(1, "rgba(34, 197, 94, 0.85)");
          drawDiamond(ctx, top.x, top.y, parkGradient);
          const center = tileCenter(x, y, originX, originY);
          ctx.fillStyle = "rgba(5, 150, 105, 0.4)";
          ctx.beginPath();
          ctx.arc(center.x, center.y, 12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "grove": {
          const groveGradient = ctx.createLinearGradient(top.x, top.y, top.x, top.y + TILE_HEIGHT);
          groveGradient.addColorStop(0, "rgba(74, 222, 128, 0.8)");
          groveGradient.addColorStop(1, "rgba(34, 197, 94, 0.7)");
          drawDiamond(ctx, top.x, top.y, groveGradient);
          const center = tileCenter(x, y, originX, originY);
          drawTree(ctx, center.x - 6, center.y + 2, rand);
          drawTree(ctx, center.x + 8, center.y, rand);
          break;
        }
        case "midrise": {
          if (!cell.height) {
            break;
          }
          drawDiamond(ctx, top.x, top.y, "rgba(226, 232, 240, 0.2)", "rgba(148, 163, 184, 0.35)");
          drawBuilding(ctx, top.x, top.y, cell.height, "rgba(203,213,245, 0.85)");
          break;
        }
        case "tower": {
          if (!cell.height) {
            break;
          }
          drawDiamond(ctx, top.x, top.y, "rgba(203, 213, 225, 0.25)", "rgba(148, 163, 184, 0.35)");
          drawBuilding(ctx, top.x, top.y, cell.height, "rgba(241,245,249, 0.85)");
          break;
        }
        default:
          break;
      }
    }
  }

  ctx.restore();
};

export default function IsometricCity() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const state = {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      originX: 0,
      originY: -200,
    };

    const dpr = window.devicePixelRatio || 1;

    const city = generateCity();
    let walkers = createWalkers(city, 0, 0);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const { clientWidth, clientHeight } = parent;
      state.width = clientWidth;
      state.height = clientHeight;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      const isoHeight = ((GRID_WIDTH + GRID_HEIGHT) * TILE_HEIGHT) / 2;
      state.originX = state.width / 2;
      state.originY = Math.max(60, state.height - isoHeight - 80);

      walkers = createWalkers(city, state.originX, state.originY);
      renderCity(context, city, state.originX, state.originY);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resize();

    let lastTime = performance.now();
    let animationFrame: number;

    const step = (time: number) => {
      const delta = clamp((time - lastTime) / 1000, 0, 0.1);
      lastTime = time;

      renderCity(context, city, state.originX, state.originY);

      for (const walker of walkers) {
        walker.progress += walker.speed * delta * walker.direction;

        if (walker.progress <= 0 || walker.progress >= 1) {
          const currentTile = walker.direction === 1 ? walker.next : walker.path;
          const neighbors = getRoadNeighbors(city, currentTile.x, currentTile.y);
          const target = neighbors[Math.floor(Math.random() * neighbors.length)] ?? walker.path;

          walker.path = { ...currentTile };
          walker.next = { ...target };
          walker.direction = Math.random() > 0.25 ? 1 : -1;
          walker.progress = walker.direction === 1 ? 0 : 1;
        }

        const currentCenter = tileCenter(
          walker.path.x,
          walker.path.y,
          state.originX,
          state.originY
        );
        const nextCenter = tileCenter(walker.next.x, walker.next.y, state.originX, state.originY);

        const t = clamp(walker.progress, 0, 1);
        const posX = currentCenter.x + (nextCenter.x - currentCenter.x) * t;
        const posY = currentCenter.y + (nextCenter.y - currentCenter.y) * t;

        walker.trail.unshift({ x: posX, y: posY, life: 1 });
        if (walker.trail.length > 120) {
          walker.trail.length = 120;
        }

        for (let i = walker.trail.length - 1; i >= 0; i -= 1) {
          const dot = walker.trail[i];
          dot.life -= delta * 0.45;
          if (dot.life <= 0) {
            walker.trail.splice(i, 1);
          }
        }
      }

      renderWalkers(context, walkers);
      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className="overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-[600px] w-full"
        role="img"
        aria-label="An isometric canvas rendering of a stylized city with animated walkers leaving light trails."
      />
    </section>
  );
}
