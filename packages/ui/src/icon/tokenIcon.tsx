import { Avatar } from "../avatar";
import { FC, useMemo } from "react";
import { ExcludeXsSizeType, SizeType } from "../helpers/sizeType";

export type TokenIconProps = {
  size?: SizeType;
  name: string;
  className?: string;
};

export const TokenIcon: FC<TokenIconProps> = (props) => {
  const url = useMemo(() => {
    return `https://oss.orderly.network/static/symbol_logo/${props.name}.png`;
  }, [props.name]);
  return (
    <Avatar
      size={props.size}
      src={url}
      alt={props.name}
      className={props.className}
    />
  );
};
