import { useEffect, useRef, useState } from "react";
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
  shapeProp: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Freehand = ({ shapeProp, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Line>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [labelPos, updateLabelPos] = useState<Position>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);

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
    const { x, y, height } = generateBounding(shapeProp.points || []);
    updateLabelPos({
      x,
      y: y + height + LABEL_OFFSET,
    });
    setIsDragging(false);
  }, [shapeProp]);

  return (
    <>
      <Line
        ref={shapeRef}
        points={shapeProp.points}
        stroke={shapeProp.color}
        strokeWidth={shapeProp.strokeWidth}
        onClick={onSelect}
        draggable={isSelected}
        scaleX={shapeProp.scaleX}
        scaleY={shapeProp.scaleY}
        rotation={shapeProp.rotation}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x: nextX, y: nextY } = e.target.getAttrs();
          const newPoints = pointsToNodes(shapeProp.points || []).map(
            (point) => {
              return [point[0] + nextX, point[1] + nextY];
            }
          );

          onChange({
            ...shapeProp,
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
          const newPoints = pointsToNodes(shapeProp.points || []).map(
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
            ...shapeProp,
            points: flattenDeep(newPoints),
          });
          resetShape(e.target);
        }}
      />
      {isSelected && shapeRef.current && (
        <>
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
          {!isDragging && !isTransforming && labelPos.x !== 0 && (
            <ToolTip position={labelPos} comment={shapeProp.comment} />
          )}
        </>
      )}
    </>
  );
};

export default Freehand;
