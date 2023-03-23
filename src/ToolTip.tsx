import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { Label } from "react-konva";
import { Html } from "react-konva-utils";
import { Position } from "./types";

const ToolTipContainer = styled.div`
  background: #333;
  color: white;
  padding: 8px 8px;
  font-size: 18px;
  border-radius: 4px;
  min-width: 250px;
`;

const Arrow = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
  top: -4px;
`;

interface ToolTipProps {
  position: Position;
}

const ToolTip = ({ position }: ToolTipProps) => {
  return (
    <Label {...position}>
      <Html
        transformFunc={(attr) => {
          return { ...attr, scaleX: 1, scaleY: 1 };
        }}
      >
        <ToolTipContainer role="tooltip">
          <div>My tooltip</div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 16,
              padding: 4,
            }}
          >
            <FontAwesomeIcon icon={faPencil} />
            <FontAwesomeIcon icon={faTrash} />
          </div>
          <Arrow data-popper-arrow />
        </ToolTipContainer>
      </Html>
    </Label>
  );
};
export default ToolTip;
