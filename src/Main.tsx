import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import "./App.css";
import Rectangle from "./components/shapes/Rectangle";
import bg from "./imgs/apartment-buildings.webp";
import Toolbar from "./components/Toolbar";
import { getLineDistance, isDrawable } from "./utils";
import Pin from "./components/shapes/Pin";
import { useImage } from "react-konva-utils";
import Konva from "konva";
import styled from "styled-components";
import Arrow from "./components/shapes/Arrow";
import { ShapeProp, Tool } from "./types";
import Polygon from "./components/shapes/Polygon";
import Freehand from "./components/shapes/Freehand";
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
  overflow: hidden;
`;

interface StageDimension {
  width: number;
  height: number;
}

const initialAnnotation: ShapeProp[] = [
  {
    tool: "poly",
    x: 132,
    y: 197,
    width: 2,
    height: 3,
    key: "3",
    rotation: 0,
    color: "#ff0000",
    strokeWidth: 3,
    points: [132, 197, 94, 284, 216, 311, 246, 213, 132, 197],
    isDone: true,
    comment: [
      {
        comment:
          "Bacon ipsum dolor amet chicken ground round jowl pancetta pork bacon biltong picanha.",
      },
      {
        comment:
          "Sausage jerky bacon pastrami. Landjaeger tri-tip venison leberkas pastrami sausage.",
      },
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
