import { chunk } from "lodash";
import {
  Drawable,
  Nodes,
  Points,
  drawable,
  Strokable,
  strokable,
  Position,
} from "./types";

export const getCorner = (
  pivotX: number,
  pivotY: number,
  diffX: number,
  diffY: number,
  angle: number
) => {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  /// find angle from pivot to corner
  angle += Math.atan2(diffY, diffX);

  /// get new x and y and round it off to integer
  const x = pivotX + distance * Math.cos(angle);
  const y = pivotY + distance * Math.sin(angle);

  return { x: x, y: y };
};

export interface RotatedBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export const getClientRect = (rotatedBox: RotatedBox) => {
  const { x, y, width, height } = rotatedBox;
  const rad = rotatedBox.rotation;

  const p1 = getCorner(x, y, 0, 0, rad);
  const p2 = getCorner(x, y, width, 0, rad);
  const p3 = getCorner(x, y, width, height, rad);
  const p4 = getCorner(x, y, 0, height, rad);

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const getTotalBox = (boxes: Box[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  boxes.forEach((box) => {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const isDrawable = (tool: any): tool is Drawable =>
  drawable.includes(tool);
export const isStrokable = (tool: any): tool is Strokable =>
  strokable.includes(tool);

export const pointsToNodes = (points: Points): Nodes => chunk(points, 2);

export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  let y = x2 - x1;
  let x = y2 - y1;

  return Math.sqrt(x * x + y * y);
};

export function rotatePoint(pt: Position, o: Position, a: number) {
  var angle = a * (Math.PI / 180); // Convert to radians

  var rotatedX =
    Math.cos(angle) * (pt.x - o.x) - Math.sin(angle) * (pt.y - o.y) + o.x;

  var rotatedY =
    Math.sin(angle) * (pt.x - o.x) + Math.cos(angle) * (pt.y - o.y) + o.y;

  return { x: rotatedX, y: rotatedY };
}
