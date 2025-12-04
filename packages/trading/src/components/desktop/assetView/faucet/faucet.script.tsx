import { useMemo, useState } from "react";
import {
  useAccount,
  useConfig,
  useMutation,
  useWalletConnector,
} from "@veltodefi/hooks";
import { AccountStatusEnum, ChainNamespace } from "@veltodefi/types";
import { isTestnet } from "@veltodefi/utils";
import { modal, toast } from "@veltodefi/ui";
import { useTranslation } from "@veltodefi/i18n";

export function useFaucetScript() {
  const { t } = useTranslation();
  const { connectedChain, namespace } = useWalletConnector();
  const { state, account } = useAccount();
  const config = useConfig();
  const operatorUrl = config.get<string>("operatorUrl");

  const [getTestUSDC, { isMutating }] = useMutation(
    `${operatorUrl}/v1/faucet/usdc`
  );
  const [loading, setLoading] = useState<boolean>(false);

  const showFaucet = useMemo(() => {
    if (!connectedChain || !connectedChain.id) {
      return false;
    }
    return (
      (state.status === AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected) &&
      isTestnet(parseInt(connectedChain.id as string))
    );
  }, [state, connectedChain]);

  const getFaucet = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const message = t("trading.faucet.getTestUSDC.success", {
      quantity: namespace === ChainNamespace.solana ? "100" : "1,000",
    });

    return getTestUSDC({
      chain_id: account.walletAdapter?.chainId.toString(),
      user_address: state.address,
      broker_id: config.get("brokerId"),
    }).then(
      (res) => {
        setLoading(false);
        if (res.success) {
          return modal.alert({
            title: t("trading.faucet.getTestUSDC"),
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
  return { getFaucet, showFaucet, loading };
}

export type FaucetState = ReturnType<typeof useFaucetScript>;
