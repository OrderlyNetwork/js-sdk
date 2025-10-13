import { useEffect, useRef, useState } from "react";
import { API } from "@kodiak-finance/orderly-types";

const retryInterval = 1000;

export function useBalance(
  token: API.TokenInfo,
  fetchBalance?: (token: string, decimals: number) => Promise<any>,
  open?: boolean,
) {
  const [balance, setBalance] = useState<string>("");
  const balanceRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const loopGetTokenBalance = async (timeout = 0) => {
    if (loading || typeof fetchBalance !== "function" || !token.address) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (balanceRef.current === "") {
      // when balance is empty, set loading to true
      setLoading(true);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const balance = await fetchBalance(token.address!, token.decimals!);
        setBalance(balance);
        balanceRef.current = balance;
        console.log("balance", token.symbol, token.address, balance);
      } catch (err) {
        console.error("get balance error", token.symbol, token.address, err);
        // when fetch balance failed, retry
        loopGetTokenBalance(retryInterval);
      } finally {
        if (balanceRef.current !== "") {
          setLoading(false);
        }
      }
    }, timeout);
  };

  useEffect(() => {
    if (open) {
      // get balance first, no timeout
      loopGetTokenBalance(0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, open]);

  return { balance, loading };
}
