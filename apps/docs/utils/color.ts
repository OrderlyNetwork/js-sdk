import chroma from "chroma-js";

export const hexToRgb = (hex: string): number[] => {
  const color = chroma(hex);
  return color.rgb();
};

export const rgbToHex = (rgb: string): string => {
  const color = chroma(`rgb(${rgb.replaceAll(" ", ",")})`);
  return color.hex();
};
