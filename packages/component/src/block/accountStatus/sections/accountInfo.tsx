import { Blockie } from "@/avatar";
import Button, { IconButton } from "@/button";
import React, { FC, useCallback, useContext, useMemo } from "react";
import { Text } from "@/text";
import { useAccount, useMutation, useConfig, usePrivateQuery, OrderlyContext } from "@orderly.network/hooks";
import { toast } from "@/toast";
import { modal } from "@/modal";
import { AccountStatusEnum } from "@orderly.network/types";
import { WalletConnectSheet } from "@/block/walletConnect";
import { ArrowRightIcon, CopyIcon } from "@/icon";
import { useGetChains } from "./useGetChains";
import { type ConfigStore } from "@orderly.network/core";
import { Divider } from "@/divider";
import { Statistic } from "@/statistic";
import { OrderlyAppContext } from "@/provider";
import { commify } from "@orderly.network/utils";


export interface AccountInfoProps {
  onDisconnect?: () => void;
  accountId?: string;
  close?: () => void;
  showGetTestUSDC?: boolean;
}

export const AccountInfo: FC<AccountInfoProps> = (props) => {
  const { onDisconnect } = props;
  const { account, state } = useAccount();
  // const [loading,setLoading] = React.useState(false);
  const config = useConfig<ConfigStore>();

  const [getTestUSDC, { isMutating }] = useMutation(
    `${config.get("operatorUrl")}/v1/faucet/usdc`
  );

  const chainName = useGetChains();

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(state.address!).then(() => {
      toast.success("Copied to clipboard");
    });
  }, [state]);

  const onGetClick = useCallback(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      return modal.show(WalletConnectSheet, {
        status: state.status,
      });
    }

    return getTestUSDC({
      chain_id: account.wallet?.chainId.toString(),
      user_address: state.address,
      broker_id: config.get("brokerId"),
    }).then(
      (res: any) => {
        if (res.success) {
          props.close?.();
          return modal.confirm({
            title: "Get test USDC",
            content:
              "1,000 USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",
            onOk: () => {
              return Promise.resolve();
            },
          });
        }
        res.message && toast.error(res.message);
        // return Promise.reject(res);
      },
      (error: Error) => {
        toast.error(error.message);
      }
    );
  }, [state]);

  return (
    <div id="orderly-account-info">
      <div className="orderly-flex orderly-py-6">
        <div className="orderly-flex-1 orderly-flex orderly-items-center orderly-gap-2">
          <Blockie address={state.address!} />
          <div className="orderly-flex orderly-flex-col">
            <Text className="orderly-text-xs" rule={"address"}>
              {account.address}
            </Text>
            <div className="orderly-text-4xs orderly-text-base-contrast-80">
              {chainName}
            </div>
          </div>
        </div>
        <div className="orderly-flex orderly-items-center orderly-gap-2">
          <IconButton type="button" onClick={onCopy} className="orderly-px-0">
            <CopyIcon size={40} />
          </IconButton>
          {/* <IconButton>
            <Share size={20} />
          </IconButton> */}
        </div>
      </div>
      <ReferralInfo />
      {props.showGetTestUSDC ? (
        <div className="orderly-py-4 orderly-grid orderly-grid-cols-2 orderly-gap-3">
          <Button
            variant={"outlined"}
            onClick={onGetClick}
            disabled={isMutating}
            loading={isMutating}
            className="orderly-text-xs orderly-text-primary orderly-font-bold orderly-border-primary hover:orderly-bg-transparent hover:orderly-text-primary-light"
          >
            Get test USDC
          </Button>

          <Button
            variant={"outlined"}
            color={"danger"}
            fullWidth
            className="orderly-text-xs orderly-font-bold orderly-text-danger-light orderly-border-danger-light hover:orderly-bg-transparent hover:orderly-text-danger-light"
            onClick={() => {
              onDisconnect?.();
            }}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="orderly-py-4 orderly-flex orderly-justify-center">
          <Button
            variant={"outlined"}
            color={"danger"}
            fullWidth
            className="orderly-text-xs orderly-font-bold orderly-text-danger-light orderly-border-danger-light hover:orderly-bg-transparent hover:orderly-text-danger-light"
            onClick={() => {
              onDisconnect?.();
            }}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};


const ReferralInfo = () => {

  const { referral } = useContext(OrderlyAppContext);

  const clickReferral = useCallback(() => {
    referral?.onClickReferral?.();
  }, [referral?.onClickReferral]);


  const {
    data
  } = usePrivateQuery<any>("/v1/referral/info", {
    revalidateOnFocus: true,
  });
  const commission = useMemo(() => {
    if (!data) return "-";

    return data.referee_info?.["30d_referee_rebate"] + data.referrer_info?.["30d_referrer_rebate"];
  }, [data]);

  const {
    data: volumeStatistics
  } = usePrivateQuery<any>("/v1/volume/user/stats", {

    revalidateOnFocus: true,
  });

  const vol = useMemo(() => {
    if (volumeStatistics && data) {
      return volumeStatistics?.perp_volume_last_30_days || 0 + data.referrer_info?.["30d_referee_volume"];
    }

    return "-";

  }, [data, volumeStatistics]);

  if (referral?.saveRefCode !== true) {
    return <></>;
  }

  return (
    <div className="orderly-bg-base-600 orderly-rounded-lg orderly-p-3 orderly-mb-3">
      <div className="orderly-flex orderly-items-center orderly-cursor-pointer" onClick={clickReferral}>
        <div className="orderly-flex-1">Referral</div>
        <ArrowRightIcon size={14} fillOpacity={1} className="orderly-fill-primary" />
      </div>
      <Divider className="orderly-py-3" />
      <div className="orderly-grid orderly-grid-cols-2">
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-mt-1 orderly-text-[16px]"
          label="30d commission"
          value={(commission)}
          precision={2}
          rule="price"
        />
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-mt-1 orderly-text-[16px]"
          label="30d vol."
          value={(vol)}
          precision={2}
          rule="price"
        />
      </div>
    </div>
  );
}