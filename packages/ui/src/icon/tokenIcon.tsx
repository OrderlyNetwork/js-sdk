import { FC, useMemo } from "react";
import { Avatar } from "../avatar";
import { AvatarSizeType } from "../avatar/avatar";

export type TokenIconProps = {
  size?: AvatarSizeType;
  name?: string;
  symbol?: string;
  className?: string;
};

export const TokenIcon: FC<TokenIconProps> = (props) => {
  const url = useMemo(() => {
    let name = props.name;
    if (typeof props.symbol === "string") {
      const arr = props.symbol?.split("_");
      name = arr[1];
    }
    return `https://oss.orderly.network/static/symbol_logo/${name}.png`;
  }, [props.name, props.symbol]);

  return (
    <Avatar
      size={props.size}
      src={url}
      alt={props.name}
      className={props.className}
    />
  );
};
