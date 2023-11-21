import { createContext, useCallback } from "react";
import { useAccount, useMutation, useConfig } from "@orderly.network/hooks";
import { modal } from "@/modal";
import { toast } from "@/toast";
import { type ConfigStore } from "@orderly.network/core";

interface MarketContextState {
  getTestUSDC: () => Promise<any>;
}

export const MarketContext = createContext<MarketContextState>(
  {} as MarketContextState
);

export const MarketProvider = (props: any) => {
  const { account, state } = useAccount();
  const config = useConfig<ConfigStore>();
  const [doGetTestUSDC, { isMutating }] = useMutation(
    `${config.get("operatorUrl")}/v1/faucet/usdc`
  );

  const brokerId = config.get("brokerId");

  const getTestUSDC = useCallback(() => {
    return doGetTestUSDC({
      chain_id: account.wallet?.chainId.toString(),
      user_address: state.address,
      broker_id: brokerId,
    })
      .then((res: any) => {
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
        return Promise.reject(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
        // res.message && toast.error(res.message);
      });
  }, [state]);

  return (
    <MarketContext.Provider value={{ getTestUSDC }}></MarketContext.Provider>
  );
};
