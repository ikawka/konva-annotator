import React, { useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Arrow as KonvaArrow } from "react-konva";
import { ShapeProp } from "./types";
import { Anchor } from "./Anchor";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

interface Points {
  // beginning point of the arrow
  x1: number;
  y1: number;
  // end point of the arrow
  x2: number;
  y2: number;
}

const Arrow = ({ shapeProps, isSelected, onChange, onSelect }: Props) => {
  const trRef = React.useRef<Konva.Transformer>(null);
  const shapeRef = React.useRef<Konva.Arrow>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [points, updatePoints] = useState<Points>({
    x1: shapeProps.points?.[0] || 0,
    y1: shapeProps.points?.[1] || 0,
    x2: shapeProps.points?.[2] || 0,
    y2: shapeProps.points?.[3] || 0,
  });

  const onAnchor1Change = (e: KonvaEventObject<MouseEvent>) => {
    const { x, y } = e.target.getAttrs();
    const [, , x2, y2] = shapeProps.points ?? [];

    onChange({
      ...shapeProps,
      points: [x, y, x2, y2],
      x,
      y,
    });
    updatePoints((prev) => {
      return { ...prev, x1: x, y1: y };
    });
  };

  const onAnchor2Change = (e: KonvaEventObject<MouseEvent>) => {
    const { x, y } = e.target.getAttrs();
    const [x1, y1] = shapeProps.points ?? [];
    onChange({
      ...shapeProps,
      points: [x1, y1, x, y],
    });
    updatePoints((prev) => {
      return { ...prev, x2: x, y2: y };
    });
  };

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  React.useEffect(() => {
    const [x1, y1, x2, y2] = shapeProps.points ?? [];
    updatePoints({ x1, y1, x2, y2 });
    shapeRef.current?.setAttrs({ x: 0, y: 0 });
    setIsDragging(false);
  }, [shapeProps]);

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        points={[points.x1, points.y1, points.x2, points.y2]}
        fill="red"
        stroke="red"
        strokeWidth={4}
        pointerLength={8}
        pointerWidth={8}
        onClick={(e) => onSelect(e)}
        draggable={isSelected}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getAttrs();
          const [x1, y1, x2, y2] = shapeProps.points ?? [];
          onChange({
            ...shapeProps,
            points: [x1 + x, y1 + y, x2 + x, y2 + y],
            x: shapeProps.x + x,
            y: shapeProps.y + y,
          });
        }}
      />
      {isSelected && (
        <>
          <Anchor
            x={points.x1}
            y={points.y1}
            visible={!isDragging}
            onDragMove={onAnchor1Change}
          />
          <Anchor
            x={points.x2}
            y={points.y2}
            visible={!isDragging}
            onDragMove={onAnchor2Change}
          />
        </>
      )}
    </>
  );
};

export default Arrow;
