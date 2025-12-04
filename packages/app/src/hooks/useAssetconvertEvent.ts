import { useEffect } from "react";
import { useWS } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { toast } from "@veltodefi/ui";
import { getTimestamp } from "@veltodefi/utils";

export const useAssetconvertEvent = () => {
  const ws = useWS();
  const { t } = useTranslation();
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
            toast.success(t("transfer.convert.completed"));
          }
        },
      },
    );
    return () => unsubscribe();
  }, []);
};
