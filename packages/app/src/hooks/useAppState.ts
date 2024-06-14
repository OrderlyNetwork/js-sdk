import { useEffect } from "react";
import {
  useAccount,
  useKeyStore,
  useWalletConnector,
} from "@orderly.network/hooks";

export const useAppState = () => {
  const keyStore = useKeyStore();
  // restore account state
  useEffect(() => {
    console.log("current address:", keyStore.getAddress());
  }, []);
};
