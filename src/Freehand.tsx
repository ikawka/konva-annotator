import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Line } from "react-konva";
import Transformer from "./Transformer";
import { ShapeProp } from "./types";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Freehand = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Line>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

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
        onDragEnd={(e) => {
          const { x, y } = e.target.getPosition();
          onChange({
            ...shapeProps,
            x,
            y,
          });
        }}
        onTransformEnd={(e) => {
          const { x, y, scaleX, scaleY, width, height, rotation } =
            e.target.getAttrs();
          console.log({ x, y, width, height, scaleX, scaleY, rotation });
          onChange({
            ...shapeProps,
            x,
            y,
            scaleX,
            scaleY,
            rotation,
          });
        }}
      />
      {isSelected && shapeRef.current && (
        <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
      )}
    </>
  );
};

export default Freehand;
