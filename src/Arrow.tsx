import React, { useState } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Arrow as KonvaArrow } from "react-konva";
import { Nodes, ShapeProp } from "./types";
import { Anchor } from "./Anchor";
import { getLineDistance, pointsToNodes } from "./utils";
import { flattenDeep } from "lodash";
import { MIN_LINE_LENGTH } from "./constants";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const Arrow = ({ shapeProps, isSelected, onChange, onSelect }: Props) => {
  const shapeRef = React.useRef<Konva.Arrow>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [nodes, updateNodes] = useState<Nodes>([]);

  const checkLength = (index: number, point: number[]) => {
    const check = [...nodes];
    check[index] = point;
    const [x1, y1, x2, y2] = flattenDeep(check);
    return getLineDistance(x1, y1, x2, y2) >= MIN_LINE_LENGTH;
  };

  React.useEffect(() => {
    shapeRef.current?.setAttrs({ x: 0, y: 0 });
    updateNodes(pointsToNodes(shapeProps.points || []));
    setIsDragging(false);
  }, [shapeProps]);

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        points={shapeProps.points || []}
        stroke={shapeProps.color || "red"}
        strokeWidth={shapeProps.strokeWidth}
        pointerLength={shapeProps.strokeWidth || 4 * 2}
        pointerWidth={shapeProps.strokeWidth || 4 * 2}
        onClick={onSelect}
        draggable={isSelected}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getAttrs();
          const [x1, y1, x2, y2] = shapeProps.points ?? [];
          e.target.setAttrs({ x: 0, y: 0 });
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
          {nodes.map((node, index) => (
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
                    ...shapeProps,
                    points: flattenDeep(nodes),
                  });
                  updateNodes(nodes);
                } else {
                  const n = pointsToNodes(shapeProps.points || []);
                  e.target.setAttrs({ x: n[index][0], y: n[index][1] });
                }
              }}
            />
          ))}
        </>
      )}
    </>
  );
};

export default Arrow;
