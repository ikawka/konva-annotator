import { useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import "./App.css";
import Rectangle from "./Rectangle";
import bg from "./imgs/apartment-buildings.webp";
import Toolbar, { Tool } from "./Toolbar";
import { isDrawable } from "./utils";
import Pin from "./Pin";

interface StageDimension {
  width: number;
  height: number;
}

interface RectProp {
  tool: Omit<Tool, "pointer">;
  x: number;
  y: number;
  width: number;
  height: number;
  key: string;
}

const Main = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimension, updateDimension] = useState<StageDimension>({
    width: 0,
    height: 0,
  });
  const [annotations, setAnnotations] = useState<RectProp[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<RectProp[]>([]);
  const [selectedId, selectShape] = useState<number>(-1);
  const [currentTool, setCurrentTool] = useState<Tool>("pointer");

  const onToolbarSelect = (tool: Tool) => {
    setCurrentTool(tool);
  };

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    if (event.target !== event.target.getStage()) return;
    const stage = event.target?.getStage();
    if (newAnnotation.length === 0 && stage && isDrawable(currentTool)) {
      const pinWidth = 25;
      const pinHeight = 35;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      let startX = x;
      let startY = y;
      if (currentTool === "pin") {
        startX = x - pinWidth / 2;
        startY = y - pinHeight;
      }
      setNewAnnotation([
        {
          tool: currentTool,
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          key: "0",
        },
      ]);
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target?.getStage();
    if (newAnnotation.length === 1 && stage && isDrawable(currentTool)) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const width = x - sx;
      const height = y - sy;

      // normalize negative values before adding
      const annotationToAdd = {
        x: width < 0 ? sx + width : sx,
        y: height < 0 ? sy + height : sy,
        width: Math.abs(width),
        height: Math.abs(height),
        key: `${annotations.length + 1}`,
        tool: currentTool,
      };
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target?.getStage();
    if (newAnnotation.length === 1 && stage && isDrawable(currentTool)) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      setNewAnnotation([
        {
          tool: currentTool,
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          key: "0",
        },
      ]);
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

  // this is necessary for real-time drawing
  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <>
      <Toolbar onSelect={onToolbarSelect} />
      <div className="App" ref={containerRef}>
        <Stage
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          {...dimension}
          style={{
            backgroundImage: `url(${bg})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <Layer>
            {annotationsToDraw.map((shape, index) => {
              switch (shape.tool) {
                case "pin":
                  return (
                    <Pin
                      key={index}
                      shapeProps={shape}
                      isSelected={index === selectedId}
                      onSelect={() => {
                        selectShape(index);
                      }}
                      onChange={(newAttrs) => {
                        const r = annotationsToDraw.slice();
                        r[index] = newAttrs;
                        setAnnotations(r);
                      }}
                    />
                  );
                case "rect":
                  return (
                    <Rectangle
                      key={index}
                      isSelected={index === selectedId}
                      onSelect={() => {
                        selectShape(index);
                      }}
                      shapeProps={shape}
                      onChange={(newAttrs) => {
                        const r = annotationsToDraw.slice();
                        r[index] = newAttrs;
                        setAnnotations(r);
                      }}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default Main;