import React from "react";
import { Line } from "react-konva";
import { Anchor } from "./Anchor";
import { ShapeProp } from "./types";

interface Props {
  shapeProp: ShapeProp;
  cbIsOverStart: (isOverStart: boolean) => void;
}

const Polygon = ({ shapeProp, cbIsOverStart }: Props) => {
  // console.log(shapeProp.points);
  return (
    <>
      <Line
        points={shapeProp.points}
        stroke="red"
        strokeWidth={3}
        fill="rgba(255,255,255,0.5)"
        closed={true}
      />
      <Anchor
        visible
        x={shapeProp.points?.[0] || 0}
        y={shapeProp.points?.[1] || 0}
        onMouseOver={(e) => {
          cbIsOverStart(true);
          e.target.scaleX(1.5);
          e.target.scaleY(1.5);
        }}
        onMouseOut={(e) => {
          cbIsOverStart(false);
          e.target.setAttrs({
            scaleX: 1,
            scaleY: 1,
          });
        }}
      />
    </>
  );
};

export default Polygon;
