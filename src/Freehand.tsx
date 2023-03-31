import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Line } from "react-konva";
import { Anchor } from "./Anchor";
import Transformer from "./Transformer";
import { ShapeProp } from "./types";
import { rotatePoint } from "./utils";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Freehand = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Line>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  const [anchorPos, setAnchorPos] = React.useState<number[]>([
    (shapeProps.points?.[0] || 0) + shapeProps.x,
    (shapeProps.points?.[1] || 0) + shapeProps.y,
  ]);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  React.useEffect(() => {
    setAnchorPos([
      (shapeProps.points?.[0] || 0) + shapeProps.x,
      (shapeProps.points?.[1] || 0) + shapeProps.y,
    ]);
  }, [shapeProps]);
  return (
    <>
      <Line
        ref={shapeRef}
        points={shapeProps.points}
        stroke={shapeProps.color}
        strokeWidth={shapeProps.strokeWidth}
        onClick={onSelect}
        draggable={isSelected}
        scaleX={shapeProps.scaleX}
        scaleY={shapeProps.scaleY}
        rotation={shapeProps.rotation}
        x={shapeProps.x}
        y={shapeProps.y}
        onDragEnd={(e) => {
          const { x, y } = e.target.getAttrs();
          onChange({
            ...shapeProps,
            x,
            y,
          });
        }}
        onTransformEnd={(e) => {
          console.log("ola");
          const { x, y, rotation } = e.target.getAttrs();

          onChange({
            ...shapeProps,
            x,
            y,
            rotation,
          });
          const rotated = rotatePoint(
            { x: anchorPos[0], y: anchorPos[1] },
            { x, y },
            rotation
          );
          setAnchorPos([rotated.x, rotated.y]);
        }}
      />
      {isSelected && shapeRef.current && (
        <>
          <Anchor visible x={anchorPos[0]} y={anchorPos[1]} />
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
        </>
      )}
    </>
  );
};

export default Freehand;
