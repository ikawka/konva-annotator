import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React, { useState, useEffect, useRef } from "react";
import { Rect } from "react-konva";
import {
  LABEL_OFFSET,
  RECT_MIN_WIDTH,
  RECT_MIN_HEIGHT,
  DEFAULT_COLOR,
  RECT_COLOR,
} from "../../constants";

import ToolTip from "../ToolTip";
import Transformer from "../Transformer";
import { Position, ShapeProp } from "../../types";
import { getRectBoundingBox } from "../../utils";

interface Props {
  shapeProp: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Rectangle = ({ shapeProp, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Rect>(null);

  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [labelPos, updateLabelPos] = useState<Position>({ x: 0, y: 0 });

  const handleLabelPosition = (data: any) => {
    const { x, y, height, width, rotation } = data;
    const rotated = getRectBoundingBox(x, y, width, height, rotation);

    updateLabelPos({
      x: rotated.x,
      y: rotated.y + rotated.height + LABEL_OFFSET,
    });
  };

  useEffect(() => {
    // set label position
    const { x, y, height, width, rotation } = shapeProp;
    handleLabelPosition({ x, y, height, width, rotation });
    setIsDragging(false);
  }, [shapeProp]);

  return (
    <React.Fragment>
      <Rect
        onClick={(e) => {
          onSelect(e);
        }}
        onTap={onSelect}
        ref={shapeRef}
        x={shapeProp.x}
        y={shapeProp.y}
        height={shapeProp.height}
        width={shapeProp.width}
        rotation={shapeProp.rotation}
        draggable={isSelected}
        stroke={shapeProp.color || DEFAULT_COLOR}
        fill={RECT_COLOR.MOUSE_OUT}
        strokeWidth={shapeProp.strokeWidth}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getPosition();
          onChange({
            ...shapeProp,
            x,
            y,
          });
        }}
        onMouseMove={(e) => {
          e.target.setAttrs({ fill: RECT_COLOR.MOUSE_OVER });
        }}
        onMouseOut={(e) => {
          e.target.setAttrs({ fill: RECT_COLOR.MOUSE_OUT });
        }}
        onTransform={() => {
          setIsResizing(true);
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          setIsResizing(false);
          const node = e.target || undefined;
          if (node) {
            const { x, y, scaleX, scaleY, rotation, width, height } =
              node.getAttrs();
            const nextWidth = Math.max(width * scaleX, RECT_MIN_WIDTH);
            const nextHeight = Math.max(height * scaleY, RECT_MIN_HEIGHT);
            // we will reset it back
            node.scale({ x: 1, y: 1 });
            const data = {
              ...shapeProp,
              x,
              y,
              width: nextWidth,
              height: nextHeight,
              rotation,
            };
            onChange(data);
            handleLabelPosition(data);
          }
        }}
      />

      {isSelected && shapeRef.current && (
        <>
          <Transformer nodes={[shapeRef.current]} />
          {!isResizing && !isDragging && labelPos.x !== 0 && (
            <ToolTip position={labelPos} comment={shapeProp.comment} />
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default Rectangle;
