import { useEffect } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";

export const useBootstrap = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);
};
