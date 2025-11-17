import { clamp, randomChoice } from "@/lib/utilities";
import type {
  CityCell,
  CityForegroundElement,
  RoadType,
  RoadOrientation,
  FountainAnimation,
} from "./city-types";

import { GRID_WIDTH, GRID_HEIGHT, WALKER_COUNT, getRoadNeighbors } from "./city-generator";

export const TILE_WIDTH = 88;
export const TILE_HEIGHT = 44;
export const EDGE_CENTER_OFFSET_X = TILE_WIDTH / 4;
export const EDGE_CENTER_OFFSET_Y = TILE_HEIGHT / 4;
const DEBUG = true;

export const WALKER_COLORS = ["#38bdf8", "#f97316", "#a855f7", "#34d399", "#facc15", "#fb7185"];

export type Walker = {
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

export type TrailDot = {
  x: number;
  y: number;
  life: number;
};

export const tileTop = (x: number, y: number, originX: number, originY: number) => ({
  x: originX + (x - y) * (TILE_WIDTH / 2),
  y: originY + (x + y) * (TILE_HEIGHT / 2),
});

export const tileCenter = (x: number, y: number, originX: number, originY: number) => {
  const top = tileTop(x, y, originX, originY);
  return {
    x: top.x,
    y: top.y + TILE_HEIGHT / 2,
  };
};

export const tileBottom = (x: number, y: number, originX: number, originY: number) => ({
  x: originX + (x - y) * (TILE_WIDTH / 2),
  y: originY + (x + y) * (TILE_HEIGHT / 2) + TILE_HEIGHT,
});

export const tileEdgeCenter = (x: number, y: number, orientation: RoadOrientation) => {
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

const drawTree = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  tiltX: number,
  tiltY: number
) => {
  const trunkHeight = height * 0.45 + tiltX / 2 + tiltY / 4;

  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 4);
  ctx.lineTo(x + 2, y + 4);
  ctx.lineTo(x + 1, y - trunkHeight);
  ctx.lineTo(x - 1, y - trunkHeight);
  ctx.closePath();
  ctx.fill();

  const canopyRadius = height * 0.8;
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

const drawFountainForeground = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fountainAnimations: FountainAnimation[]
) => {
  if (fountainAnimations.length < 200) {
    x = x + Math.random() - 0.5;
    fountainAnimations.push({
      time: 0,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1.2 - Math.random() * 0.2,
      startX: x,
      startY: y,
      x,
      y,
      color: randomChoice(["#FFFFFF", "#7FC7DF", "#b2ddeb", "#d8eef5"]),
      opacity: 1,
    });
  }

  const gravity = 0.03;

  for (let i = fountainAnimations.length - 1; i >= 0; i--) {
    const animation = fountainAnimations[i];

    // Update the animation
    const lastY = animation.y;
    const lastX = animation.x;

    animation.time++;

    animation.x = animation.startX + animation.vx * animation.time;
    animation.y =
      animation.startY +
      animation.vy * animation.time +
      0.5 * gravity * animation.time * animation.time;
    animation.opacity /= 1.025;

    // Remove the animation
    if (animation.opacity <= 0.1 || animation.y > animation.startY) {
      fountainAnimations.splice(i, 1);
    }

    const rotationAngle = Math.atan2(lastY - animation.y, lastX - animation.x);

    // Draw the animation
    ctx.beginPath();
    ctx.ellipse(animation.x, animation.y, 1, 1.5, rotationAngle, 0, Math.PI * 2);
    ctx.globalAlpha = animation.opacity;
    ctx.fillStyle = animation.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  return fountainAnimations;
};

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

const drawPark = (ctx: CanvasRenderingContext2D, top: { x: number; y: number }) => {
  const colors = ["rgba(100, 214, 142, 0.85)", "rgba(34, 197, 94, 0.85)"];

  // Number of columns and rows in the grid
  const gridSections = 12;
  const halfGridWidth = TILE_WIDTH / gridSections / 2;
  const halfGridHeight = TILE_HEIGHT / gridSections / 2;

  for (let y = 0; y < gridSections; y++) {
    for (let x = 0; x < gridSections; x++) {
      const offsetX = x * -halfGridWidth + y * halfGridWidth;
      const offsetY = x * halfGridHeight + y * halfGridHeight;
      ctx.beginPath();
      ctx.moveTo(top.x + offsetX, top.y + offsetY);
      ctx.lineTo(top.x - halfGridWidth + offsetX, top.y + halfGridHeight + offsetY);
      ctx.lineTo(top.x + offsetX, top.y + 2 * halfGridHeight + offsetY);
      ctx.lineTo(top.x + halfGridWidth + offsetX, top.y + halfGridHeight + offsetY);
      ctx.closePath();
      ctx.fillStyle = colors[(x + y) % colors.length];
      ctx.fill();
    }
  }

  //   drawDiamond(ctx, top.x, top.y, parkGradient);
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

export const renderBasemap = (
  ctx: CanvasRenderingContext2D,
  basemap: CityCell[][],
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

  const layers = GRID_WIDTH + GRID_HEIGHT;

  for (let layer = 0; layer < layers; layer += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const y = layer - x;
      if (y < 0 || y >= GRID_HEIGHT) {
        continue;
      }

      const cell = basemap[y][x];
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
          drawPark(ctx, top);
          break;
        }
        case "grove": {
          const groveGradient = ctx.createLinearGradient(top.x, top.y, top.x, top.y + TILE_HEIGHT);
          groveGradient.addColorStop(0, "rgba(74, 222, 128, 0.8)");
          groveGradient.addColorStop(1, "rgba(34, 197, 94, 0.7)");
          drawDiamond(ctx, top.x, top.y, groveGradient);
          break;
        }
        case "building": {
          drawDiamond(ctx, top.x, top.y, "rgba(226, 232, 240, 0.2)", "rgba(148, 163, 184, 0.35)");
          break;
        }
        case "fountain": {
          const fountainGradient = ctx.createLinearGradient(
            top.x,
            top.y,
            top.x,
            top.y + TILE_HEIGHT
          );
          fountainGradient.addColorStop(0, "rgba(134, 239, 172, 0.95)");
          fountainGradient.addColorStop(1, "rgba(34, 197, 94, 0.85)");
          drawDiamond(ctx, top.x, top.y, fountainGradient);

          // Add gray concrete base as ellipse distorted to look like its isometric

          const ratio = 10 / 16;
          const center = tileCenter(x, y, originX, originY);
          ctx.fillStyle = "rgba(200, 200, 200, 0.9)";
          ctx.beginPath();
          // Draw a horizontally-stretched ellipse to simulate isometric distortion (flat on the plane)
          ctx.ellipse(center.x, center.y, 18, 18 * ratio, 0, 0, Math.PI * 2);
          ctx.fill();
          // Draw the lip of the fountain
          ctx.beginPath();
          ctx.ellipse(center.x, center.y, 10, 10 * ratio, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#7FC7DF";
          ctx.fill();
          break;
        }
        default:
          break;
      }
    }
  }

  if (DEBUG) {
    // Label the coordinates of each tile
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      for (let y = 0; y < GRID_HEIGHT; y += 1) {
        const center = tileCenter(x, y, originX, originY);

        const cell = basemap[y][x];

        if (cell.feature === "road") {
          ctx.fillStyle = "white";
        } else {
          ctx.fillStyle = "black";
        }
        ctx.fillText(`${x},${y}`, center.x, center.y);
      }
    }
  }

  ctx.restore();
};

export const renderForeground = (
  ctx: CanvasRenderingContext2D,
  foreground: CityForegroundElement[],
  originX: number,
  originY: number,
  tiltX: number,
  tiltY: number
) => {
  for (const element of foreground) {
    const top = tileTop(element.x, element.y, originX, originY);
    const center = tileCenter(element.x, element.y, originX, originY);

    switch (element.feature) {
      case "building": {
        if (!element.height || !element.color) {
          break;
        }
        drawBuilding(ctx, top.x, top.y, element.height + tiltX / 2 + tiltY / 4, element.color);
        break;
      }
      case "grove": {
        if (!element.groveCount || !element.height) {
          break;
        }
        const center = tileCenter(element.x, element.y, originX, originY);
        for (let i = 0; i < element.groveCount; i += 1) {
          drawTree(
            ctx,
            center.x + -6 * (element.groveCount - 1) + i * 14,
            center.y - 2 + i * 2,
            element.height,
            tiltX,
            tiltY
          );
        }
        break;
      }
      case "fountain": {
        if (!element.fountainAnimations) {
          break;
        }
        drawFountainForeground(ctx, center.x, center.y, element.fountainAnimations);
        break;
      }
    }
  }
};

export const renderWalkers = (ctx: CanvasRenderingContext2D, walkers: Walker[]) => {
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

export const createWalkers = (city: CityCell[][], originX: number, originY: number): Walker[] => {
  const roadTiles: { x: number; y: number }[] = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (city[y][x].feature === "road") {
        roadTiles.push({ x, y });
      }
    }
  }

  return Array.from({ length: WALKER_COUNT }, (_, idx) => {
    const start = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    const neighbors = getRoadNeighbors(city, start.x, start.y);
    const next = neighbors[Math.floor(Math.random() * neighbors.length)] ?? start;
    const center = tileCenter(start.x, start.y, originX, originY);
    return {
      id: idx,
      path: { ...start },
      next: { ...next },
      progress: Math.random(),
      speed: 0.45 + Math.random() * 0.65,
      direction: Math.random() > 0.5 ? 1 : -1,
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
