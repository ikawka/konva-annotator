import scaleRatio from "./scale-ratio";

export interface FitImageToStageProps {
  imageSize: {
    width: number;
    height: number;
  };
  stageSize: {
    width: number;
    height: number;
  };
  padding?: number;
}

const fitImageToStage = (props: FitImageToStageProps) => {
  const { imageSize, stageSize, padding = 0 } = props;
  const ratio = scaleRatio(
    stageSize.width,
    stageSize.height,
    imageSize.width,
    imageSize.height
  );
  const initialWidth = imageSize.width * ratio - padding;
  const initialHeight = imageSize.height * ratio - padding;
  return {
    width: initialWidth,
    height: initialHeight,
  };
};

export default fitImageToStage;
