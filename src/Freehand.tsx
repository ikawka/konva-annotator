import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Line, Transformer } from "react-konva";
import { ShapeProp } from "./types";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const minWidth = 5;
const minHeight = 5;

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
        strokeWidth={4}
        onClick={onSelect}
        draggable={isSelected}
        scaleX={shapeProps.scaleX}
        scaleY={shapeProps.scaleY}
        onTransformEnd={(e) => {
          const { x, y, scaleX, scaleY, rotation } = e.target.getAttrs();
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
      {isSelected && (
        <Transformer
          ref={trRef}
          ignoreStroke
          padding={5}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Freehand;
