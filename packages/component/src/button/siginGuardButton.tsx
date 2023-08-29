import type { FC, PropsWithChildren, ReactNode } from "react";
import { useAccount } from "@orderly.network/hooks";
import React from "react";

export interface SiginGuardButtonProps {
  placeholder?: ReactNode;
}

export const SiginGuardButton: FC<PropsWithChildren<SiginGuardButtonProps>> = (
  props
) => {
  const { connected } = useAccount();
  if (!connected) {
    return <div>SiginGuardButton</div>;
  }
  return <div>{props.children}</div>;
};
