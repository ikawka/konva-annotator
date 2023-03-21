import React, { useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Arrow as KonvaArrow, Circle } from "react-konva";

interface AnchorProps {
  x: number;
  y: number;
  visible: boolean;
  onDragMove: (e: KonvaEventObject<MouseEvent>) => void;
}

const Anchor = ({ x, y, visible, onDragMove }: AnchorProps) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={6}
      stroke="#83c5ff"
      fill="#fff"
      strokeWidth={2}
      draggable={true}
      visible={visible}
      onDragMove={onDragMove}
    />
  );
};

interface Props {
  shapeProps: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  const [points, updatePoints] = useState<Points>({
    x1: shapeProps.x,
    y1: shapeProps.y,
    x2: shapeProps.width,
    y2: shapeProps.height,
  });

  const onAnchor1Change = (e: KonvaEventObject<MouseEvent>) => {
    updatePoints((prev) => {
      return { ...prev, x1: e.target.x(), y1: e.target.y() };
    });
  };

  const onAnchor2Change = (e: KonvaEventObject<MouseEvent>) => {
    updatePoints((prev) => {
      return { ...prev, x2: e.target.x(), y2: e.target.y() };
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
    updatePoints({
      x1: shapeProps.x,
      y1: shapeProps.y,
      x2: shapeProps.width,
      y2: shapeProps.height,
    });
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
        draggable={isSelected}
        onClick={(e) => onSelect(e)}
        onDragEnd={(e) => {
          if (shapeRef.current) {
            const [x1, y1, x2, y2] = shapeRef.current.points();
            onChange({
              x: x1,
              y: y1,
              width: x2,
              height: y2,
            });
          }
        }}
      />
      {isSelected && (
        <>
          <Anchor
            x={points.x1}
            y={points.y1}
            visible={true}
            onDragMove={onAnchor1Change}
          />
          <Anchor
            x={points.x2}
            y={points.y2}
            visible={true}
            onDragMove={onAnchor2Change}
          />
        </>
      )}
    </>
  );
};

export default Arrow;
