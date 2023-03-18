import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Rect, Transformer, Label } from "react-konva";
import { Html } from "react-konva-utils";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencil } from "@fortawesome/free-solid-svg-icons";

const ToolTip = styled.div`
  background: #333;
  color: white;
  padding: 8px 8px;
  font-size: 18px;
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

interface LabelPos {
  x: number;
  y: number;
}

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Rect>(null);
  const trRef = React.useRef<Konva.Transformer>(null);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [labelPos, updateLabelPos] = React.useState<LabelPos>({ x: 0, y: 0 });

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
      updateLabelPos({
        x: shapeRef.current.x(),
        y: shapeRef.current.y() + shapeRef.current.height() + 10,
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
        {...shapeProps}
        draggable={isSelected}
        stroke="red"
        fill="rgba(255, 255, 255, 0)"
        strokeWidth={2}
        onDragMove={() => {
          if (shapeRef.current) {
            updateLabelPos({
              x: shapeRef.current.x(),
              y: shapeRef.current.y() + shapeRef.current.height() + 10,
            });
          }
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onMouseMove={() => {
          const node = shapeRef.current || undefined;
          if (node) {
            node.fill("rgba(255, 255, 255, 0.3)");
          }
        }}
        onMouseOut={() => {
          const node = shapeRef.current || undefined;
          if (node) {
            node.fill("rgba(255, 255, 255, 0)");
          }
        }}
        onTransform={() => {
          setIsResizing(true);
          const node = shapeRef.current || undefined;
          if (node) {
            node.strokeWidth(node.strokeWidth());
          }
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          setIsResizing(false);
          const node = e.target || undefined;
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
              height: Math.max(5, node.height() * scaleY),
            };
            onChange(data);
            updateLabelPos({
              x: data.x,
              y: data.y + data.height + 10,
            });
          }
        }}
      />
      {isSelected && (
        <>
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

          {!isResizing && (
            <Label {...labelPos}>
              <Html>
                <ToolTip role="tooltip">
                  <div>My tooltip</div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 16,
                      padding: 4,
                    }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                    <FontAwesomeIcon icon={faTrash} />
                  </div>
                  <Arrow data-popper-arrow />
                </ToolTip>
              </Html>
            </Label>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default Rectangle;
