import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import "./App.css";
import Rectangle from "./Rectangle";
import bg from "./imgs/apartment-buildings.webp";
import Toolbar from "./Toolbar";
import { getLineDistance, isDrawable } from "./utils";
import Pin from "./Pin";
import { useImage } from "react-konva-utils";
import Konva from "konva";
import styled from "styled-components";
import Arrow from "./Arrow";
import { ShapeProp, Tool } from "./types";
import Polygon from "./Polygon";
import Freehand from "./Freehand";
import { PIN_WIDTH, PIN_HEIGHT, MIN_LINE_LENGTH } from "./constants";

const Shadow = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.15) inset;
  z-index: 99999;
  pointer-events: none;
`;

interface StageDimension {
  width: number;
  height: number;
}

const initialAnnotation: ShapeProp[] = [
  {
    x: 0,
    y: 0,
    width: 190.5,
    height: 77,
    key: "1",
    tool: "freehand",
    rotation: 0,
    color: "#ff0000",
    strokeWidth: 3,
    isDone: true,
    points: [
      154.5, 78, 154.5, 77, 153.5, 76, 152.5, 76, 152.5, 75, 150.5, 75, 150.5,
      74, 149.5, 73, 147.5, 73, 147.5, 72, 145.5, 72, 144.5, 71, 141.5, 70,
      140.5, 70, 138.5, 70, 137.5, 70, 134.5, 68, 131.5, 68, 128.5, 67, 126.5,
      67, 124.5, 67, 120.5, 66, 119.5, 66, 115.5, 65, 112.5, 65, 109.5, 65,
      107.5, 64, 104.5, 64, 102.5, 64, 101.5, 64, 99.5, 64, 98.5, 64, 97.5, 64,
      95.5, 64, 92.5, 66, 90.5, 67, 89.5, 68, 87.5, 68, 85.5, 70, 83.5, 71,
      81.5, 72, 78.5, 74, 75.5, 75, 72.5, 76, 69.5, 78, 66.5, 81, 63.5, 82,
      60.5, 83, 60.5, 85, 58.5, 86, 57.5, 86, 57.5, 87, 56.5, 89, 55.5, 90,
      55.5, 91, 55.5, 93, 55.5, 95, 55.5, 98, 55.5, 100, 55.5, 101, 55.5, 102,
      55.5, 104, 55.5, 107, 55.5, 108, 56.5, 111, 56.5, 113, 57.5, 115, 58.5,
      118, 58.5, 119, 58.5, 121, 59.5, 123, 59.5, 126, 60.5, 127, 61.5, 128,
      61.5, 130, 62.5, 131, 62.5, 132, 63.5, 134, 64.5, 135, 65.5, 136, 66.5,
      136, 67.5, 137, 68.5, 138, 70.5, 139, 72.5, 140, 73.5, 141, 76.5, 142,
      78.5, 143, 79.5, 143, 82.5, 145, 84.5, 146, 87.5, 147, 88.5, 147, 93.5,
      148, 96.5, 149, 98.5, 150, 102.5, 151, 104.5, 151, 109.5, 152, 111.5, 153,
      116.5, 154, 118.5, 154, 121.5, 154, 123.5, 154, 124.5, 154, 126.5, 154,
      128.5, 154, 129.5, 154, 132.5, 154, 133.5, 153, 135.5, 153, 136.5, 153,
      139.5, 152, 141.5, 151, 143.5, 151, 146.5, 150, 148.5, 150, 151.5, 149,
      154.5, 148, 158.5, 148, 162.5, 147, 166.5, 146, 168.5, 146, 174.5, 145,
      178.5, 144, 179.5, 144, 187.5, 142, 190.5, 140, 194.5, 139, 196.5, 138,
      199.5, 137, 203.5, 134, 205.5, 134, 207.5, 132, 209.5, 131, 211.5, 130,
      213.5, 128, 215.5, 126, 216.5, 125, 218.5, 124, 218.5, 123, 221.5, 120,
      222.5, 119, 222.5, 118, 223.5, 116, 224.5, 115, 224.5, 113, 224.5, 112,
      224.5, 111, 224.5, 110, 224.5, 109, 224.5, 108, 224.5, 107, 224.5, 106,
      224.5, 105, 224.5, 104, 224.5, 103, 224.5, 102, 224.5, 101, 224.5, 100,
      223.5, 99, 223.5, 98, 222.5, 97, 222.5, 96, 222.5, 95, 221.5, 94, 219.5,
      92, 219.5, 91, 218.5, 90, 217.5, 89, 217.5, 88, 216.5, 87, 215.5, 86,
      214.5, 86, 214.5, 85, 213.5, 84, 212.5, 84, 212.5, 83, 211.5, 83, 210.5,
      82, 209.5, 82, 209.5, 81, 208.5, 81, 207.5, 81, 206.5, 80, 205.5, 80,
      205.5, 79, 204.5, 79, 203.5, 79, 202.5, 78, 201.5, 78, 200.5, 78, 200.5,
      77, 199.5, 77, 198.5, 77, 197.5, 77, 196.5, 77, 195.5, 77, 194.5, 77,
      193.5, 77, 192.5, 77, 191.5, 77, 190.5, 77,
    ],
  },
];

const Main = () => {
  const [image] = useImage(bg);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<Konva.Group>(null);

  const [dimension, updateDimension] = useState<StageDimension>({
    width: 0,
    height: 0,
  });
  const [annotations, setAnnotations] =
    useState<ShapeProp[]>(initialAnnotation);
  const [nextAnnotation, setNextAnnotation] = useState<ShapeProp[]>([]);
  const [selectedId, selectShape] = useState<number>(-1);
  const [currentTool, setCurrentTool] = useState<Tool>("pointer");

  const [isDrawPoly, setIsDrawPoly] = useState<boolean>(false);
  const [polyPoints, updatePolyPoints] = useState<number>(1);
  const [polyIsOverStart, setPolyIsOverStart] = useState<boolean>(false);

  const [color, setColor] = useState<string>("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  let pinCnt = 0;

  const onToolbarSelect = useCallback((tool: Tool) => {
    setCurrentTool(tool);
    setNextAnnotation([]);
    setIsDrawPoly(false);
    setPolyIsOverStart(false);
    updatePolyPoints(1);
  }, []);

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    if (event.target !== event.target.getStage() && !isDrawable(currentTool))
      return;

    selectShape(-1);
    const stage = event.target?.getStage();
    if (
      nextAnnotation.length === 0 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current &&
      !isDrawPoly
    ) {
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      let startX = x / stage.scaleX() - groupRef.current.x();
      let startY = y / stage.scaleY() - groupRef.current.y();
      let data: ShapeProp = {
        tool: currentTool,
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        key: "0",
        rotation: 0,
        color,
        strokeWidth,
      };
      switch (currentTool) {
        case "pin":
          data.x = startX - PIN_WIDTH / 2;
          data.y = startY - PIN_HEIGHT;
          data.strokeWidth = 0;
          break;
        case "arrow":
          data.points = [startX, startY, startX, startY];
          break;
        case "poly":
          data.points = [startX, startY];
          setIsDrawPoly(true);
          break;
        case "freehand":
          data.points = [startX, startY];
          data.x = 0;
          data.y = 0;
      }

      setNextAnnotation([data]);
    } else if (isDrawPoly && stage && groupRef.current) {
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      let nextX = x / stage.scaleX() - groupRef.current.x();
      let nextY = y / stage.scaleY() - groupRef.current.y();

      if (polyIsOverStart) {
        if (polyPoints <= 2) return;
        const points = [
          ...(nextAnnotation[0].points?.slice(
            0,
            nextAnnotation[0].points.length - 2
          ) || []),
        ];
        const annotationToAdd: ShapeProp = {
          ...nextAnnotation[0],
          points: [...points, points[0], points[1]],
          key: `${annotations.length + 1}`,
          tool: currentTool,
          isDone: true,
        };
        annotations.push(annotationToAdd);
        setNextAnnotation([]);
        setAnnotations(annotations);
        updatePolyPoints(1);
        setIsDrawPoly(false);
        setPolyIsOverStart(false);
      } else {
        const points = [
          ...(nextAnnotation[0].points?.slice(
            0,
            nextAnnotation[0].points.length - 2
          ) || []),
          nextX,
          nextY,
        ];
        setNextAnnotation((prev) => {
          return [{ ...prev[0], points }];
        });
        updatePolyPoints((prev) => prev + 1);
      }
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent>) => {
    if (currentTool === "poly") return;
    const stage = event.target?.getStage();
    if (
      nextAnnotation.length === 1 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current
    ) {
      const sx = nextAnnotation[0].x;
      const sy = nextAnnotation[0].y;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const endX = x / stage.scaleX() - groupRef.current.x();
      const endY = y / stage.scaleY() - groupRef.current.y();
      const width = endX - sx;
      const height = endY - sy;

      // normalize negative values before adding
      let data: ShapeProp = {
        x: width < 0 ? sx + width : sx,
        y: height < 0 ? sy + height : sy,
        width: Math.abs(width),
        height: Math.abs(height),
        key: `${annotations.length + 1}`,
        tool: currentTool,
        rotation: 0,
        color,
        strokeWidth,
        isDone: true,
      };

      switch (currentTool) {
        case "pin":
          data.strokeWidth = 0;
          break;
        case "arrow":
          data = { ...data, points: [sx, sy, endX, endY], x: sx, y: sy };
          console.log(getLineDistance(sx, sy, endX, endY));
          break;
        case "freehand":
          data = { ...data, points: nextAnnotation[0].points, x: 0, y: 0 };
      }

      if (
        currentTool === "arrow" &&
        getLineDistance(sx, sy, endX, endY) < MIN_LINE_LENGTH
      ) {
        setNextAnnotation([]);
        return;
      }

      annotations.push(data);
      setNextAnnotation([]);
      setAnnotations(annotations);
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target?.getStage();
    if (
      nextAnnotation.length === 1 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current
    ) {
      const startX = nextAnnotation[0].x;
      const startY = nextAnnotation[0].y;
      const pinWidth = 25;
      const pinHeight = 35;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      let endX = x / stage.scaleX() - groupRef.current.x();
      let endY = y / stage.scaleY() - groupRef.current.y();
      let data: ShapeProp = {
        tool: currentTool,
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        key: "0",
        rotation: 0,
        color,
        strokeWidth,
      };

      switch (currentTool) {
        case "pin":
          data.x = endX - pinWidth / 2;
          data.y = endY - pinHeight;
          data.strokeWidth = 0;
          break;
        case "arrow":
          data.points = [startX, startY, endX, endY];
          break;
        case "poly":
          let length = nextAnnotation[0].points?.length || 0;
          if (length / 2 > polyPoints) {
            length -= 2;
          }
          data.points = [
            ...(nextAnnotation[0].points?.slice(0, length) || []),
            endX,
            endY,
          ];
          break;
        case "freehand":
          data.points = [...(nextAnnotation[0].points || []), endX, endY];
          data.x = 0;
          data.y = 0;
      }

      setNextAnnotation([data]);
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

  useEffect(() => {
    if (isDrawable(currentTool)) {
      selectShape(-1);
    }
  }, [currentTool]);

  // this is necessary for real-time drawing
  const annotationsToDraw = [...annotations, ...nextAnnotation];
  console.log(annotations);
  return (
    <>
      <Toolbar
        onSelect={onToolbarSelect}
        onColorSelect={setColor}
        onStroWidthkeSet={setStrokeWidth}
      />
      <div className="App" ref={containerRef}>
        <Shadow />
        <Stage
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          {...dimension}
          onWheel={(e) => {
            // stop default scrolling
            e.evt.preventDefault();
            const scaleBy = 1.05;
            const stage = e.target.getStage();
            // const pointer = stage?.getPointerPosition();
            if (stage) {
              if (!stage || !groupRef.current) return;
              const oldScale = stage.scaleX();

              // how to scale? Zoom in? Or zoom out?
              let direction = e.evt.deltaY > 0 ? 1 : -1;

              // when we zoom on trackpad, e.evt.ctrlKey is true
              // in that case lets revert direction
              if (e.evt.ctrlKey) {
                direction = -direction;
              }

              const newScale =
                direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

              const scaleVal = { x: newScale, y: newScale };
              stage.scale(scaleVal);
              // const mousePointTo = {
              //   x: (pointer.x - stage.x()) / oldScale,
              //   y: (pointer.y - stage.y()) / oldScale,
              // };

              // const newPos = {
              //   x: pointer.x - mousePointTo.x * newScale,
              //   y: pointer.y - mousePointTo.y * newScale,
              // };
              // stage.position(newPos);
            }
          }}
        >
          <Layer>
            <Group
              draggable={!isDrawable(currentTool) && selectedId === -1}
              ref={groupRef}
            >
              <Image
                image={image}
                x={0}
                y={0}
                onClick={() => selectShape(-1)}
              />
              {annotationsToDraw.map((shape, index) => {
                switch (shape.tool) {
                  case "poly":
                    return (
                      <Polygon
                        cbIsOverStart={setPolyIsOverStart}
                        key={index}
                        shapeProp={shape}
                        isSelected={index === selectedId}
                        onChange={(nextAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = nextAttrs;
                          setAnnotations(r);
                        }}
                        onSelect={() => {
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                      />
                    );
                  case "arrow":
                    return (
                      <Arrow
                        key={index}
                        shapeProps={shape}
                        isSelected={index === selectedId}
                        onSelect={() => {
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                        onChange={(nextAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = nextAttrs;
                          setAnnotations(r);
                        }}
                      />
                    );
                  case "pin":
                    return (
                      <Pin
                        key={index}
                        count={(pinCnt += 1)}
                        shapeProps={{ ...shape }}
                        isSelected={index === selectedId}
                        onSelect={() => {
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                        onChange={(nextAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = nextAttrs;
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
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                        shapeProps={{
                          ...shape,
                          width: shape.width ?? 0,
                          height: shape.height ?? 0,
                        }}
                        onChange={(nextAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = nextAttrs;
                          setAnnotations(r);
                        }}
                      />
                    );

                  case "freehand":
                    return (
                      <Freehand
                        key={index}
                        isSelected={index === selectedId}
                        shapeProps={shape}
                        onSelect={() => {
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                        onChange={(nextAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = nextAttrs;
                          setAnnotations(r);
                        }}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Group>
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default Main;
