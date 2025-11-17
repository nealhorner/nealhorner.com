export type CityFeature = "building" | "road" | "park" | "fountain" | "grove";

export type RoadType =
  | "four-way-intersection"
  | "three-way-intersection"
  | "turn-only"
  | "through-road"
  | "dead-end";

export type RoadOrientation = "top-right" | "bottom-right" | "bottom-left" | "top-left";

export type CityCell = {
  feature: CityFeature;
  roadType?: RoadType;
  roadOrientation?: RoadOrientation;
};

export type FountainAnimation = {
  time: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  color: string;
  opacity: number;
};

export type CityForegroundElement = {
  feature: "building" | "grove" | "fountain";
  x: number;
  y: number;
  height?: number;
  color?: string;
  groveCount?: number;
  fountainAnimations?: FountainAnimation[];
};
