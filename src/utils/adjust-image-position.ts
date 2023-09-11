interface AdjustPositionProps {
  x: number;
  y: number;
  scale: number;
  imageSize: {
    width: number;
    height: number;
  };
  stageSize: {
    width: number;
    height: number;
  };
}

//recenter
const adjustImagePosition = (props: AdjustPositionProps) => {
  const { x, y, scale, imageSize, stageSize } = props;
  const width = imageSize.width * scale;
  const height = imageSize.height * scale;
  const centerWidth = width / 2;
  const centerHeight = height / 2;
  const centerStageWidth = stageSize.width / 2;
  const centerStageHeight = stageSize.height / 2;

  let nextX = x;
  let nextY = y;
  if (width < stageSize.width) {
    nextX = centerStageWidth - centerWidth;
  }

  if (x > 0 && width > stageSize.width) {
    nextX = 0;
  }

  if (Math.abs(x) > width - stageSize.width && width > stageSize.width) {
    nextX = stageSize.width - width;
  }

  if (height < stageSize.height) {
    nextY = centerStageHeight - centerHeight;
  }

  if (y > 0 && height > stageSize.height) {
    nextY = 0;
  }

  if (Math.abs(y) > height - stageSize.height && height > stageSize.height) {
    nextY = stageSize.height - height;
  }

  return {
    x: nextX,
    y: nextY,
  };
};

export default adjustImagePosition;
