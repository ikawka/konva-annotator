import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

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

const ToolTip = () => {
  return (
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
  );
};
export default ToolTip;
