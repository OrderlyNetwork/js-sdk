import { AccountStatusEnum } from "@orderly.network/types";
import {
  Box,
  EmptyDataState,
} from "@orderly.network/ui";
import { PropsWithChildren } from "react";
import { AuthGuard } from "./authGuard";

type AuthGuardProps = {
  /** default value is
   * ```ts
   * {
   *   connectWallet: "Please connect wallet before starting to trade",
   *   signIn: "Please sign in before starting to trade",
   *   enableTrading: "Please sign in before starting to trade",
   *   wrongNetwork: "Please switch to a supported network to continue.",
   * }
   * ```
   */
  hint?: {
    connectWallet?: string;
    signIn?: string;
    enableTrading?: string;
    wrongNetwork?: string;
  };
  status?: AccountStatusEnum;
};

const AuthGuardEmpty = (props: PropsWithChildren<AuthGuardProps>) => {
  const {
    hint = {
      connectWallet: "Please connect wallet before starting to trade",
      signIn: "Please sign in before starting to trade",
      enableTrading: "Please sign in before starting to trade",
      wrongNetwork: "Please switch to a supported network to continue.",
    },
    status,
  } = props;

  return (
    <Box my={8}>
      <AuthGuard status={status} descriptions={{...hint, switchChain: hint.wrongNetwork}}>
        {props.children || <EmptyDataState />}
      </AuthGuard>
    </Box>
  );
};

AuthGuardEmpty.displayName = "AuthGuardEmpty";

export { AuthGuardEmpty };
