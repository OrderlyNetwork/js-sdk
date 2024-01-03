import { useCallback, useMemo, useState } from "react";
import { useHoldingStream } from "./useHoldingStream";
import { Decimal } from "@orderly.network/utils";
import { useCollateral } from "./useCollateral";
import { useAccount } from "../useAccount";

export const useWithdraw = () => {
  const { account, state } = useAccount();

  const [isLoading, setIsLoading] = useState(false);

  const { unsettledPnL, availableBalance, freeCollateral } = useCollateral();

  // const withdrawQueue = useRef<number[]>([]);

  const withdraw = useCallback(
    (inputs: {
      chainId: number;
      token: string;
      amount: number;
      allowCrossChainWithdraw: boolean;
    }): Promise<any> => {
      return account.assetsManager.withdraw(inputs).then((res: any) => {
        // if (res.success) {
        //   withdrawQueue.current.push(res.data.withdraw_id);
        // }
        return res;
      });
    },
    [state]
  );

  const { usdc } = useHoldingStream();

  // useEffect(() => {
  //   const unsubscribe = ws.privateSubscribe(
  //     {
  //       id: "wallet",
  //       event: "subscribe",
  //       topic: "wallet",
  //       ts: Date.now(),
  //     },
  //     {
  //       onMessage: (data: any) => {
  //         //
  //         const { id } = data;

  //         if (withdrawQueue.current.includes(id)) {
  //           withdrawQueue.current = withdrawQueue.current.filter(
  //             (item) => item !== id
  //           );
  //           ee.emit("withdraw:success", data);
  //         }
  //       },
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);

  const maxAmount = useMemo(() => {
    // if (!usdc || !usdc.holding) return 0;

    // if (unsettledPnL >= 0) return usdc?.holding ?? 0;

    // return new Decimal(usdc.holding).add(unsettledPnL).toNumber();

    return freeCollateral;
  }, [freeCollateral]);

  return { withdraw, isLoading, maxAmount, availableBalance, unsettledPnL };
};
