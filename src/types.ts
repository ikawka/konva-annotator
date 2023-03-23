import { Tool } from "./Toolbar";

export interface ShapeProp {
  tool: Omit<Tool, "pointer">;
  points?: number[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  key: string;
  isClosed?: boolean;
}

export type Points = number[];
export type Nodes = number[][];
