import { FC, useMemo } from "react";
import { Avatar, AvatarImage } from "./avatar";
import makeBlockie from "ethereum-blockies-base64";

interface Props {
  address: string;
}

export const Blockie: FC<Props> = (props) => {
  const src = useMemo(() => makeBlockie(props.address), [props.address]);
  return (
    <Avatar>
      <AvatarImage src={src} alt={props.address} />
    </Avatar>
  );
};
