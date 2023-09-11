import { Circle, Group, Path, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import ToolTip from "../ToolTip";
import { ShapeProp } from "../../types";
import {
  PIN_PATH,
  PIN_COLOR,
  LABEL_OFFSET,
  PIN_HEIGHT,
  PIN_WIDTH,
} from "../../constants";

interface Props {
  count: number;
  shapeProp: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
  parentScale: number;
}

interface LabelPos {
  x: number;
  y: number;
}

const Pin = ({
  count,
  shapeProp,
  onSelect,
  isSelected,
  onChange,
  parentScale,
}: Props) => {
  const shapeRef = useRef<Konva.Group>(null);
  const [labelPos, updateLabelPos] = useState<LabelPos>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const width = PIN_WIDTH;
  const height = PIN_HEIGHT;

  useEffect(() => {
    const { x, y } = shapeProp;
    updateLabelPos({ x: x - 9 / parentScale, y: y + 9 / parentScale });
    setIsDragging(false);
  }, [shapeProp, parentScale]);

  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.setAttr("scale", {
        x: 1 / parentScale,
        y: 1 / parentScale,
      });
    }
  }, [shapeRef, parentScale]);

  return (
    <>
      <Group
        ref={shapeRef}
        height={height}
        width={width}
        x={shapeProp.x}
        y={shapeProp.y}
        offsetX={width / 2}
        offsetY={height}
        draggable={isSelected}
        onClick={(e) => onSelect(e)}
        onMouseOver={(e) => {
          shapeRef.current?.setAttr("opacity", 0.7);
        }}
        onMouseOut={(e) => {
          shapeRef.current?.setAttr("opacity", 1);
        }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProp,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        shadowColor={PIN_COLOR.SHADOW}
        shadowOffset={{
          x: -2,
          y: 2,
        }}
        shadowBlur={5}
      >
        <Path
          x={0}
          y={0}
          data={PIN_PATH}
          fill={PIN_COLOR.PATH_FILL}
          strokeWidth={1}
          stroke={PIN_COLOR.PATH_STROKE}
          strokeEnabled={isSelected}
        />
        <Circle x={width / 2} y={12} radius={10} fill={PIN_COLOR.CIRCLE_FILL} />
        <Text
          x={0}
          y={12 - 5}
          width={width}
          text={`${count}`}
          fill={PIN_COLOR.TEXT}
          align="center"
        />
      </Group>
      {isSelected && !isDragging && labelPos.x !== 0 && (
        <ToolTip position={labelPos} />
      )}
    </>
  );
};

export default Pin;
