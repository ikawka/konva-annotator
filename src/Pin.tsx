import { Circle, Group, Path, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import Konva from "konva";
import ToolTip from "./ToolTip";
import { ShapeProp } from "./types";

// this is for customizable color pin
const pinPath =
  "m14 33.2c3.4-4.3 11-14.6 11-20.5 0-7-5.6-12.7-12.5-12.7-6.9 0-12.5 5.7-12.5 12.7 0 5.9 7.6 16.2 11 20.5 0.8 1 2.2 1 3 0z";

interface Props {
  count: number;
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

interface LabelPos {
  x: number;
  y: number;
}

const Pin = ({ count, shapeProps, onSelect, isSelected, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Group>(null);
  const [labelPos, updateLabelPos] = React.useState<LabelPos>({ x: 0, y: 0 });

  const width = 25;
  const height = 34;

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      updateLabelPos({
        x: shapeRef.current.x(),
        y: shapeRef.current.y() + shapeRef.current.height() + 10,
      });
    }
  }, [isSelected, shapeRef]);

  return (
    <>
      <Group
        ref={shapeRef}
        height={height}
        width={width}
        x={shapeProps.x}
        y={shapeProps.y}
        draggable={isSelected}
        onClick={(e) => onSelect(e)}
        onDragMove={() => {
          if (shapeRef.current) {
            updateLabelPos({
              x: shapeRef.current.x(),
              y: shapeRef.current.y() + shapeRef.current.height() + 10,
            });
          }
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        shadowColor="rgba(0,0,0,0.5)"
        shadowOffset={{
          x: -2,
          y: 2,
        }}
        shadowBlur={5}
      >
        <Path
          x={0}
          y={0}
          data={pinPath}
          fill="#162685"
          strokeWidth={1}
          stroke="white"
          strokeEnabled={isSelected}
        />
        <Circle x={width / 2} y={12} radius={10} fill="white" />
        <Text
          x={0}
          y={12 - 5}
          width={width}
          text={`${count}`}
          fill="black"
          align="center"
        />
      </Group>
      {isSelected && labelPos.x !== 0 && <ToolTip position={labelPos} />}
    </>
  );
};

export default Pin;
