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
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <NetworkImage {...props.main} />
      <NetworkImage
        {...props.sub}
        className="absolute bottom-0 right-0 outline outline-2 outline-base-100 z-10"
        rounded
      />
    </div>
  );
};
