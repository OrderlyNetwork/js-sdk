import { createContext, useCallback } from "react";
import { useAccount, useMutation } from "@orderly.network/hooks";
import { modal } from "@/modal";
import { toast } from "@/toast";

interface MarketContextState {
  getTestUSDC: () => Promise<any>;
}

export const MarketContext = createContext<MarketContextState>(
  {} as MarketContextState
);

export const MarketProvider = (props: any) => {
  const { account, state } = useAccount();
  const [doGetTestUSDC, { isMutating }] = useMutation(
    "https://testnet-operator-evm.orderly.org/v1/faucet/usdc"
  );

  const getTestUSDC = useCallback(() => {
    return modal
      .confirm({
        title: "Get test USDC",
        content:
          "We’re adding 1,000 test USDC to your balance, it will take up to 3 minutes to process. Please check later.",
        onOk: () => {
          return doGetTestUSDC({
            chain_id: account.wallet.chainId.toString(),
            user_address: state.address,
            broker_id: "woofi_dex",
          }).then((res: any) => {
            if (res.success) {
              toast.success("Get test USDC success");
            }
            return res;
          });
        },
      })
      .then(() => {
        console.log("get test usdc");
      });
  }, [state]);

  return (
    <MarketContext.Provider value={{ getTestUSDC }}></MarketContext.Provider>
  );
};
