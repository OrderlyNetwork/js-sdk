import React, { useEffect, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { Button, formatAddress, Text } from "@orderly.network/ui";
import { useWalletConnector } from "@orderly.network/hooks";
import { usePrivyWallet } from "../usePrivyWallet";
import { RenderPrivyTypeIcon } from "./common";

export function UserCenter(props: any) {
 
  const { accountState: state, } = props;
  return (
    <RenderUserCenter state={state} />
  )
}

export const MwebUserCenter = (props: any) => {
  console.log('xxxx mweb user center', props);
  const { state, } = props;

  return (
    <RenderUserCenter state={state} />
  )
}


const RenderUserCenter = (props: any) => {
  const { state, } = props;
  const { connect, wallet } = useWalletConnector();
  const { linkedAccount } = usePrivyWallet();
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
            .then((r: any) => {
              console.log("*****", r);
            })
            .catch((e: any) => console.error(e));
        }}
      >
        Connect wallet
      </Button>
    );
  }
  // if (accountStatus.status <= ) {}
  if (!wallet) {
    return
  }
  return (
    <div onClick={() => connect()} >
        <Button
          size="md"
          variant="gradient"
          angle={45}
          data-testid="oui-testid-nav-bar-address-btn"
          className="oui-flex oui-items-center oui-justify-center oui-gap-2"
        >
          {linkedAccount &&
            <RenderPrivyTypeIcon type={linkedAccount.type} size={18} />
          }
          <Text.formatted rule="address" className="oui-text-[rgba(0,0,0,.88)]">
            {formatAddress(wallet.accounts[0].address)}
          </Text.formatted>
        </Button>
      </div>


  )
}
