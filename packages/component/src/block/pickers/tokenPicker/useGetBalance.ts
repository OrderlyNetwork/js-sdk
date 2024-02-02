import { API } from "@orderly.network/types";
import { useEffect, useState } from "react";

export function useGetBalance(
  token: API.TokenInfo,
  fetchBalance: (token: string, decimals: number) => Promise<any>
) {
  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    fetchBalance(token.address, token.decimals)
      .then(
        (balance) => {
          setBalance(balance);
        },
        (error) => {}
      )
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return { balance, loading };
}
