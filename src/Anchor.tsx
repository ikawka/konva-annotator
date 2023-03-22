import React from "react";
import Konva from "konva";
import { Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

export interface AnchorProps {
  x: number;
  y: number;
  visible: boolean;
  onDragMove?: (e: KonvaEventObject<MouseEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOver?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (e: KonvaEventObject<MouseEvent>) => void;
}

export const Anchor = React.forwardRef<Konva.Circle, AnchorProps>(
  ({ x, y, visible, ...rest }, ref) => {
    return (
      <Circle
        ref={ref}
        x={x}
        y={y}
        radius={6}
        stroke="#83c5ff"
        fill="#fff"
        strokeWidth={2}
        draggable
        visible={visible}
        {...rest}
      />
    );
  }
);
