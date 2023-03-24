import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faLocationDot,
  faArrowRight,
  faDrawPolygon,
  faArrowPointer,
  IconDefinition,
  faPenAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styled from "styled-components";

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
`;

export type Tool = "pointer" | "rect" | "pin" | "arrow" | "poly" | "freehand";

type Tools = {
  [key in Tool]: IconDefinition;
};
interface ToolbarProps {
  onSelect: (selected: Tool) => void;
  onColorSelect?: (color: string) => void;
}

const Toolbar = ({ onSelect, onColorSelect }: ToolbarProps) => {
  const [selected, setSelected] = useState<Tool>();
  const [color, setColor] = useState<string>("#ff0000");

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
    setSelected("pointer");
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
      <div style={{ display: "flex", padding: "8px 0" }}>
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
      </div>
    </div>
  );
};

export default Toolbar;
