const scaleRatio = (cw: number, ch: number, pw: number, ph: number) => {
  return ch / cw > ph / pw ? cw / pw : ch / ph;
};

export default scaleRatio;
