import React, { useEffect, useRef } from "react";
import { Transformer as KonvaTransform } from "react-konva";
import Konva from "konva";
import { RECT_MIN_HEIGHT, RECT_MIN_WIDTH } from "./constants";

interface Props {
  nodes?: any;
  enabledAnchors?: string[];
}

const Transformer = ({ nodes, enabledAnchors }: Props) => {
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (nodes) {
      trRef.current?.nodes(nodes as any);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [nodes]);

  if (!nodes) return <></>;
  return (
    <KonvaTransform
      ref={trRef}
      ignoreStroke
      padding={5}
      rotateAnchorOffset={15}
      enabledAnchors={enabledAnchors}
      boundBoxFunc={(oldBox, newBox) => {
        // limit resize
        if (newBox.width < RECT_MIN_WIDTH || newBox.height < RECT_MIN_HEIGHT) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
};

export default Transformer;
