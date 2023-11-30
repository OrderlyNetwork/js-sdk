import React from "react";
import type { FC, PropsWithChildren, ReactNode } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import Button from ".";

export interface SiginGuardButtonProps {
  placeholder?: ReactNode;
}

export const SiginGuardButton: FC<PropsWithChildren<SiginGuardButtonProps>> = (
  props
) => {
  const { state } = useAccount();

  // const connected = false;
  if (state.status === AccountStatusEnum.NotSignedIn) {
    if (typeof props.placeholder === "undefined") {
      return (
        <Button fullWidth onClick={() => {}} type="button">
          Connect wallet
        </Button>
      );
    }
    return <>{props.placeholder}</>;
  }

  return <div>{props.children}</div>;
};
