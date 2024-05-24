// export interface LayoutSizeProps {
//   width?: number | string;
//   height?: number | string;
// }
export const parseSizeProps = <
  T extends {
    width?: number | string;
    height?: number | string;
    angle?: number;
    [key: string]: any;
  }
>(
  props: T
) => {
  const { width, height, angle, ...rest } = props;

  return {
    ...rest,
    style: {
      ...rest.style,
      "--oui-width": typeof width === "number" ? `${width}px` : width,
      "--oui-height": typeof height === "number" ? `${height}px` : height,
      "--oui-gradient-angle": angle ? `${angle}deg` : `180deg`,
    },
  } as const;
};
