import { ShapeProp, Tool } from "../types";

interface ShapeGeneratorProps {
  shape: ShapeProp;
  nextShape?: ShapeProp;
  tool: Tool;
}

const generateShapeData = (props: ShapeGeneratorProps) => {
  const { shape, tool } = props;
  const { x: startX, y: startY } = shape;
  let data = shape;

  switch (tool) {
    case "pin":
      data.x = startX;
      data.y = startY;
      data.strokeWidth = 0;
      break;
    case "arrow":
      data.points = [startX, startY, startX, startY];
      break;
    case "poly":
      data.points = [startX, startY];
      break;
    case "freehand":
      data.points = [startX, startY];
      data.x = 0;
      data.y = 0;
  }
  return data;
};

export default generateShapeData;
