export function hexToRgb(hex) {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    console.error("Invalid HEX color format");
    return null;
  }

  let color = hex.substring(1);

  if (color.length === 3) {
    color = color
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  return [r, g, b];

  // 5. 返回 RGB 字符串
  //   return `rgb(${r}, ${g}, ${b})`;
}

export function rgbToHex(rgb) {
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function isColorValue(value: string) {
  return (
    value.startsWith("--oui-color") ||
    (value.startsWith("--oui-gradient") &&
      !["stop-start", "stop-end", "angle"].some((item) => value.endsWith(item)))
  );
}
