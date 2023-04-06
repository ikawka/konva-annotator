import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faLocationDot,
  faArrowRight,
  faDrawPolygon,
  faArrowPointer,
  IconDefinition,
  faPenAlt,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Tool } from "../types";
import { isStrokable } from "../utils";

const Button = styled.button`
  all: unset;
  cursor: pointer;
  min-width: 32px;
  min-height: 32px;
  text-align: center;
  &.selected {
    background-color: #c0c0c0;
  }
  &:hover {
    background-color: #cccccc;
  }
`;

const Color = styled.input.attrs({ type: "color" })`
  all: unset;
  width: 32px;
  height: 32px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  :hover,
  :focus {
    border-color: #c0c0c0;
  }
`;

const Stroke = styled.input.attrs({ type: "number" })`
  all: unset;
  width: 36px;
  height: 32px;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  :hover,
  :focus {
    border-color: #c0c0c0;
  }
  :disabled {
    color: #c0c0c0;
  }
`;

type Tools = {
  [key in Tool]: IconDefinition;
};
interface ToolbarProps {
  onSelect: (selected: Tool) => void;
  onColorSelect?: (color: string) => void;
  onStroWidthkeSet?: (strokeWidth: number) => void;
  onZoom?: (direction: number) => void;
}

const strokeWidthMin = 1;
const strokeWidthMax = 10;

const Toolbar = ({
  onSelect,
  onColorSelect,
  onStroWidthkeSet,
  onZoom,
}: ToolbarProps) => {
  const [selected, setSelected] = useState<Tool>();
  const [color, setColor] = useState<string>("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [zooming, setZoooming] = useState<any>(null);

  const tools: Tools = {
    pointer: faArrowPointer,
    rect: faSquare,
    pin: faLocationDot,
    arrow: faArrowRight,
    poly: faDrawPolygon,
    freehand: faPenAlt,
  };

  useEffect(() => {
    if (selected) onSelect(selected);
  }, [selected, onSelect]);

  useEffect(() => {
    if (onColorSelect) onColorSelect(color);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  useEffect(() => {
    if (onStroWidthkeSet) onStroWidthkeSet(strokeWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokeWidth]);

  useEffect(() => {
    setSelected("pointer");
    setStrokeWidth(3);
  }, []);

  return (
    <div
      style={{
        width: 700,
        margin: "auto",
        backgroundColor: "#fcfcfc",
        fontSize: 18,
      }}
    >
      <div style={{ display: "flex", padding: "8px 0", gap: 4 }}>
        {(Object.keys(tools) as Tool[]).map((item) => {
          return (
            <Button
              key={item}
              onClick={() => setSelected(item)}
              className={selected === item ? "selected" : undefined}
            >
              <FontAwesomeIcon icon={tools[item]} />
            </Button>
          );
        })}
        <div style={{ width: 10 }} />

        <Color value={color} onChange={(e) => setColor(e.target.value)} />
        <Stroke
          value={strokeWidth}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val < strokeWidthMin || val > strokeWidthMax) return;
            setStrokeWidth(val);
          }}
          min={strokeWidthMin}
          max={strokeWidthMax}
          disabled={!isStrokable(selected)}
        />
        <div style={{ width: 10 }} />
        <Button
          onMouseDown={() => {
            if (onZoom) {
              setZoooming(
                setInterval(() => {
                  onZoom(1);
                }, 50)
              );
            }
          }}
          onMouseUp={() => {
            clearInterval(zooming);
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </Button>
        <Button
          onMouseDown={() => {
            if (onZoom) {
              setZoooming(
                setInterval(() => {
                  onZoom(-1);
                }, 50)
              );
            }
          }}
          onMouseUp={() => {
            clearInterval(zooming);
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
