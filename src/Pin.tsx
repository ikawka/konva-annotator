import { Html, useImage } from "react-konva-utils";
import { Image, Label } from "react-konva";
import pin from "./imgs/location.svg";
import { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import Konva from "konva";
import ToolTip from "./ToolTip";

// this is for customizable color pin
const pinSrc =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="white" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>';

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

const Pin = ({ shapeProps, onSelect, isSelected, onChange }: Props) => {
  const shapeRef = React.useRef<Konva.Image>(null);
  const [labelPos, updateLabelPos] = React.useState<LabelPos>({ x: 0, y: 0 });

  const [image] = useImage(pin);
  const width = 25;
  const height = 35;

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      updateLabelPos({
        x: shapeRef.current.x(),
        y: shapeRef.current.y() + shapeRef.current.height() + 10,
      });
    }
  }, [isSelected, shapeRef]);

  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={shapeProps.x}
        y={shapeProps.y}
        height={height}
        width={width}
        draggable={isSelected}
        onClick={(e) => onSelect(e)}
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
        shadowColor="rgba(0,0,0,0.5)"
        shadowOffset={{
          x: -2,
          y: 2,
        }}
        shadowBlur={5}
      />
      {isSelected && labelPos.x !== 0 && (
        <Label {...labelPos}>
          <Html>
            <ToolTip />
          </Html>
        </Label>
      )}
    </>
  );
};

export default Pin;
