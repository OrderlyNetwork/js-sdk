import { FC } from "react";
import { Button, formatAddress } from "@orderly.network/ui";
import { AccountState } from "./account.script";
import { AuthGuard } from "@orderly.network/ui-connector";

export const Account: FC<AccountState> = (props) => {
  return (
    <AuthGuard
      buttonProps={{
        size: "sm",
      }}
    >
      <Button
        variant="gradient"
        size={"sm"}
        className="oui-max-w-[83px]"
        onClick={(e) => {
          props.onShowAccountSheet();
        }}
      >
        {formatAddress(props.address!, [4, 4])}
      </Button>
    </AuthGuard>
  );
};
