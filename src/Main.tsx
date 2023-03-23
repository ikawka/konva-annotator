import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
// import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import "./App.css";
import Rectangle from "./Rectangle";
import bg from "./imgs/apartment-buildings.webp";
import Toolbar, { Tool } from "./Toolbar";
import { isDrawable } from "./utils";
import Pin from "./Pin";
import { useImage } from "react-konva-utils";
import Konva from "konva";
import styled from "styled-components";
import Arrow from "./Arrow";
import { ShapeProp } from "./types";
import Polygon from "./Polygon";

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

const initialAnnotation = [
  {
    height: 95.00000000000009,
    key: "1",
    rotation: 17.969139740156397,
    tool: "rect",
    width: 152.99999999999966,
    x: 211.38542750719773,
    y: 137.71630670006996,
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
  const [newAnnotation, setNewAnnotation] = useState<ShapeProp[]>([]);
  const [selectedId, selectShape] = useState<number>(-1);
  const [currentTool, setCurrentTool] = useState<Tool>("pointer");

  const [isDrawPoly, setIsDrawPoly] = useState<boolean>(false);
  const [polyPoints, updatePolyPoints] = useState<number>(1);
  const [polyIsOverStart, setPolyIsOverStart] = useState<boolean>(false);

  const [color, setColor] = useState<string>("#ff0000");

  const onToolbarSelect = (tool: Tool) => {
    setCurrentTool(tool);
  };

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    if (event.target !== event.target.getStage() && !isDrawable(currentTool))
      return;

    selectShape(-1);
    const stage = event.target?.getStage();
    if (
      newAnnotation.length === 0 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current &&
      !isDrawPoly
    ) {
      const pinWidth = 25;
      const pinHeight = 35;
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
      };
      switch (currentTool) {
        case "pin":
          data.x = startX - pinWidth / 2;
          data.y = startY - pinHeight;
          break;
        case "arrow":
          data.points = [startX, startY, startX, startY];
          break;
        case "poly":
          data.points = [startX, startY];
          setIsDrawPoly(true);
      }

      setNewAnnotation([data]);
    } else if (isDrawPoly && stage && groupRef.current) {
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      let nextX = x / stage.scaleX() - groupRef.current.x();
      let nextY = y / stage.scaleY() - groupRef.current.y();

      if (polyIsOverStart) {
        if (polyPoints <= 2) return;
        const points = [
          ...(newAnnotation[0].points?.slice(
            0,
            newAnnotation[0].points.length - 2
          ) || []),
        ];
        const annotationToAdd: ShapeProp = {
          ...newAnnotation[0],
          points: [...points, points[0], points[1]],
          key: `${annotations.length + 1}`,
          tool: currentTool,
          isClosed: true,
        };
        annotations.push(annotationToAdd);
        setNewAnnotation([]);
        setAnnotations(annotations);
        updatePolyPoints(1);
        setIsDrawPoly(false);
        setPolyIsOverStart(false);
      } else {
        const points = [
          ...(newAnnotation[0].points?.slice(
            0,
            newAnnotation[0].points.length - 2
          ) || []),
          nextX,
          nextY,
        ];
        setNewAnnotation((prev) => {
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
      newAnnotation.length === 1 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current
    ) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const endX = x / stage.scaleX() - groupRef.current.x();
      const endY = y / stage.scaleY() - groupRef.current.y();
      const width = endX - sx;
      const height = endY - sy;

      // normalize negative values before adding
      let annotationToAdd: ShapeProp = {
        x: width < 0 ? sx + width : sx,
        y: height < 0 ? sy + height : sy,
        width: Math.abs(width),
        height: Math.abs(height),
        key: `${annotations.length + 1}`,
        tool: currentTool,
        rotation: 0,
        color,
      };

      if (currentTool === "arrow") {
        annotationToAdd = {
          points: [sx, sy, endX, endY],
          x: sx,
          y: sy,
          key: `${annotations.length + 1}`,
          tool: currentTool,
          rotation: 0,
          color,
        };
      }
      annotations.push(annotationToAdd);
      setNewAnnotation([]);
      setAnnotations(annotations);
    }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target?.getStage();
    if (
      newAnnotation.length === 1 &&
      stage &&
      isDrawable(currentTool) &&
      groupRef.current
    ) {
      const startX = newAnnotation[0].x;
      const startY = newAnnotation[0].y;
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
      };

      switch (currentTool) {
        case "pin":
          data.x = endX - pinWidth / 2;
          data.y = endY - pinHeight;
          break;
        case "arrow":
          data.points = [startX, startY, endX, endY];
          break;
        case "poly":
          let length = newAnnotation[0].points?.length || 0;
          if (length / 2 > polyPoints) {
            length -= 2;
          }
          data.points = [
            ...(newAnnotation[0].points?.slice(0, length) || []),
            endX,
            endY,
          ];
      }

      setNewAnnotation([data]);
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
  const annotationsToDraw = [...annotations, ...newAnnotation];
  console.log(annotationsToDraw);
  return (
    <>
      <Toolbar onSelect={onToolbarSelect} onColorSelect={setColor} />
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
            var scaleBy = 1.05;
            const stage = e.target?.getStage();
            // var pointer = stage?.getPointerPosition();
            if (!stage || !groupRef.current) return;
            var oldScale = stage.scaleX();

            // var mousePointTo = {
            //   x: (pointer.x - stage.x()) / oldScale,
            //   y: (pointer.y - stage.y()) / oldScale,
            // };

            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? 1 : -1;

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
              direction = -direction;
            }

            var newScale =
              direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            const scaleVal = { x: newScale, y: newScale };
            stage.scale(scaleVal);
            // var newPos = {
            //   x: pointer.x - mousePointTo.x * newScale,
            //   y: pointer.y - mousePointTo.y * newScale,
            // };
            // stage.position(newPos);
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
                        onChange={(newAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = newAttrs;
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
                        onChange={(newAttrs) => {
                          const r = annotationsToDraw.slice();
                          r[index] = newAttrs;
                          setAnnotations(r);
                        }}
                      />
                    );
                  case "pin":
                    return (
                      <Pin
                        key={index}
                        shapeProps={{ ...shape }}
                        isSelected={index === selectedId}
                        onSelect={() => {
                          if (!isDrawable(currentTool)) selectShape(index);
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
                          if (!isDrawable(currentTool)) selectShape(index);
                        }}
                        shapeProps={{
                          ...shape,
                          width: shape.width ?? 0,
                          height: shape.height ?? 0,
                        }}
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
            </Group>
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default Main;
