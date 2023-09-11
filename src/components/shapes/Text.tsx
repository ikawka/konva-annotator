import { useRef } from "react";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Text as KonvaText } from "react-konva";
import { ShapeProp } from "../../types";
import Transformer from "../Transformer";
interface Props {
  shapeProp: ShapeProp;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (props: any) => void;
  parentScale: number;
}

const Text = ({
  shapeProp,
  isSelected,
  onChange,
  onSelect,
  parentScale,
}: Props) => {
  const shapeRef = useRef<Konva.Text>(null);
  console.log(isSelected);
  return (
    <>
      <KonvaText
        ref={shapeRef}
        x={shapeProp.x}
        y={shapeProp.y}
        onClick={onSelect}
        text="Hello Bacon"
        fill="white"
        fontSize={20}
        draggable={isSelected}
      />
      {isSelected && shapeProp.isDone && (
        <Transformer
          nodes={[shapeRef.current]}
          enabledAnchors={["middle-left", "middle-right"]}
        />
      )}
    </>
  );
};

export default Text;
