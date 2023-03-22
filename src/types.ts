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
