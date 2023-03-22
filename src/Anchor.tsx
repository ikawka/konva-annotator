import React from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

export interface AnchorProps {
  x: number;
  y: number;
  visible: boolean;
  draggable?: boolean;
  onDragMove?: (e: KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOver?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (e: KonvaEventObject<MouseEvent>) => void;
}

export const Anchor = React.forwardRef<Konva.Circle, AnchorProps>(
  ({ x, y, visible, draggable = true, ...rest }, ref) => {
    return (
      <Circle
        ref={ref}
        x={x}
        y={y}
        radius={6}
        stroke="#83c5ff"
        fill="#fff"
        strokeWidth={1}
        draggable={draggable}
        visible={visible}
        {...rest}
      />
    );
  }
);
