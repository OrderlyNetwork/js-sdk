import { useEffect, useRef, useState } from "react";
import { API, nativeTokenAddress } from "@veltodefi/types";

const retryInterval = 3000;

export function useNativeBalance(options: {
  fetchBalance: (token: string, decimal: number) => Promise<string>;
  targetChain?: API.Chain;
}) {
  const { fetchBalance, targetChain } = options;
  const [balance, setBalance] = useState<string>();

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const loopGetTokenBalance = async (timeout = 0) => {
    const decimal = targetChain?.network_infos?.currency_decimal;

    if (typeof fetchBalance !== "function" || !decimal) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      fetchBalance(nativeTokenAddress, decimal)
        .then((balance) => {
          console.log("native balance", balance);
          setBalance(balance);
        })
        .catch((error) => {
          console.error("fetch native balance error", error);
          loopGetTokenBalance(retryInterval);
        });
    }, timeout);
  };

  useEffect(() => {
    // get balance first, no timeout
    loopGetTokenBalance(0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return balance;
}
