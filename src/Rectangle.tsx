import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Rect, Transformer, Label } from "react-konva";
import { Html } from "react-konva-utils";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ToolTip = styled.div`
  background: #333;
  color: white;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  min-width: 250px;
`;

const Arrow = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
  top: -4px;
`;

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

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Rect>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected, shapeRef]);
  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        stroke="red"
        strokeWidth={2}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current || undefined;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            const data = {
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              // set minimal value
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            };
            onChange(data);
          }
        }}
      />
      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          <Label x={shapeProps.x} y={shapeProps.y + shapeProps.height + 10}>
            <Html>
              <ToolTip role="tooltip">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <FontAwesomeIcon icon={faXmark} />
                </div>
                <div>My tooltip</div>
                <Arrow data-popper-arrow />
              </ToolTip>
            </Html>
          </Label>
        </>
      )}
    </React.Fragment>
  );
};

export default Rectangle;
