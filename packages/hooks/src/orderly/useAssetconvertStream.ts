/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import useSWRSubscription from "swr/subscription";
import { getTimestamp } from "@orderly.network/utils";
import { useWS } from "../useWS";

export const useAssetconvertEvent = (options: {
  onMessage: (data: any) => void;
}) => {
  const { onMessage } = options;

  const ws = useWS();

  useEffect(() => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "assetconvert",
        event: "subscribe",
        topic: "assetconvert",
        ts: getTimestamp(),
      },
      { onMessage: onMessage },
    );
    return () => unsubscribe();
  }, []);
};
