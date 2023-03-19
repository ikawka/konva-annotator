import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faLocationDot,
  faArrowRight,
  faDrawPolygon,
  faArrowPointer,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TippyProps } from "@tippyjs/react";
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

export type Tool = "pointer" | "rect" | "pin" | "arrow" | "poly";

type Tools = {
  [key in Tool]: IconDefinition;
};
interface ToolbarProps {
  onSelect: (selected: Tool) => void;
}

const Toolbar = ({ onSelect }: ToolbarProps) => {
  const [selected, setSelected] = useState<Tool>();

  const tools: Tools = {
    pointer: faArrowPointer,
    rect: faSquare,
    pin: faLocationDot,
    arrow: faArrowRight,
    poly: faDrawPolygon,
  };

  useEffect(() => {
    if (selected) onSelect(selected);
  }, [selected]);

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
      </div>
    </div>
  );
};

export default Toolbar;
