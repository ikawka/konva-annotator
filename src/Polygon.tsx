import React, { useEffect, useState } from "react";
import { Line } from "react-konva";
import { flattenDeep } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Anchor } from "./Anchor";
import { Nodes, ShapeProp } from "./types";
import { pointsToNodes } from "./utils";
import Konva from "konva";
import { DEFAULT_COLOR, POLY_COLOR } from "./constants";

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
  const shapeRef = React.useRef<Konva.Line>(null);
  const [nodes, updateNodes] = useState<Nodes>([]);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  useEffect(() => {
    // shapeRef.current?.setAttrs({ x: 0, y: 0 });
    updateNodes(() => {
      // split points by pair
      const nodes = pointsToNodes(shapeProp.points || []);
      return nodes.slice(0, nodes.length - 1);
    });
    setIsDragging(false);
  }, [shapeProp]);

  return (
    <>
      <Line
        ref={shapeRef}
        points={shapeProp.points}
        stroke={shapeProp.color || DEFAULT_COLOR}
        strokeWidth={shapeProp.strokeWidth}
        fill={!shapeProp.isDone ? POLY_COLOR.MOUSE_OVER : POLY_COLOR.MOUSE_OUT}
        closed={true}
        draggable={isSelected}
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
            x: shapeProp.x + x,
            y: shapeProp.y + y,
          });
          // reset to container
          e.target.setAttrs({ x: 0, y: 0 });
        }}
      />
      {(isSelected || !shapeProp.isDone) &&
        !isDragging &&
        nodes.map(([x = 0, y = 0], index) => {
          return (
            <Anchor
              key={index}
              visible
              x={x}
              y={y}
              draggable={shapeProp.isDone}
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
    </>
  );
};

export default Polygon;
