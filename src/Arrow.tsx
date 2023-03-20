import React from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Arrow as KonvaArrow, Transformer } from "react-konva";

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

const Arrow = ({ shapeProps, isSelected, onChange, onSelect }: Props) => {
  const trRef = React.useRef<Konva.Transformer>(null);
  const shapeRef = React.useRef<Konva.Arrow>(null);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        points={[
          shapeProps.x,
          shapeProps.y,
          shapeProps.x + shapeProps.width,
          shapeProps.y + shapeProps.height,
        ]}
        fill="red"
        stroke="red"
        strokeWidth={4}
        pointerLength={5}
        pointerWidth={5}
        draggable={isSelected}
        onClick={(e) => onSelect(e)}
        onDragEnd={(e) => {
          if (trRef.current)
            onChange({
              ...shapeProps,
            });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end

          const node = trRef.current || undefined;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            const data = {
              ...shapeProps,
              // set minimal value
              width: Math.max(1, node.width() * scaleX),
              height: Math.max(1, node.height() * scaleY),
            };

            onChange(data);
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          ignoreStroke
          padding={5}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default Arrow;
