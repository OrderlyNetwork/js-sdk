import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { Either } from "@orderly.network/ui";
import { PropsWithChildren, ReactElement } from "react";

type AuthGuardProps = {
  fallback?: ReactElement;
  /**
   * Required state to be satisfied
   */
  status?: AccountStatusEnum;
};

const AuthGuard = (props: PropsWithChildren<AuthGuardProps>) => {
  const { status = AccountStatusEnum.EnableTrading } = props;
  const { state } = useAccount();
  return (
    <Either value={status == state.status} left={props.fallback}>
      {props.children}
    </Either>
  );
};

AuthGuard.displayName = "AuthGuard";

export { AuthGuard };
