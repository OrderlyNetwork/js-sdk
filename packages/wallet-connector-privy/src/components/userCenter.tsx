import React, { useEffect, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { Button, formatAddress, Text, useScreen } from "@orderly.network/ui";
import { useWalletConnector } from "@orderly.network/hooks";
import { usePrivyWallet } from "../providers/privyWalletProvider";
import { RenderPrivyTypeIcon } from "./common";
import { useTranslation } from "@orderly.network/i18n";
import { AuthGuard } from "@orderly.network/ui-connector";

export function UserCenter(props: any) {
  const { accountState: state } = props;
  return (
    <RenderUserCenter state={state} disabledConnect={props.disabledConnect} />
  );
}

export const MwebUserCenter = (props: any) => {
  const { state } = props;

  return (
    <RenderUserCenter state={state} disabledConnect={props.disabledConnect} />
  );
};

const RenderUserCenter = (props: any) => {
  const { state } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const { connect, wallet } = useWalletConnector();
  const { linkedAccount } = usePrivyWallet();

  const disabled = state.validating || props.disabledConnect;

  // if (accountStatus.status <= ) {}
  if (state.status === AccountStatusEnum.EnableTradingWithoutConnected) {
    return (
      <Button
        size="md"
        variant="gradient"
        angle={45}
        data-testid="oui-testid-nav-bar-address-btn"
        className="oui-flex oui-items-center oui-justify-center oui-gap-2"
      >
        <Text.formatted rule="address" className="oui-text-[rgba(0,0,0,.88)]">
          {formatAddress(state.address!, [4, 4])}
        </Text.formatted>
      </Button>
    );
  }
  if (state.status <= AccountStatusEnum.NotConnected || disabled) {
    return (
      <Button
        data-testid="oui-testid-nav-bar-connectWallet-btn"
        size="md"
        variant={disabled ? undefined : "gradient"}
        angle={45}
        className="wallet-connect-button"
        loading={state.validating}
        disabled={disabled}
        onClick={() => {
          connect()
            .then((r: any) => {
              console.log("*****", r);
            })
            .catch((e: any) => console.error(e));
        }}
      >
        {t("connector.connectWallet")}
      </Button>
    );
  }

  if (!wallet) {
    return;
  }
  if (isMobile) {
    return (
      <AuthGuard
        buttonProps={{
          size: "sm",
        }}
      >
        <div onClick={() => connect()}>
          <Button
            size="sm"
            variant="gradient"
            angle={45}
            data-testid="oui-testid-nav-bar-address-btn"
            className="oui-flex oui-items-center oui-justify-center oui-gap-2"
          >
            {linkedAccount && (
              <RenderPrivyTypeIcon
                type={linkedAccount.type}
                size={18}
                black={true}
              />
            )}
            <Text.formatted
              rule="address"
              className="oui-text-[rgba(0,0,0,.88)]"
            >
              {formatAddress(wallet.accounts[0].address)}
            </Text.formatted>
          </Button>
        </div>
      </AuthGuard>
    );
  }
  return (
    <div onClick={() => connect()}>
      <Button
        size="md"
        variant="gradient"
        angle={45}
        data-testid="oui-testid-nav-bar-address-btn"
        className="oui-flex oui-items-center oui-justify-center oui-gap-2"
      >
        {linkedAccount && (
          <RenderPrivyTypeIcon
            type={linkedAccount.type}
            size={18}
            black={true}
          />
        )}
        <Text.formatted rule="address" className="oui-text-[rgba(0,0,0,.88)]">
          {formatAddress(wallet.accounts[0].address)}
        </Text.formatted>
      </Button>
    </div>
  );
};
