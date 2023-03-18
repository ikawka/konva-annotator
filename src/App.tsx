import { useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import "./App.css";
import React from "react";
import { KonvaEventObject } from "konva/lib/Node";
import Rectangle from "./Rectangle";
import bg from "./imgs/apartment-buildings.webp";

interface StageDimension {
  width: number;
  height: number;
}

interface RectProp {
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimension, updateDimension] = useState<StageDimension>({
    width: 0,
    height: 0,
  });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rects, updateRects] = useState<RectProp[]>([]);
  const [selectedId, selectShape] = React.useState(-1);

  // methods
  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      updateRects((prev) => [
        ...prev,
        { x: pos.x, y: pos.y, width: 0, height: 0 },
      ]);
    }
  };

  const onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      updateRects((prev) => {
        prev[rects.length - 1].width = pos.x - prev[rects.length - 1].x;
        prev[rects.length - 1].height = pos.y - prev[rects.length - 1].y;
        return prev;
      });
    }
  };

  const onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      updateDimension({
        width: containerRef.current?.clientWidth,
        height: containerRef.current?.clientHeight,
      });
    }
  }, [containerRef]);

  return (
    <div className="App" ref={containerRef}>
      <Stage
        {...dimension}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Layer>
          {rects.map((rect, index) => {
            return (
              <Rectangle
                key={index}
                isSelected={index === selectedId}
                onSelect={() => {
                  selectShape(index);
                }}
                shapeProps={rect}
                onChange={(newAttrs) => {
                  const r = rects.slice();
                  r[index] = newAttrs;
                  updateRects(r);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
