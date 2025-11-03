import React, { useMemo } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  ABSTRACT_CHAIN_ID_MAP,
  ABSTRACT_TESTNET_CHAINID,
  AccountStatusEnum,
} from "@orderly.network/types";
import {
  Button,
  cn,
  Flex,
  formatAddress,
  Text,
  useScreen,
} from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { usePrivyWallet } from "../providers/privy/privyWalletProvider";
import { RenderPrivyTypeIcon } from "./common";
import { LinkDeviceMobile } from "./linkDevice";

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
  const { state: accountState, account } = useAccount();
  const { connectedChain } = useWalletConnector();

  const disabled = state.validating || props.disabledConnect;

  const userAddress = useMemo(() => {
    if (
      connectedChain?.id &&
      ABSTRACT_CHAIN_ID_MAP.has(parseInt(connectedChain?.id as string))
    ) {
      return account.getAdditionalInfo()?.AGWAddress;
    }
    return account.address;
  }, [account, connectedChain, accountState]);

  // if (accountStatus.status <= ) {}
  if (state.status === AccountStatusEnum.EnableTradingWithoutConnected) {
    return (
      <Flex className="oui-bg-base-5 oui-px-[7px] oui-rounded-[6px] oui-gap-[6px]">
        <LinkDeviceMobile>
          <Text.formatted
            rule="address"
            className="oui-text-base-contrast oui-text-xs"
          >
            {formatAddress(userAddress!)}
          </Text.formatted>
        </LinkDeviceMobile>
      </Flex>
    );
  }
  if (state.status <= AccountStatusEnum.NotConnected || disabled) {
    return (
      <Button
        data-testid="oui-testid-nav-bar-connectWallet-btn"
        size="md"
        variant={disabled ? undefined : "gradient"}
        angle={45}
        className={cn(
          "wallet-connect-button",
          isMobile && "oui-font-semibold oui-px-2",
        )}
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
        {isMobile ? t("connector.connect") : t("connector.connectWallet")}
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
          size: "md",
        }}
      >
        <div onClick={() => connect()}>
          <Button
            size="md"
            data-testid="oui-testid-nav-bar-address-btn"
            className="oui-px-3 oui-py-[6px] oui-flex oui-items-center oui-justify-center oui-gap-1 oui-bg-base-4 oui-rounded-[6px]"
          >
            {linkedAccount && (
              <RenderPrivyTypeIcon
                type={linkedAccount.type}
                size={14}
                black={true}
              />
            )}
            <Text.formatted
              rule="address"
              className="oui-text-contrast oui-font-semibold oui-text-[14px] oui-leading-[20px] oui-tracking-[0.42px]"
            >
              {formatAddress(userAddress!)}
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
        data-testid="oui-testid-nav-bar-address-btn"
        className="oui-flex oui-items-center oui-justify-center oui-gap-1 oui-bg-base-4 oui-px-3 oui-py-[6px] oui-rounded-[6px]"
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
          className="oui-text-base-contrast oui-font-semibold oui-text-[14px] oui-leading-[20px] oui-tracking-[0.42px]"
        >
          {formatAddress(userAddress!)}
        </Text.formatted>
      </Button>
    </div>
  );
};
