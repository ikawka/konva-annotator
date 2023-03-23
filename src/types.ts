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
  isClosed?: boolean;
  rotation: number;
}

export type Points = number[];
export type Nodes = number[][];
export type Position = {
  x: number;
  y: number;
};
