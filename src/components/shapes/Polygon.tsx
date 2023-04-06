import { useCallback, useEffect, useRef, useState } from "react";
import { Line } from "react-konva";
import { flattenDeep } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Anchor } from "../Anchor";
import { Nodes, Position, ShapeProp } from "../../types";
import {
  generateBounding,
  pointsToNodes,
  resetShape,
  rotatePoint,
} from "../../utils";
import Konva from "konva";
import { DEFAULT_COLOR, LABEL_OFFSET, POLY_COLOR } from "../../constants";
import Transformer from "../Transformer";
import ToolTip from "../ToolTip";

interface Props {
  shapeProp: ShapeProp;
  cbIsOverStart: (isOverStart: boolean) => void;
  onChange: (props: any) => void;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
}

const Polygon = ({
  shapeProp,
  cbIsOverStart,
  onChange,
  isSelected,
  onSelect,
}: Props) => {
  const shapeRef = useRef<Konva.Line>(null);
  const [nodes, updateNodes] = useState<Nodes>([]);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isAdjustingPoint, setIsAdjustingPoint] = useState<boolean>(false);

  const [labelPos, updateLabelPos] = useState<Position>({ x: 0, y: 0 });

  const isStillPolygon = useCallback(() => {
    const nextPoints = pointsToNodes(shapeProp.points || []);
    return nextPoints.length - 1 > 3;
  }, [shapeProp]);

  useEffect(() => {
    updateNodes(() => {
      // split points by pair
      const nodes = pointsToNodes(shapeProp.points || []);
      return nodes.slice(0, nodes.length - 1);
    });
    setIsDragging(false);

    const { x, y, height } = generateBounding(shapeProp.points || []);
    updateLabelPos({
      x,
      y: y + height + LABEL_OFFSET,
    });
  }, [shapeProp]);

  return (
    <>
      <Line
        ref={shapeRef}
        points={shapeProp.points}
        stroke={shapeProp.color || DEFAULT_COLOR}
        strokeWidth={shapeProp.strokeWidth}
        fill={!shapeProp.isDone ? POLY_COLOR.MOUSE_OVER : POLY_COLOR.MOUSE_OUT}
        closed={shapeProp.isDone}
        draggable={isSelected}
        onDblClick={(e) => {
          // check if clicking in between the line
          if (isSelected) {
            const { x = 0, y = 0 } =
              e.target.getStage()?.getPointerPosition() || {};
            const nodes = pointsToNodes(shapeProp.points ?? []);
            for (let i = 0; i < nodes.length - 1; i++) {
              const [startX, startY] = nodes[i];
              const [endX, endY] = nodes[i + 1];
              console.log({ startX, startY, endX, endY });
              if (
                ((startX <= x && x <= endX) || (endX <= x && x <= startX)) &&
                ((startY <= y && y <= endY) || (endY <= y && y <= startY))
              ) {
                const nextPoints = [...nodes];
                nextPoints.splice(i + 1, 0, [x, y]);
                onChange({
                  ...shapeProp,
                  points: flattenDeep(nextPoints),
                });
              }
            }
          }
        }}
        onClick={onSelect}
        onMouseMove={(e) => {
          if (shapeProp.isDone) {
            e.target.setAttrs({ fill: POLY_COLOR.MOUSE_OVER });
          }
        }}
        onMouseOut={(e) => {
          if (shapeProp.isDone) {
            e.target.setAttrs({ fill: POLY_COLOR.MOUSE_OUT });
          }
        }}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getAttrs();
          onChange({
            ...shapeProp,
            points: shapeProp.points?.map((point, index) => {
              return point + (index % 2 ? y : x);
            }),
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

      <>
        {isSelected && shapeProp.isDone && (
          <Transformer nodes={[shapeRef.current]} enabledAnchors={[]} />
        )}
        {(!shapeProp.isDone || isSelected) &&
          !isDragging &&
          !isTransforming && (
            <>
              {nodes.map(([x = 0, y = 0], index) => {
                return (
                  <Anchor
                    key={index}
                    visible
                    x={x}
                    y={y}
                    draggable={shapeProp.isDone}
                    onDblClick={() => {
                      if (isSelected) {
                        const nextPoints = pointsToNodes(
                          shapeProp.points || []
                        );
                        if (isStillPolygon()) {
                          let points = nextPoints.filter((_, i) => {
                            return i !== index;
                          });

                          // we need to point the last to the first;
                          if (index === 0) {
                            points[points.length - 1] = points[0];
                          }
                          onChange({
                            ...shapeProp,
                            points: flattenDeep(points),
                          });
                        }
                      }
                    }}
                    onMouseOver={(e: KonvaEventObject<MouseEvent>) => {
                      if (!shapeProp.isDone && index === 0) {
                        cbIsOverStart(true);
                      }
                      e.target.setAttrs({
                        scaleX: 1.4,
                        scaleY: 1.4,
                      });
                    }}
                    onMouseOut={(e: KonvaEventObject<MouseEvent>) => {
                      if (!shapeProp.isDone && index === 0) {
                        cbIsOverStart(false);
                      }
                      e.target.setAttrs({
                        scaleX: 1,
                        scaleY: 1,
                      });
                    }}
                    onDragStart={() => {
                      setIsAdjustingPoint(true);
                    }}
                    onDragEnd={() => {
                      setIsAdjustingPoint(false);
                    }}
                    onDragMove={(e: KonvaEventObject<MouseEvent>) => {
                      if (!shapeProp.isDone) return;
                      const { x, y } = e.target.getPosition();
                      const nextPoints = pointsToNodes(shapeProp.points || []);
                      nextPoints[index] = [x, y];
                      // the first and last point should be the same
                      if (index === 0) {
                        nextPoints[nextPoints.length - 1] = [x, y];
                      }
                      onChange({
                        ...shapeProp,
                        points: flattenDeep(nextPoints),
                      });
                    }}
                  />
                );
              })}
              {!isAdjustingPoint &&
                !isTransforming &&
                labelPos.x !== 0 &&
                shapeProp.isDone && (
                  <ToolTip position={labelPos} comment={shapeProp.comment} />
                )}
            </>
          )}
      </>
    </>
  );
};

export default Polygon;
