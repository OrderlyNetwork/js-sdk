import { FC, useMemo } from "react";
import { NetworkImage, NetworkImageProps } from "./networkImage";
import { getSize } from "./utils";

export interface CombineProps {
  main: NetworkImageProps;
  sub: NetworkImageProps;
}

export const Combine: FC<CombineProps> = (props) => {
  const size = useMemo(() => {
    return getSize(props.main.size);
  }, [props.main.size]);

  return (
    <div
      className="orderly-relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <NetworkImage {...props.main} />
      <NetworkImage
        {...props.sub}
        className="orderly-absolute orderly-bottom-0 orderly-right-0 orderly-outline orderly-outline-2 orderly-outline-base-100 orderly-z-10"
        rounded
      />
    </div>
  );
};
