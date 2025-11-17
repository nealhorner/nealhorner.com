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

type TrailDot = {
  x: number;
  y: number;
  life: number;
};

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

export type RoutingNode = {
  id: string;
  x: number;
  y: number;
  routingSegmentIds: string[];
  isExitOrEntrance: boolean;
};

export type RoutingSegment = {
  id: string;
  startNodeId: string;
  endNodeId: string;
};
