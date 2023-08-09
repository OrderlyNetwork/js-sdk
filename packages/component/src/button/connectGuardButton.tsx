import { FC, PropsWithChildren, ReactNode } from "react";
import { useUserInfo } from "@orderly/hooks";

export interface ConnectGuardButtonProps {
  placeholder?: ReactNode;
}

export const ConnectGuardButton: FC<
  PropsWithChildren<ConnectGuardButtonProps>
> = (props) => {
  const { connected } = useUserInfo();
  if (!connected) {
    return <div>ConnectGuardButton</div>;
  }
  return <div>{props.children}</div>;
};
