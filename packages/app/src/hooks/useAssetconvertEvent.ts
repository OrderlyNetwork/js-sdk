import { useEffect } from "react";
import { useWS } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { toast } from "@kodiak-finance/orderly-ui";
import { getTimestamp } from "@kodiak-finance/orderly-utils";

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
