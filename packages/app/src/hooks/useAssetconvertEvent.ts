import { useEffect } from "react";
import { useEventEmitter, useWS } from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { getTimestamp } from "@orderly.network/utils";

export const useAssetconvertEvent = () => {
  const ws = useWS();
  const ee = useEventEmitter();

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
            if (data.convertedQty === 0) {
              toast.error(i18n.t("transfer.convert.failed"));
            } else if (data.convertedQty > 0) {
              toast.success(i18n.t("transfer.convert.completed"));
            }
            ee.emit("assetconvert:changed", data);
          }
        },
      },
    );
    return () => unsubscribe();
  }, [ee, ws]);
};
