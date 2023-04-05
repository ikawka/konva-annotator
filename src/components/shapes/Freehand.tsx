import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import { flattenDeep } from "lodash";
import { Line } from "react-konva";
import { LABEL_OFFSET } from "../../constants";
import ToolTip from "../ToolTip";
import Transformer from "../Transformer";
import { Position, ShapeProp } from "../../types";
import { generateBounding, pointsToNodes, rotatePoint } from "../../utils";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Freehand = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Line>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [labelPos, updateLabelPos] = useState<Position>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = React.useState<boolean>(false);

  const resetShape = (
    shape: Shape<ShapeConfig> | Stage,
    data?: ShapeConfig
  ) => {
    shape.setAttrs({ x: 0, y: 0, rotation: 0, ...data });
  };

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  useEffect(() => {
    const { x, y, height } = generateBounding(shapeProps.points || []);
    updateLabelPos({
      x,
      y: y + height + LABEL_OFFSET,
    });
    setIsDragging(false);
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
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x: nextX, y: nextY } = e.target.getAttrs();
          const newPoints = pointsToNodes(shapeProps.points || []).map(
            (point) => {
              return [point[0] + nextX, point[1] + nextY];
            }
          );

          onChange({
            ...shapeProps,
            points: flattenDeep(newPoints),
          });
          resetShape(e.target);
        }}
        onTransformStart={() => {
          setIsTransforming(true);
        }}
        onTransformEnd={(e) => {
          setIsTransforming(false);
          const { x: nextX, y: nextY, rotation } = e.target.getAttrs();
          const newPoints = pointsToNodes(shapeProps.points || []).map(
            (point) => {
              const rotated = rotatePoint(
                { x: point[0] + nextX, y: point[1] + nextY },
                { x: nextX, y: nextY },
                rotation
              );
              return [rotated.x, rotated.y];
            }
          );

          onChange({
            ...shapeProps,
            points: flattenDeep(newPoints),
          });
          resetShape(e.target);
        }}
      />
      {isSelected && shapeRef.current && (
        <>
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
          {!isDragging && !isTransforming && labelPos.x !== 0 && (
            <ToolTip position={labelPos} comment={shapeProps.comment} />
          )}
        </>
      )}
    </>
  );
};

export default Freehand;
