export const tools = [
  "pointer",
  "rect",
  "pin",
  "arrow",
  "poly",
  "freehand",
] as const;

export const drawable = ["rect", "pin", "arrow", "poly", "freehand"] as const;

export const strokable = ["rect", "arrow", "poly", "freehand"] as const;

export type Tool = typeof tools[number];
export type Drawable = typeof drawable[number];
export type Strokable = typeof strokable[number];

export interface ShapeProp {
  tool: Tool;
  color?: string;
  points?: number[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  key: string;
  rotation: number;
  strokeWidth?: number;
  isDone?: boolean;
  scaleX?: number;
  scaleY?: number;
  comment?: object[];
}

export type Points = number[];
export type Nodes = number[][];
export type Position = {
  x: number;
  y: number;
};
