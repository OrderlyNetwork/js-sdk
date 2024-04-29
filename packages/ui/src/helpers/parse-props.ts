export const parseSizeProps = <
  T extends {
    width?: number | string;
    height?: number | string;
    [key: string]: any;
  }
>(
  props: T
) => {
  const { width, height, ...rest } = props;

  return {
    ...rest,
    style: {
      ...rest.style,
      "--oui-width": typeof width === "number" ? `${width}px` : width,
      "--oui-height": typeof height === "number" ? `${height}px` : height,
    },
  } as const;
};
