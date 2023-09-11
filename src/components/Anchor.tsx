import React from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import {
  ANCHOR_FILL,
  ANCHOR_RADIUS,
  ANCHOR_STROKE,
  ANCHOR_STROKE_WIDTH,
} from "../constants";

export interface AnchorProps {
  x: number;
  y: number;
  visible: boolean;
  draggable?: boolean;
  onDragMove?: (e: KonvaEventObject<MouseEvent>) => void;
  onDragStart?: (e: KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOver?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (e: KonvaEventObject<MouseEvent>) => void;
  onDblClick?: (e: KonvaEventObject<MouseEvent>) => void;
  scaleX?: number;
  scaleY?: number;
}

export const Anchor = React.forwardRef<Konva.Circle, AnchorProps>(
  ({ x, y, visible, draggable = true, ...rest }, ref) => {
    return (
      <Circle
        ref={ref}
        x={x}
        y={y}
        radius={ANCHOR_RADIUS}
        stroke={ANCHOR_STROKE}
        fill={ANCHOR_FILL}
        strokeWidth={ANCHOR_STROKE_WIDTH}
        draggable={draggable}
        visible={visible}
        {...rest}
      />
    );
  }
);
