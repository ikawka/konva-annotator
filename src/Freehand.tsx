import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { flattenDeep } from "lodash";
import React from "react";
import { Line, Rect } from "react-konva";
import { Anchor } from "./Anchor";
import { LABEL_OFFSET } from "./constants";
import ToolTip from "./ToolTip";
import Transformer from "./Transformer";
import { Position, ShapeProp } from "./types";
import { generateBounding, pointsToNodes, rotatePoint } from "./utils";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Freehand = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Line>(null);
  const trRef = React.useRef<Konva.Transformer>(null);
  const [labelPos, updateLabelPos] = React.useState<Position>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  React.useEffect(() => {
    const { x, y, height } = generateBounding(shapeProps.points || []);
    updateLabelPos({
      x,
      y: y + height + LABEL_OFFSET,
    });
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
          const newPoints = pointsToNodes(shapeProps.points || []).map(
            (point) => {
              return [point[0] + x, point[1] + y];
            }
          );

          onChange({
            ...shapeProps,
            points: flattenDeep(newPoints),
            x: 0,
            y: 0,
          });
          e.target.setPosition({ x: 0, y: 0 });
        }}
        onTransformEnd={(e) => {
          const { x, y, rotation } = e.target.getAttrs();
          const newPoints = pointsToNodes(shapeProps.points || []).map(
            (point) => {
              const r = rotatePoint(
                { x: point[0] + x, y: point[1] + y },
                { x, y },
                rotation
              );
              return [r.x, r.y];
            }
          );

          onChange({
            ...shapeProps,
            points: flattenDeep(newPoints),
            x: 0,
            y: 0,
          });
          e.target.setAttrs({ x: 0, y: 0, rotation: 0 });
        }}
        zIndex={5}
      />
      {isSelected && shapeRef.current && (
        <>
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
          {labelPos.x !== 0 && <ToolTip position={labelPos} />}
        </>
      )}
    </>
  );
};

export default Freehand;
