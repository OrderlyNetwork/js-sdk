import { useMemo, type FC } from "react";
import { Avatar } from "../avatar/avatar";
export type WalletIconProps = {
  size?: "sm" | "md" | "lg";
  name: string;
};

export const WalletIcon: FC<WalletIconProps> = (props) => {
  const url = useMemo(() => {
    const split = props.name?.split(" ");
    const formatWalletName = split?.[0]?.toLowerCase();
    return `https://oss.orderly.network/static/wallet_icon/${formatWalletName}.png`;
  }, [props.name]);
  return <Avatar size={props.size} src={url} alt={`${props.name}`} />;
};
