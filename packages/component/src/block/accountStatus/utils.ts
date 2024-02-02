export function getMarginRatioColor(marginRatio: number, mmr: number | null) {
  if (mmr === null) {
    return { isRed: false, isYellow: false, isGreen: true };
  }
  const imr = mmr * 2;

  const isRed = marginRatio <= imr;
  const isYellow = marginRatio > imr && marginRatio < 1;
  const isGreen = marginRatio >= 1;
  return { isRed, isYellow, isGreen };
}
