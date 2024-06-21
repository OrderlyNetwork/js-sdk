import { Avatar } from "../avatar/avatar";
import { FC, useMemo } from "react";

export type CoinIconProps = {
  size?: "sm" | "md" | "lg" | "xl";
  name: string;
  className?: string;
};

export const CoinIcon: FC<CoinIconProps> = (props) => {
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
