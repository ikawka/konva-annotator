import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { chunk } from "lodash";
import fitImageToStage from "./fit-image-to-stage";
import {
  Drawable,
  Nodes,
  Points,
  drawable,
  Strokable,
  strokable,
  Position,
} from "../types";
import scaleRatio from "./scale-ratio";
import adjustImagePosition from "./adjust-image-position";
import generateShapeData from "./generate-shape-data";

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

export const isDrawable = (tool: any): tool is Drawable =>
  drawable.includes(tool);
export const isStrokable = (tool: any): tool is Strokable =>
  strokable.includes(tool);

export const pointsToNodes = (points: Points): Nodes => chunk(points, 2);

export const getLineDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return Math.hypot(x2 - x1, y2 - y1);
};

// reference: https://stackoverflow.com/questions/59098408/konva-get-corners-coordinate-of-a-rotated-rectangle
// pt = {x,y} of point to rotate,
// o = {x, y} of rotation origin,
// rotation = rotation in degrees.
// returns {x, y} giving the new point.
export const rotatePoint = (pt: Position, o: Position, rotation: number) => {
  var angle = rotation * (Math.PI / 180); // Convert to radians

  var rotatedX =
    Math.cos(angle) * (pt.x - o.x) - Math.sin(angle) * (pt.y - o.y) + o.x;

  var rotatedY =
    Math.sin(angle) * (pt.x - o.x) + Math.cos(angle) * (pt.y - o.y) + o.y;

  return { x: rotatedX, y: rotatedY };
};

const deltaToBoxCoors = (deltaX: number[], deltaY: number[]) => {
  const x = Math.min(...deltaX);
  const y = Math.min(...deltaY);
  const width = Math.max(...deltaX) - x;
  const height = Math.max(...deltaY) - y;
  return { x, y: y, width, height };
};

export const generateBounding = (p: number[]) => {
  const points = pointsToNodes(p);
  // get all x and y in points and separate
  let deltaX: number[] = [];
  let deltaY: number[] = [];

  // TODO: improve this
  points.map((point) => {
    deltaX.push(point[0]);
    deltaY.push(point[1]);
    return null;
  });

  return deltaToBoxCoors(deltaX, deltaY);
};

export const getRectBoundingBox = (
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) => {
  const tl = rotatePoint({ x, y }, { x, y }, rotation);
  const tr = rotatePoint({ x: x + width, y }, { x, y }, rotation);
  const br = rotatePoint({ x: x + width, y: y + height }, { x, y }, rotation);
  const bl = rotatePoint({ x: x, y: y + height }, { x, y }, rotation);
  const deltaX = [tl.x, tr.x, br.x, bl.x];
  const deltaY = [tl.y, tr.y, br.y, bl.y];

  return deltaToBoxCoors(deltaX, deltaY);
};

export const resetShape = (
  shape: Shape<ShapeConfig> | Stage,
  data?: ShapeConfig
) => {
  shape.setAttrs({ x: 0, y: 0, rotation: 0, ...data });
};

export { fitImageToStage, scaleRatio, adjustImagePosition, generateShapeData };
