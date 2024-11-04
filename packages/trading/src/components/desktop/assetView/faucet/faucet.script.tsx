import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  useMutation,
  useWalletConnector,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { isTestnet } from "@orderly.network/utils";
import { modal, toast } from "@orderly.network/ui";

export function useFaucetScript() {
  const { connectedChain } = useWalletConnector();
  const { state, account } = useAccount();
  const config = useConfig();

  const [getTestUSDC, { isMutating }] = useMutation(
    `${config.get("operatorUrl")}/v1/faucet/usdc`
  );
  const loadingRef = useRef(false);

  const showFaucet = useMemo(() => {
    if (!connectedChain || !connectedChain.id) {
      return false;
    }
    return (
      state.status === AccountStatusEnum.EnableTrading &&
      isTestnet(parseInt(connectedChain.id as string))
    );
  }, [state, connectedChain]);

  const getFaucet = () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;

    return getTestUSDC({
      chain_id: account.walletAdapter?.chainId.toString(),
      user_address: state.address,
      broker_id: config.get("brokerId"),
    }).then(
      (res) => {
        loadingRef.current = false;
        if (res.success) {
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
      },
      (error: Error) => {
        toast.error(error.message);
      }
    );
  };
  return { getFaucet, showFaucet };
}

export type FaucetState = ReturnType<typeof useFaucetScript>;
