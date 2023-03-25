import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Rect, Transformer } from "react-konva";

import ToolTip from "./ToolTip";
import { Position, ShapeProp } from "./types";
import { getBoundingBox } from "./utils";

interface Props {
  shapeProps: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
}

const minWidth = 5;
const minHeight = 5;
const labelOffest = 10;

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Rect>(null);
  const trRef = React.useRef<Konva.Transformer>(null);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [labelPos, updateLabelPos] = React.useState<Position>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();

      // set label position
      const { x, y, height, width, rotation } = shapeRef.current.getAttrs();
      const bounding = getBoundingBox(x, y, width, height, rotation);
      updateLabelPos({
        x: bounding.x,
        y: bounding.y + bounding.height + labelOffest,
      });
    }
  }, [isSelected, shapeRef]);

  return (
    <React.Fragment>
      <Rect
        onClick={(e) => {
          onSelect(e);
        }}
        onTap={onSelect}
        ref={shapeRef}
        x={shapeProps.x}
        y={shapeProps.y}
        height={shapeProps.height}
        width={shapeProps.width}
        rotation={shapeProps.rotation}
        draggable={isSelected}
        stroke={shapeProps.color || "red"}
        fill="rgba(255, 255, 255, 0)"
        strokeWidth={shapeProps.strokeWidth}
        onDragMove={(e) => {
          const { x, y, height, width, rotation } = e.target.getAttrs();
          const bounding = getBoundingBox(x, y, width, height, rotation);
          updateLabelPos({
            x: bounding.x,
            y: bounding.y + bounding.height + labelOffest,
          });
        }}
        onDragEnd={(e) => {
          const { x, y } = e.target.getPosition();
          onChange({
            ...shapeProps,
            x,
            y,
          });
        }}
        onMouseMove={(e) => {
          e.target.setAttrs({ fill: "rgba(255, 255, 255, 0.3)" });
        }}
        onMouseOut={(e) => {
          e.target.setAttrs({ fill: "rgba(255, 255, 255, 0)" });
        }}
        onTransform={(e) => {
          setIsResizing(true);
          // const { width, height, scaleX, scaleY } = e.target.getAttrs();
          // const nextWidth = Math.max(width * scaleX, minWidth);
          // const nextHeight = Math.max(height * scaleY, minHeight);
          // e.target.setAttrs({
          //   width: nextWidth,
          //   height: nextHeight,
          // });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          setIsResizing(false);
          const node = e.target || undefined;
          if (node) {
            const { x, y, scaleX, scaleY, rotation, width, height } =
              node.getAttrs();
            const nextWidth = Math.max(width * scaleX, minWidth);
            const nextHeight = Math.max(height * scaleY, minHeight);
            // we will reset it back
            node.scale({ x: 1, y: 1 });
            const data = {
              ...shapeProps,
              x,
              y,
              width: nextWidth,
              height: nextHeight,
              rotation,
            };
            onChange(data);
            // https://stackoverflow.com/questions/59098408/konva-get-corners-coordinate-of-a-rotated-rectangle
            const bounding = getBoundingBox(
              x,
              y,
              nextWidth,
              nextHeight,
              rotation
            );

            updateLabelPos({
              x: bounding.x,
              y: bounding.y + bounding.height + labelOffest,
            });
          }
        }}
        zIndex={6}
      />
      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            ignoreStroke
            padding={5}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < minWidth || newBox.height < minHeight) {
                return oldBox;
              }
              return newBox;
            }}
            zIndex={5}
          />
          {!isResizing && labelPos.x !== 0 && <ToolTip position={labelPos} />}
        </>
      )}
    </React.Fragment>
  );
};

export default Rectangle;
