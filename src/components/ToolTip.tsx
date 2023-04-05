import {
  faComment,
  faCommentMedical,
  faTrash,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { Label } from "react-konva";
import { Html } from "react-konva-utils";
import { Position } from "../types";
import { TOOLTIP_BG_COLOR } from "../constants";

const ToolTipContainer = styled.div<{ withComment?: boolean }>`
  background: ${TOOLTIP_BG_COLOR};
  color: white;
  padding: 8px 8px;
  font-size: 18px;
  border-radius: 4px;
  ${(props) => (props.withComment ? `min-width: 250px;` : "")}
  max-width: 250px;
  position: relative;
  & button {
    all: unset;
    cursor: pointer;
    width: 24px;
    height: 24px;
    text-align: center;
  }
`;

const Arrow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  transform: rotate(45deg);
  box-sizing: border-box;
  border-left: 4px solid ${TOOLTIP_BG_COLOR};
  border-top: 4px solid ${TOOLTIP_BG_COLOR};
  border-right: 4px solid transparent;
  border-bottom: 4px solid transparent;
  top: -4px;
  z-index: -1;
`;

const Comment = styled.div`
  position: relative;
  background: #fcfcfc;
  color: #000000;
  padding: 4px;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 8px;
`;

interface ToolTipProps {
  position: Position;
  enableComments?: boolean; // set default to true
  comment?: object[];
}

const ToolTip = ({
  position,
  enableComments = true,
  comment = [],
}: ToolTipProps) => {
  return (
    <Label {...position}>
      <Html
        transformFunc={(attr) => {
          return { ...attr, scaleX: 1, scaleY: 1 };
        }}
      >
        <ToolTipContainer
          role="tooltip"
          withComment={enableComments && comment.length > 0}
        >
          {!enableComments && comment.length === 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {enableComments && (
                <button>
                  <FontAwesomeIcon icon={faComment} />
                </button>
              )}
              <button>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          )}
          {enableComments && comment.length > 0 && (
            <>
              <div>
                {comment.map((c: any, index) => {
                  return (
                    <Comment key={index}>
                      <div
                        style={{
                          position: "absolute",
                          right: 4,
                          top: 4,
                          color: "#333",
                          fontSize: 16,
                        }}
                      >
                        <button>
                          <FontAwesomeIcon icon={faXmarkCircle} />
                        </button>
                      </div>
                      <div>{c.comment}</div>
                    </Comment>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <button>
                  <FontAwesomeIcon icon={faCommentMedical} />
                </button>
                <button>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </>
          )}
          <Arrow data-popper-arrow />
        </ToolTipContainer>
      </Html>
    </Label>
  );
};
export default ToolTip;
