import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import { useImage } from "react-konva-utils";
import styled from "styled-components";

import bg from "./imgs/apartment-buildings.webp";

import "./App.css";
import {
  adjustImagePosition,
  fitImageToStage,
  getLineDistance,
  isDrawable,
  generateShapeData,
} from "./utils";
import Toolbar from "./components/Toolbar";
import Rectangle from "./components/shapes/Rectangle";
import Pin from "./components/shapes/Pin";
import Arrow from "./components/shapes/Arrow";
import Polygon from "./components/shapes/Polygon";
import Freehand from "./components/shapes/Freehand";
import Text from "./components/shapes/Text";

import { ShapeProp, Tool } from "./types";
import {
  PIN_WIDTH,
  PIN_HEIGHT,
  MIN_LINE_LENGTH,
  STAGE_DIMENSION,
  STAGE_PADDING,
  MIN_SCALE,
  MAX_SCALE,
} from "./constants";

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
  const [image, status] = useImage(bg);
  const [imgDimension, setImageDimension] = useState({
    width: 0,
    height: 0,
  });
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<Konva.Group>(null);
  const stageRef = useRef<Konva.Stage>(null);

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

  const [scale, setScale] = useState(1);

  let pinCnt = 0;
  const centerStageWidth = STAGE_DIMENSION.WIDTH / 2;
  const centerStageHeight = STAGE_DIMENSION.HEIGHT / 2;

  const onToolbarSelect = useCallback((tool: Tool) => {
    setCurrentTool(tool);
    setNextAnnotation([]);
    setIsDrawPoly(false);
    setPolyIsOverStart(false);
    updatePolyPoints(1);
  }, []);

  const generateSmallestDimension = useCallback(() => {
    const { width = 0, height = 0 } = image ?? {};
    return fitImageToStage({
      imageSize: { width, height },
      stageSize: {
        width: STAGE_DIMENSION.WIDTH,
        height: STAGE_DIMENSION.HEIGHT,
      },
      padding: STAGE_PADDING,
    });
  }, [image]);

  const adjustPosition = useCallback(
    (scale: number) => {
      //recenter
      const { x, y } = groupRef.current?.getAttrs();
      const nextPos = adjustImagePosition({
        x,
        y,
        scale,
        imageSize: imgDimension,
        stageSize: {
          width: STAGE_DIMENSION.WIDTH,
          height: STAGE_DIMENSION.HEIGHT,
        },
      });

      setPos(nextPos);
      return nextPos;
    },
    [imgDimension]
  );

  const getStageMousePos = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = event.target?.getStage();

      if (!stage) return [0, 0];

      const { x, y } = stage?.getPointerPosition() ?? { x: 0, y: 0 };
      let nextX = x / scale - pos.x;
      let nextY = y / scale - pos.y;
      return [nextX, nextY];
    },
    [scale, pos]
  );

  const handleMouseDown = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      if (event.target !== event.target.getStage() && !isDrawable(currentTool))
        return;

      selectShape(-1);
      const [nextX, nextY] = getStageMousePos(event);

      if (
        nextAnnotation.length === 0 &&
        isDrawable(currentTool) &&
        !isDrawPoly
      ) {
        let data: ShapeProp = generateShapeData({
          shape: {
            tool: currentTool,
            x: nextX,
            y: nextY,
            width: 0,
            height: 0,
            key: "0",
            rotation: 0,
            color,
            strokeWidth,
          },
          tool: currentTool,
        });
        if (currentTool === "poly") setIsDrawPoly(true);
        setNextAnnotation([data]);
      } else if (isDrawPoly) {
        const { points: nextPoints = [] } = nextAnnotation[0];

        // check if polygon is closed
        if (polyIsOverStart) {
          if (polyPoints <= 2) return;
          const points = [
            ...(nextPoints.slice(0, nextPoints.length - 2) || []),
          ];
          const annotationToAdd: ShapeProp = {
            ...nextAnnotation[0],
            points: [...points, points[0], points[1]],
            key: `${annotations.length + 1}`,
            tool: currentTool,
            isDone: true,
          };

          annotations.push(annotationToAdd);

          // reset points
          setNextAnnotation([]);
          setAnnotations(annotations);
          updatePolyPoints(1);
          setIsDrawPoly(false);
          setPolyIsOverStart(false);
        } else {
          const points = [
            ...(nextPoints.slice(0, nextPoints.length - 2) || []),
            nextX,
            nextY,
          ];
          setNextAnnotation((prev) => {
            return [{ ...prev[0], points }];
          });
          updatePolyPoints((prev) => prev + 1);
        }
      }
    },
    [
      annotations,
      color,
      currentTool,
      getStageMousePos,
      isDrawPoly,
      nextAnnotation,
      polyIsOverStart,
      polyPoints,
      strokeWidth,
    ]
  );

  const handleMouseUp = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      if (currentTool === "poly") return;
      const stage = event.target?.getStage();
      if (
        nextAnnotation.length === 1 &&
        stage &&
        isDrawable(currentTool) &&
        groupRef.current
      ) {
        const startX = nextAnnotation[0].x;
        const startY = nextAnnotation[0].y;
        const [endX, endY] = getStageMousePos(event);
        const width = endX - startX;
        const height = endY - startY;

        // normalize negative values before adding
        let data: ShapeProp = {
          x: width < 0 ? startX + width : startX,
          y: height < 0 ? startY + height : startY,
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
            data = {
              ...data,
              points: [startX, startY, endX, endY],
              x: startX,
              y: startY,
            };
            console.log(getLineDistance(startX, startY, endX, endY));
            break;
          case "freehand":
            data = { ...data, points: nextAnnotation[0].points, x: 0, y: 0 };
        }

        if (
          currentTool === "arrow" &&
          getLineDistance(startX, startY, endX, endY) < MIN_LINE_LENGTH
        ) {
          setNextAnnotation([]);
          return;
        }

        annotations.push(data);
        setNextAnnotation([]);
        setAnnotations(annotations);
      }
    },
    [
      annotations,
      color,
      currentTool,
      getStageMousePos,
      nextAnnotation,
      strokeWidth,
    ]
  );

  const handleMouseMove = useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const stage = event.target?.getStage();
      if (
        nextAnnotation.length === 1 &&
        stage &&
        isDrawable(currentTool) &&
        groupRef.current
      ) {
        const startX = nextAnnotation[0].x;
        const startY = nextAnnotation[0].y;
        const [endX, endY] = getStageMousePos(event);
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
            data.x = endX - PIN_WIDTH / 2;
            data.y = endY - PIN_HEIGHT;
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
    },
    [
      color,
      currentTool,
      getStageMousePos,
      nextAnnotation,
      polyPoints,
      strokeWidth,
    ]
  );

  const zoom = useCallback(
    (ratio: number) => {
      let nextScale = scale + ratio;

      if (nextScale < MIN_SCALE) {
        nextScale = MIN_SCALE;
      }

      if (nextScale > MAX_SCALE) {
        nextScale = MAX_SCALE;
      }

      setScale(nextScale);
      adjustPosition(nextScale);
    },
    [adjustPosition, scale]
  );

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

  useEffect(() => {
    if (status === "loaded") {
      const { width, height } = generateSmallestDimension();

      setImageDimension({
        width,
        height,
      });
      setPos({
        x: centerStageWidth - width / 2,
        y: centerStageHeight - height / 2,
      });
    }
  }, [status, generateSmallestDimension, centerStageWidth, centerStageHeight]);
  // this is necessary for real-time drawing
  const annotationsToDraw = [...annotations, ...nextAnnotation];
  // console.log(annotations);
  return (
    <>
      <Toolbar
        onSelect={onToolbarSelect}
        onColorSelect={setColor}
        onStrokeWidthSet={setStrokeWidth}
        onZoom={zoom}
      />
      <div className="App" ref={containerRef}>
        <Shadow />
        {status === "loaded" && (
          <Stage
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            {...dimension}
            onWheel={(e) => {
              // stop default scrolling
              e.evt.preventDefault();
              const upOrDown = e.evt.deltaY / 5000;
              zoom(upOrDown);
            }}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              <Group
                width={imgDimension.width}
                height={imgDimension.height}
                draggable={!isDrawable(currentTool) && selectedId === -1}
                ref={groupRef}
                x={pos.x}
                y={pos.y}
                onDragEnd={() => {}}
                dragBoundFunc={(currentPos) => {
                  let x = currentPos.x;
                  let y = currentPos.y;
                  const width = imgDimension.width * scale;
                  const height = imgDimension.height * scale;

                  const centerWidth = width / 2;
                  const centerHeight = height / 2;

                  if (width < STAGE_DIMENSION.WIDTH) {
                    x = centerStageWidth - centerWidth;
                  }

                  if (x > 0 && width > STAGE_DIMENSION.WIDTH) {
                    x = 0;
                  }

                  if (
                    Math.abs(x) > width - STAGE_DIMENSION.WIDTH &&
                    width > STAGE_DIMENSION.WIDTH
                  ) {
                    x = STAGE_DIMENSION.WIDTH - width;
                  }

                  if (height < STAGE_DIMENSION.HEIGHT) {
                    y = centerStageHeight - centerHeight;
                  }

                  if (y > 0 && height > STAGE_DIMENSION.HEIGHT) {
                    y = 0;
                  }

                  if (
                    Math.abs(y) > height - STAGE_DIMENSION.HEIGHT &&
                    height > STAGE_DIMENSION.HEIGHT
                  ) {
                    y = STAGE_DIMENSION.HEIGHT - height;
                  }
                  const nextPos = { x, y };
                  setPos(nextPos);
                  return nextPos;
                }}
              >
                <Image
                  image={image}
                  x={0}
                  y={0}
                  width={imgDimension.width}
                  height={imgDimension.height}
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
                          parentScale={scale}
                        />
                      );
                    case "arrow":
                      return (
                        <Arrow
                          key={index}
                          shapeProp={shape}
                          isSelected={index === selectedId}
                          onSelect={() => {
                            if (!isDrawable(currentTool)) selectShape(index);
                          }}
                          onChange={(nextAttrs) => {
                            const r = annotationsToDraw.slice();
                            r[index] = nextAttrs;
                            setAnnotations(r);
                          }}
                          parentScale={scale}
                        />
                      );
                    case "pin":
                      return (
                        <Pin
                          key={index}
                          count={(pinCnt += 1)}
                          shapeProp={{ ...shape }}
                          isSelected={index === selectedId}
                          onSelect={() => {
                            if (!isDrawable(currentTool)) selectShape(index);
                          }}
                          onChange={(nextAttrs) => {
                            const r = annotationsToDraw.slice();
                            r[index] = nextAttrs;
                            setAnnotations(r);
                          }}
                          parentScale={scale}
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
                          shapeProp={{
                            ...shape,
                            width: shape.width ?? 0,
                            height: shape.height ?? 0,
                          }}
                          onChange={(nextAttrs) => {
                            const r = annotationsToDraw.slice();
                            r[index] = nextAttrs;
                            setAnnotations(r);
                          }}
                          parentScale={scale}
                        />
                      );

                    case "freehand":
                      return (
                        <Freehand
                          key={index}
                          isSelected={index === selectedId}
                          shapeProp={shape}
                          onSelect={() => {
                            if (!isDrawable(currentTool)) selectShape(index);
                          }}
                          onChange={(nextAttrs) => {
                            const r = annotationsToDraw.slice();
                            r[index] = nextAttrs;
                            setAnnotations(r);
                          }}
                          parentScale={scale}
                        />
                      );
                    case "text":
                      return (
                        <Text
                          key={index}
                          isSelected={index === selectedId}
                          shapeProp={shape}
                          onSelect={() => {
                            if (!isDrawable(currentTool)) selectShape(index);
                          }}
                          onChange={(nextAttrs) => {
                            const r = annotationsToDraw.slice();
                            r[index] = nextAttrs;
                            setAnnotations(r);
                          }}
                          parentScale={scale}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </>
  );
};

export default Main;
