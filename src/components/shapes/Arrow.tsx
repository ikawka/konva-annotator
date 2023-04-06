import React, { useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Arrow as KonvaArrow } from "react-konva";
import { Nodes, ShapeProp } from "../../types";
import { Anchor } from "../Anchor";
import {
  getLineDistance,
  pointsToNodes,
  resetShape,
  rotatePoint,
} from "../../utils";
import { flattenDeep } from "lodash";
import { MIN_LINE_LENGTH } from "../../constants";
import Transformer from "../Transformer";

interface Props {
  shapeProp: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Arrow = ({ shapeProp, isSelected, onChange, onSelect }: Props) => {
  const shapeRef = React.useRef<Konva.Arrow>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isTransforming, setIsTransforming] = React.useState<boolean>(false);
  const [nodes, updateNodes] = useState<Nodes>([]);

  const checkLength = (index: number, point: number[]) => {
    const check = [...nodes];
    check[index] = point;
    const [x1, y1, x2, y2] = flattenDeep(check);
    return getLineDistance(x1, y1, x2, y2) >= MIN_LINE_LENGTH;
  };

  React.useEffect(() => {
    shapeRef.current?.setAttrs({ x: 0, y: 0 });
    updateNodes(pointsToNodes(shapeProp.points || []));
    setIsDragging(false);
  }, [shapeProp]);

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        points={shapeProp.points || []}
        stroke={shapeProp.color || "red"}
        strokeWidth={shapeProp.strokeWidth}
        pointerLength={(shapeProp.strokeWidth || 4) * 2}
        pointerWidth={(shapeProp.strokeWidth || 4) * 2}
        onClick={onSelect}
        draggable={isSelected}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getAttrs();
          const [x1, y1, x2, y2] = shapeProp.points ?? [];
          onChange({
            ...shapeProp,
            points: [x1 + x, y1 + y, x2 + x, y2 + y],
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
          {!isTransforming &&
            nodes.map((node, index) => (
              <Anchor
                key={index}
                x={node[0]}
                y={node[1]}
                visible={!isDragging}
                onDragMove={(e) => {
                  const { x, y } = e.target.getPosition();
                  // check if arrow is below the minimum
                  if (checkLength(index, [x, y])) {
                    nodes[index] = [x, y];
                    onChange({
                      ...shapeProp,
                      points: flattenDeep(nodes),
                    });
                    updateNodes(nodes);
                  } else {
                    const n = pointsToNodes(shapeProp.points || []);
                    e.target.setAttrs({ x: n[index][0], y: n[index][1] });
                  }
                }}
              />
            ))}
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
        </>
      )}
    </>
  );
};

export default Arrow;
