import { Tool } from "./Toolbar";

export interface ShapeProp {
  tool: Omit<Tool, "pointer">;
  color?: string;
  points?: number[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  key: string;
  rotation: number;
  strokeWidth?: number;
  isClosed?: boolean;
  scaleX?: number;
  scaleY?: number;
}

export type Points = number[];
export type Nodes = number[][];
export type Position = {
  x: number;
  y: number;
};
