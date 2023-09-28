import useConstant from "use-constant";
import { useAccountInstance } from "./useAccountInstance";
import { useMemo } from "react";

export const useWallet = () => {
  const account = useAccountInstance();

  return useMemo(() => {
    // return account.
  }, []);
};
