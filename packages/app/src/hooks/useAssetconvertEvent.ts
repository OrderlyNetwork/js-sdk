import { useEffect } from "react";
import { useWS } from "@orderly.network/hooks";
// import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { getTimestamp } from "@orderly.network/utils";

export const useAssetconvertEvent = () => {
  const ws = useWS();
  // const { t } = useTranslation();
  useEffect(() => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "assetconvert",
        event: "subscribe",
        topic: "assetconvert",
        ts: getTimestamp(),
      },
      {
        onMessage(data) {
          if (data.convertId) {
            toast.success("Convert Completed");
          }
        },
      },
    );
    return () => unsubscribe();
  }, []);
};
