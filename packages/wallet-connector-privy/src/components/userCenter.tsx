import React, { useEffect, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { Button } from "@orderly.network/ui";

export function UserCenter(props: any) {
  const { accountState: state } = props;
  if (state.status <= AccountStatusEnum.NotConnected || state.validating) {
    return (
      <Button
        data-testid="oui-testid-nav-bar-connectWallet-btn"
        size="md"
        variant="gradient"
        angle={45}
        className="wallet-connect-button"
        loading={state.validating}
        disabled={state.validating}
        onClick={() => {
          props
            .connect()
            .then((r) => {
              console.log("*****", r);
            })
            .catch((e) => console.error(e));
        }}
      >
        Connect wallet
      </Button>
    );
  }
  // if (accountStatus.status <= ) {}
  return <div>user center</div>;
}
