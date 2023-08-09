import type { FC, PropsWithChildren, ReactNode } from "react";
import { useUserInfo } from "@orderly/hooks";

export interface SiginGuardButtonProps {
  placeholder?: ReactNode;
}

export const SiginGuardButton: FC<PropsWithChildren<SiginGuardButtonProps>> = (
  props
) => {
  const { connected } = useUserInfo();
  if (!connected) {
    return <div>SiginGuardButton</div>;
  }
  return <div>{props.children}</div>;
};
