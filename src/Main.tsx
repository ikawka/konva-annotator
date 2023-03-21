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

const Main = () => {
  const [image] = useImage(bg);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<Konva.Group>(null);

  const [dimension, updateDimension] = useState<StageDimension>({
    width: 0,
    height: 0,
  });
  const [annotations, setAnnotations] = useState<ShapeProp[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<ShapeProp[]>([]);
  const [selectedId, selectShape] = useState<number>(-1);
  const [currentTool, setCurrentTool] = useState<Tool>("pointer");

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
      groupRef.current
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
      };
      if (currentTool === "pin") {
        data.x = startX - pinWidth / 2;
        data.y = startY - pinHeight;
      }

      if (currentTool === "arrow") {
        data.points = [startX, startY, startX, startY];
      }
      setNewAnnotation([data]);
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent>) => {
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
      };

      if (currentTool === "arrow") {
        annotationToAdd = {
          points: [sx, sy, endX, endY],
          x: sx,
          y: sy,
          key: `${annotations.length + 1}`,
          tool: currentTool,
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
      };
      if (currentTool === "pin") {
        data.x = endX - pinWidth / 2;
        data.y = endY - pinHeight;
      }

      if (currentTool === "arrow") {
        data.points = [startX, startY, endX, endY];
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
  return (
    <>
      <Toolbar onSelect={onToolbarSelect} />
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
            <Group draggable={!isDrawable(currentTool)} ref={groupRef}>
              <Image
                image={image}
                x={0}
                y={0}
                onClick={() => selectShape(-1)}
              />
              {annotationsToDraw.map((shape, index) => {
                switch (shape.tool) {
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
