import { useMemo, useRef } from "react";
import {
  useAccount,
  useConfig,
  useMutation,
  useWalletConnector,
} from "@orderly.network/hooks";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { isTestnet } from "@orderly.network/utils";
import { modal, toast } from "@orderly.network/ui";

export function useFaucetScript() {
  const { connectedChain, namespace } = useWalletConnector();
  const { state, account } = useAccount();
  const config = useConfig();
  const operatorUrl = useMemo(() => {
    const operatorUrl = config.get<string>("operatorUrl");
    return operatorUrl;
    // if (typeof operatorUrlObj === "object") {
    //   if (namespace === ChainNamespace.solana) {
    //     return operatorUrlObj["solana"];
    //   } else {
    //     return operatorUrlObj["evm"];
    //   }
    // }
    // throw Error(
    //   "Operator url should be Object, need solana and evm operator url"
    // );
  }, [config]);

  const [getTestUSDC, { isMutating }] = useMutation(
    `${operatorUrl}/v1/faucet/usdc`
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
    const message = `${
      namespace === ChainNamespace.solana ? "100" : "1,000"
    } USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.`;

    return getTestUSDC({
      chain_id: account.walletAdapter?.chainId.toString(),
      user_address: state.address,
      broker_id: config.get("brokerId"),
    }).then(
      (res) => {
        loadingRef.current = false;
        if (res.success) {
          return modal.alert({
            title: "Get test USDC",
            message,
            onOk: () => {
              return new Promise((resolve) => resolve(true));
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
