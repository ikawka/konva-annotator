import React, { useEffect, useState } from "react";
import { Line } from "react-konva";
import { flattenDeep } from "lodash";
import { KonvaEventObject } from "konva/lib/Node";
import { Anchor } from "./Anchor";
import { Nodes, ShapeProp } from "./types";
import { pointsToNodes } from "./utils";

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
  const [nodes, updateNodes] = useState<Nodes>([]);

  useEffect(() => {
    updateNodes(() => {
      // split points by pair
      const nodes = pointsToNodes(shapeProp.points || []);
      return nodes.slice(0, nodes.length - 1);
    });
  }, [shapeProp]);
  return (
    <>
      <Line
        points={shapeProp.points}
        stroke="red"
        strokeWidth={3}
        fill="rgba(255,255,255,0.5)"
        closed={true}
        draggable={isSelected}
        onClick={onSelect}
      />
      {(isSelected || !shapeProp.isClosed) &&
        nodes.map((node, index) => {
          return (
            <Anchor
              key={index}
              visible
              x={node[0] || 0}
              y={node[1] || 0}
              draggable={shapeProp.isClosed}
              onMouseOver={(e: KonvaEventObject<MouseEvent>) => {
                if (!shapeProp.isClosed && index === 0) {
                  // not done drawing yet
                  cbIsOverStart(true);
                }

                e.target.scaleX(1.4);
                e.target.scaleY(1.4);
              }}
              onMouseOut={(e: KonvaEventObject<MouseEvent>) => {
                if (!shapeProp.isClosed && index === 0) {
                  // not done drawing yet
                  cbIsOverStart(false);
                }
                e.target.setAttrs({
                  scaleX: 1,
                  scaleY: 1,
                });
              }}
              onDragMove={(e: KonvaEventObject<MouseEvent>) => {
                if (!shapeProp.isClosed) return;
                const { x, y } = e.target.getPosition();
                const nextPoints = pointsToNodes(shapeProp.points || []);
                nextPoints[index] = [x, y];
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
